/* eslint-disable @typescript-eslint/no-floating-promises */

import { deepStrictEqual, ifError } from 'node:assert'
import { chmodSync, existsSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { test } from 'node:test'
import { info } from '../src/index.js'
import { FastImageError } from '../src/models.js'

const fileName = import.meta.url.replace('file://', '')
const imagePath = new URL('fixtures/image.png', import.meta.url).toString().replace('file://', '')

test('fastimage.info', async () => {
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
      info(dirname(fileName), (error, data) => {
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

    await test('should return a error when the path cannot be read', () => {
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
      info(fileName, (error, data) => {
        ifError(data)
        deepStrictEqual(error, new FastImageError('Unsupported data.', 'UNSUPPORTED'))
      })
    })
  })
})
