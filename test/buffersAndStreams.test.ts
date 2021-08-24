/* eslint-disable @typescript-eslint/no-floating-promises */

import { createReadStream, readFileSync } from 'fs'
import t from 'tap'
import { info } from '../src'
import { FastImageError } from '../src/models'

type Test = typeof t

const fileName = import.meta.url.replace('file://', '')
const imagePath = new URL('fixtures/image.png', import.meta.url).toString().replace('file://', '')

t.test('fastimage.info', (t: Test) => {
  t.test('when working with buffers', (t: Test) => {
    t.test('should return the information of a image', async (t: Test) => {
      const buffer = readFileSync(imagePath)

      const data = await info(buffer)

      t.same(data, {
        width: 150,
        height: 150,
        type: 'png',
        time: data.time,
        analyzed: 24090
      })
    })

    t.test('should return a error when the data is not a image', async (t: Test) => {
      const buffer = readFileSync(fileName)

      await t.rejects(info(buffer), new FastImageError('Unsupported data.', 'UNSUPPORTED'))
    })

    t.end()
  })

  t.test('when working with streams', (t: Test) => {
    t.test('should return the information of a image', async (t: Test) => {
      const data = await info(createReadStream(imagePath))

      t.same(data, {
        width: 150,
        height: 150,
        type: 'png',
        time: data.time,
        analyzed: 24090
      })
    })

    t.test('should return a error when the data is not a image', async (t: Test) => {
      await t.rejects(info(fileName), new FastImageError('Unsupported data.', 'UNSUPPORTED'))
    })

    t.end()
  })

  t.end()
})
