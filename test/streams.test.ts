/* eslint-disable @typescript-eslint/no-floating-promises */

import { createReadStream } from 'fs'
import t from 'tap'
import { stream } from '../src'
import { FastImageError, ImageInfo } from '../src/models'

type Test = typeof t

const fileName = import.meta.url.replace('file://', '')
const imagePath = new URL('fixtures/image.png', import.meta.url).toString().replace('file://', '')

t.test('fastimage.stream', (t: Test) => {
  t.test('should emit info event when info are ready', (t: Test) => {
    const input = createReadStream(imagePath, { highWaterMark: 200 })

    const pipe = input.pipe(stream())

    pipe.on('info', (data: ImageInfo) => {
      t.same(data, {
        width: 150,
        height: 150,
        type: 'png',
        time: data.time,
        analyzed: 200
      })

      t.end()
    })
  })

  t.test('should emit error event in case of errors', (t: Test) => {
    const input = createReadStream(fileName)

    const pipe = input.pipe(stream())

    pipe.on('error', (error: FastImageError) => {
      t.strictSame(error, new FastImageError('Unsupported data.', 'UNSUPPORTED'))

      t.end()
    })
  })

  t.test('should accept the threshold option', (t: Test) => {
    const input = createReadStream(imagePath, { highWaterMark: 1 })

    const pipe = input.pipe(stream({ threshold: 10 }))

    pipe.on('error', (error: FastImageError) => {
      t.strictSame(error, new FastImageError('Unsupported data.', 'UNSUPPORTED'))

      t.end()
    })
  })

  t.end()
})
