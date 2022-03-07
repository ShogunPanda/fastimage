/* eslint-disable @typescript-eslint/no-floating-promises */

import { createReadStream, readFileSync } from 'node:fs'
import t from 'tap'
import { info } from '../src/index.js'
import { FastImageError } from '../src/models.js'

const fileName = import.meta.url.replace('file://', '')
const imagePath = new URL('fixtures/image.png', import.meta.url).toString().replace('file://', '')

t.test('fastimage.info', t => {
  t.test('when working with buffers', t => {
    t.test('should return the information of a image', async t => {
      const buffer = readFileSync(imagePath)

      const data = await info(buffer)

      t.same(data, {
        width: 150,
        height: 150,
        type: 'png',
        time: data.time,
        analyzed: 24_090
      })
    })

    t.test('should return a error when the data is not a image', async t => {
      const buffer = readFileSync(fileName)

      await t.rejects(info(buffer), new FastImageError('Unsupported data.', 'UNSUPPORTED'))
    })

    t.end()
  })

  t.test('when working with streams', t => {
    t.test('should return the information of a image', async t => {
      const data = await info(createReadStream(imagePath))

      t.same(data, {
        width: 150,
        height: 150,
        type: 'png',
        time: data.time,
        analyzed: 24_090
      })
    })

    t.test('should return a error when the data is not a image', async t => {
      await t.rejects(info(fileName), new FastImageError('Unsupported data.', 'UNSUPPORTED'))
    })

    t.end()
  })

  t.end()
})
