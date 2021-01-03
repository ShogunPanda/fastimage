/* eslint-disable @typescript-eslint/no-floating-promises */

import { chmodSync, unlinkSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import t from 'tap'
import { info } from '../src'
import { FastImageError, ImageInfo } from '../src/models'

type Test = typeof t

t.test('fastimage.info', (t: Test) => {
  t.test('when working with local files', (t: Test) => {
    t.test('should return the information of a image', (t: Test) => {
      info(resolve(__dirname, 'fixtures/image.png'), (error: Error | null, data?: ImageInfo) => {
        t.error(error)

        t.same(data, {
          width: 150,
          height: 150,
          type: 'png',
          time: data!.time,
          analyzed: 409
        })

        t.end()
      })
    })

    t.test('should return a error when the path is a directory', (t: Test) => {
      info(__dirname, (error: Error | null, data?: ImageInfo) => {
        t.error(data)
        t.strictSame(error, new FastImageError('Source is a directory.', 'FS_ERROR'))
        t.end()
      })
    })

    t.test('should return a error when the path cannot be found', (t: Test) => {
      info('/not/existent', (error: Error | null, data?: ImageInfo) => {
        t.error(data)
        t.strictSame(error, new FastImageError('Source not found.', 'FS_ERROR'))
        t.end()
      })
    })

    t.test('should return a error when the path cannot be read', (t: Test) => {
      const unreadablePath = resolve(__dirname, './fixtures/unreadable.png')
      writeFileSync(unreadablePath, 'foo', 'utf-8')
      chmodSync(unreadablePath, 0)

      info(unreadablePath, (error: Error | null, data?: ImageInfo) => {
        t.error(data)
        t.strictSame(error, new FastImageError('Source is not readable.', 'FS_ERROR'))
        t.end()

        unlinkSync(unreadablePath)
      })
    })

    t.test('should return a error when the path is not a image', (t: Test) => {
      info(__filename, (error: Error | null, data?: ImageInfo) => {
        t.error(data)
        t.strictSame(error, new FastImageError('Unsupported data.', 'UNSUPPORTED'))
        t.end()
      })
    })

    t.end()
  })

  t.end()
})
