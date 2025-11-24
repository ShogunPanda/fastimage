import { deepStrictEqual, ifError } from 'node:assert'
import { chmodSync, existsSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { test } from 'node:test'
import { FastImageError, info } from '../src/index.ts'

test('fastimage.info', async () => {
  const imagePath = resolve(import.meta.dirname, 'fixtures/image.png')

  await test('when working with local files', async () => {
    await test('should return the information of a image', () => {
      info(imagePath, (error, data) => {
        ifError(error)

        deepStrictEqual(data, {
          width: 150,
          height: 150,
          type: 'png',
          time: data!.time,
          analyzed: 409
        })
      })
    })

    await test('should return a error when the path is a directory', () => {
      info(dirname(import.meta.filename), (error, data) => {
        ifError(data)
        deepStrictEqual(error, new FastImageError('Source is a directory.', 'FS_ERROR'))
      })
    })

    await test('should return a error when the path cannot be found', () => {
      info('/not/existent', (error, data) => {
        ifError(data)
        deepStrictEqual(error, new FastImageError('Source not found.', 'FS_ERROR'))
      })
    })

    await test('should return a error when the path cannot be read', { skip: process.platform === 'win32' }, () => {
      const unreadablePath = imagePath.replace('image.png', 'unreadable.png')

      if (!existsSync(unreadablePath)) {
        writeFileSync(unreadablePath, 'foo', 'utf8')
        chmodSync(unreadablePath, 0)
      }

      info(unreadablePath, (error, data) => {
        ifError(data)
        deepStrictEqual(error, new FastImageError('Source is not readable.', 'FS_ERROR'))

        unlinkSync(unreadablePath)
      })
    })

    await test('should return a error when the path is not a image', () => {
      info(import.meta.filename, (error, data) => {
        ifError(data)
        deepStrictEqual(error, new FastImageError('Unsupported data.', 'UNSUPPORTED'))
      })
    })
  })
})
