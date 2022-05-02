import EventEmitter from 'node:events'
import { Stream, Writable, WritableOptions } from 'node:stream'
import { Callback, ensurePromiseCallback } from './callback.js'
import { handleData, handleError, toStream } from './internals.js'
import { defaultOptions, FastImageError, ImageInfo, Options } from './models.js'
import { FastImageStream } from './stream.js'

export { defaultOptions, FastImageError } from './models.js'

export async function info(
  source: string | Stream | Buffer,
  options?: Partial<Options> | Callback,
  cb?: Callback
): Promise<ImageInfo> {
  // Normalize arguments
  if (typeof options === 'function') {
    cb = options
    options = {}
  }

  const { timeout, threshold, userAgent } = { ...defaultOptions, ...options }

  // Prepare execution
  let finished = false
  let buffer = Buffer.alloc(0)
  const [callback, promise] = ensurePromiseCallback(cb)
  const start = process.hrtime.bigint()

  // Make sure the source is always a Stream
  try {
    const aborter = new EventEmitter()
    const [stream, url, headers] = await toStream(source, timeout, threshold, userAgent, aborter)

    stream.on('data', chunk => {
      if (finished) {
        return
      }

      buffer = Buffer.concat([buffer, chunk])
      finished = handleData(buffer, headers, threshold, start, aborter, callback)
    })

    stream.on('error', error => {
      callback(handleError(error, url!))
    })

    stream.on('end', () => {
      if (finished) {
        return
      }

      // We have reached the end without figuring the image type. Just give up
      callback(new FastImageError('Unsupported data.', 'UNSUPPORTED'))
    })

    return promise!
  } catch (error) {
    callback(error)
    return promise!
  }
}

export function stream(options?: Partial<Options> & Partial<WritableOptions>): Writable {
  return new FastImageStream(options ?? {})
}
