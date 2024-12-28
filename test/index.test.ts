import { rejects } from 'node:assert'
import { test } from 'node:test'
import { info } from '../src/index.js'
import { FastImageError } from '../src/models.js'

test('fastimage.info', async () => {
  await test('side cases', async () => {
    const url =
      'https://commons.wikimedia.org/wiki/Category:JPG_corruption_example_images#/media/File:JPEG_Corruption.jpg'

    await rejects(info(url), new FastImageError('Unsupported data.', 'UNSUPPORTED'))
  })
})
