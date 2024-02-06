/* eslint-disable @typescript-eslint/no-floating-promises */

import { deepStrictEqual, ok, rejects } from 'node:assert'
import { test } from 'node:test'
import { info } from '../src/index.js'
import { FastImageError } from '../src/models.js'

test('fastimage.info', async () => {
  await test('side cases', async () => {
    // This is a file which is corrupted. To correctly recognize the threshold must be disabled.
    await rejects(
      info(
        'https://upload.wikimedia.org/wikipedia/commons/b/b2/%27Journey_to_the_Center_of_the_Earth%27_by_%C3%89douard_Riou_38.jpg'
      ),
      new FastImageError('Unsupported data.', 'UNSUPPORTED')
    )

    const data = await info(
      'https://upload.wikimedia.org/wikipedia/commons/b/b2/%27Journey_to_the_Center_of_the_Earth%27_by_%C3%89douard_Riou_38.jpg',
      { threshold: 0 }
    )

    deepStrictEqual(data, {
      width: 980,
      height: 1448,
      type: 'jpg',
      time: data.time,
      analyzed: data.analyzed,
      realUrl:
        'https://upload.wikimedia.org/wikipedia/commons/b/b2/%27Journey_to_the_Center_of_the_Earth%27_by_%C3%89douard_Riou_38.jpg',
      size: 554_617
    })

    ok(data.analyzed < data.size)
  })
})
