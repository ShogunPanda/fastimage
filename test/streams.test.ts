import { deepStrictEqual } from 'node:assert'
import { createReadStream } from 'node:fs'
import { resolve } from 'node:path'
import { test } from 'node:test'
import { FastImageError, stream } from '../src/index.ts'

test('fastimage.stream', async () => {
  const imagePath = resolve(import.meta.dirname, 'fixtures/image.png')

  await test('should emit info event when info are ready', () => {
    const input = createReadStream(imagePath, { highWaterMark: 200 })

    const pipe = input.pipe(stream())

    pipe.on('info', data => {
      deepStrictEqual(data, {
        width: 150,
        height: 150,
        type: 'png',
        time: data.time,
        analyzed: 200
      })
    })
  })

  await test('should emit error event in case of errors', () => {
    const input = createReadStream(import.meta.filename)

    const pipe = input.pipe(stream())

    pipe.on('error', error => {
      deepStrictEqual(error, new FastImageError('Unsupported data.', 'UNSUPPORTED'))
    })
  })

  await test('should accept the threshold option', () => {
    const input = createReadStream(imagePath, { highWaterMark: 1 })

    const pipe = input.pipe(stream({ threshold: 10 }))

    pipe.on('error', error => {
      deepStrictEqual(error, new FastImageError('Unsupported data.', 'UNSUPPORTED'))
    })
  })
})
