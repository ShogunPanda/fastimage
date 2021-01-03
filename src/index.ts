import { HTTPError, Response } from 'got'
import { Stream, Writable, WritableOptions } from 'stream'
import { Callback, ensurePromiseCallback } from './callback'
import { handleData, handleError, toStream } from './internals'
import { defaultOptions, FastImageError, ImageInfo, Options } from './models'
import { FastImageStream } from './stream'

export function info(
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
  let response: Response
  let buffer = Buffer.alloc(0)
  const [callback, promise] = ensurePromiseCallback(cb)
  const start = process.hrtime.bigint()

  // Make sure the source is always a Stream
  let stream: Stream
  let url: string | undefined
  try {
    ;[stream, url] = toStream(source, timeout, threshold, userAgent)
  } catch (e) {
    callback(e)
    return promise!
  }

  // When dealing with URLs, save the response to extract data later
  stream!.on('response', (r: Response) => {
    response = r
  })

  stream!.on('data', (chunk: Buffer) => {
    if (finished) {
      return
    }

    buffer = Buffer.concat([buffer, chunk])
    finished = handleData(buffer, response, threshold, start, callback)
  })

  stream!.on('error', (error: FastImageError | HTTPError) => {
    callback(handleError(error, url!))
  })

  stream!.on('end', () => {
    if (finished) {
      return
    }

    // We have reached the end without figuring the image type. Just give up
    callback(new FastImageError('Unsupported data.', 'UNSUPPORTED'))
  })

  return promise!
}

export function stream(options?: Partial<Options> & Partial<WritableOptions>): Writable {
  return new FastImageStream(options ?? {})
}
