/* eslint-disable @typescript-eslint/no-floating-promises */

import t from 'tap'
import { info } from '../src'
import { FastImageError } from '../src/models'

t.test('fastimage.info', t => {
  t.test('side cases', async t => {
    // This is a file which is corrupted. To correctly recognize the threshold must be disabled.
    await t.rejects(
      info(
        'https://upload.wikimedia.org/wikipedia/commons/b/b2/%27Journey_to_the_Center_of_the_Earth%27_by_%C3%89douard_Riou_38.jpg'
      ),
      new FastImageError('Unsupported data.', 'UNSUPPORTED')
    )

    const data = await info(
      'https://upload.wikimedia.org/wikipedia/commons/b/b2/%27Journey_to_the_Center_of_the_Earth%27_by_%C3%89douard_Riou_38.jpg',
      { threshold: 0 }
    )

    t.same(data, {
      width: 980,
      height: 1448,
      type: 'jpg',
      time: data.time,
      analyzed: data.analyzed,
      realUrl:
        'https://upload.wikimedia.org/wikipedia/commons/b/b2/%27Journey_to_the_Center_of_the_Earth%27_by_%C3%89douard_Riou_38.jpg',
      size: 554617
    })

    t.ok(data.analyzed < data.size!)
  })

  t.end()
})
