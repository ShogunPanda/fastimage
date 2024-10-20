import { deepStrictEqual, rejects } from 'node:assert'
import { createReadStream, readFileSync } from 'node:fs'
import { test } from 'node:test'
import { info } from '../src/index.js'
import { FastImageError } from '../src/models.js'

const fileName = import.meta.url.replace('file://', '')
const imagePath = new URL('fixtures/image.png', import.meta.url).toString().replace('file://', '')

test('fastimage.info', async () => {
  await test('when working with buffers', async () => {
    await test('should return the information of a image', async () => {
      const buffer = readFileSync(imagePath)

      const data = await info(buffer)

      deepStrictEqual(data, {
        width: 150,
        height: 150,
        type: 'png',
        time: data.time,
        analyzed: 24_090
      })
    })

    await test('should return a error when the data is not a image', async () => {
      const buffer = readFileSync(fileName)

      await rejects(info(buffer), new FastImageError('Unsupported data.', 'UNSUPPORTED'))
    })
  })

  await test('when working with streams', async () => {
    await test('should return the information of a image', async () => {
      const data = await info(createReadStream(imagePath))

      deepStrictEqual(data, {
        width: 150,
        height: 150,
        type: 'png',
        time: data.time,
        analyzed: 24_090
      })
    })

    await test('should return a error when the data is not a image', async () => {
      await rejects(info(fileName), new FastImageError('Unsupported data.', 'UNSUPPORTED'))
    })
  })
})
