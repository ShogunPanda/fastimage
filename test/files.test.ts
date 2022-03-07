/* eslint-disable @typescript-eslint/no-floating-promises */

import { chmodSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import t from 'tap'
import { info } from '../src/index.js'
import { FastImageError } from '../src/models.js'

const fileName = import.meta.url.replace('file://', '')
const imagePath = new URL('fixtures/image.png', import.meta.url).toString().replace('file://', '')

t.test('fastimage.info', t => {
  t.test('when working with local files', t => {
    t.test('should return the information of a image', t => {
      info(imagePath, (error, data) => {
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

    t.test('should return a error when the path is a directory', t => {
      info(dirname(fileName), (error, data) => {
        t.error(data)
        t.strictSame(error, new FastImageError('Source is a directory.', 'FS_ERROR'))
        t.end()
      })
    })

    t.test('should return a error when the path cannot be found', t => {
      info('/not/existent', (error, data) => {
        t.error(data)
        t.strictSame(error, new FastImageError('Source not found.', 'FS_ERROR'))
        t.end()
      })
    })

    t.test('should return a error when the path cannot be read', t => {
      const unreadablePath = imagePath.replace('image.png', 'unreadable.png')
      writeFileSync(unreadablePath, 'foo', 'utf8')
      chmodSync(unreadablePath, 0)

      info(unreadablePath, (error, data) => {
        t.error(data)
        t.strictSame(error, new FastImageError('Source is not readable.', 'FS_ERROR'))
        t.end()

        unlinkSync(unreadablePath)
      })
    })

    t.test('should return a error when the path is not a image', t => {
      info(fileName, (error, data) => {
        t.error(data)
        t.strictSame(error, new FastImageError('Unsupported data.', 'UNSUPPORTED'))
        t.end()
      })
    })

    t.end()
  })

  t.end()
})
