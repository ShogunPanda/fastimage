/* eslint-disable @typescript-eslint/no-floating-promises */

import { createReadStream } from 'fs'
import { readFile } from 'fs/promises'
import { resolve } from 'path'
import t from 'tap'
import { info } from '../src'
import { FastImageError } from '../src/models'

type Test = typeof t

t.test('fastimage.info', (t: Test) => {
  t.test('when working with buffers', (t: Test) => {
    t.test('should return the information of a image', async (t: Test) => {
      const buffer = await readFile(resolve(__dirname, 'fixtures/image.png'))

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
      const buffer = await readFile(resolve(__filename))

      await t.rejects(info(buffer), new FastImageError('Unsupported data.', 'UNSUPPORTED'))
    })

    t.end()
  })

  t.test('when working with streams', (t: Test) => {
    t.test('should return the information of a image', async (t: Test) => {
      const data = await info(createReadStream(resolve(__dirname, 'fixtures/image.png')))

      t.same(data, {
        width: 150,
        height: 150,
        type: 'png',
        time: data.time,
        analyzed: 24090
      })
    })

    t.test('should return a error when the data is not a image', async (t: Test) => {
      await t.rejects(info(createReadStream(__filename)), new FastImageError('Unsupported data.', 'UNSUPPORTED'))
    })

    t.end()
  })

  t.end()
})
