import { deepStrictEqual, rejects } from 'node:assert'
import { createReadStream, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { test } from 'node:test'
import { FastImageError, info } from '../src/index.ts'

test('fastimage.info', async () => {
  const imagePath = resolve(import.meta.dirname, 'fixtures/image.png')

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
      const buffer = readFileSync(import.meta.filename)

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
      await rejects(
        info(createReadStream(import.meta.filename)),
        new FastImageError('Unsupported data.', 'UNSUPPORTED')
      )
    })
  })
})
