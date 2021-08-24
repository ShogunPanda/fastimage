import EventEmitter from 'events'
import { createReadStream } from 'fs'
import { IncomingHttpHeaders } from 'http'
import imageSize from 'image-size'
import { Readable, Stream } from 'stream'
import undici from 'undici'
import { Callback } from './callback'
import { FastImageError, ImageInfo } from './models'

const realUrlHeader = 'x-fastimage-real-url'

export async function toStream(
  source: string | Stream | Buffer,
  timeout: number,
  threshold: number,
  userAgent: string,
  aborter: EventEmitter
): Promise<[Stream, string | undefined, IncomingHttpHeaders | undefined]> {
  let url: string | undefined
  let headers: IncomingHttpHeaders | undefined
  const highWaterMark = threshold > 0 ? Math.floor(threshold / 10) : 1024

  // If the source is a buffer, get it as stream
  if (Buffer.isBuffer(source)) {
    source = Readable.from(source, { highWaterMark })
  } else if (typeof source === 'string') {
    // Try to parse the source as URL - If it succeeds, we will fetch it
    try {
      const parsedUrl = new URL(source)

      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        throw new FastImageError('Invalid URL.', 'URL_ERROR', parsedUrl.toString())
      }

      url = source

      const {
        statusCode,
        headers: responseHeaders,
        body,
        context
      } = await undici.request(parsedUrl, {
        method: 'GET',
        headers: { 'user-agent': userAgent },
        signal: aborter,
        dispatcher: new undici.Agent({
          headersTimeout: timeout,
          bodyTimeout: timeout,
          maxRedirections: 10,
          pipelining: 0
        })
      })

      if (statusCode > 299) {
        throw new FastImageError(`Remote host replied with HTTP ${statusCode}.`, 'NETWORK_ERROR', url)
      }

      source = body
      headers = responseHeaders
      headers[realUrlHeader] = (context as any).history.pop().toString()
    } catch (e) {
      if ((e as FastImageError).code === 'FASTIMAGE_URL_ERROR') {
        throw e
      } else if (url) {
        throw handleError(e, url)
      }

      // Parsing failed. Treat as local file
      source = createReadStream(source as string, { highWaterMark })
    }
  }

  return [source, url, headers]
}

export function handleData(
  buffer: Buffer,
  headers: IncomingHttpHeaders | undefined,
  threshold: number,
  start: bigint,
  aborter: EventEmitter,
  callback: Callback
): boolean {
  try {
    const info = imageSize(buffer)

    const data: ImageInfo = {
      width: info.width!,
      height: info.height!,
      type: info.type!,
      time: Number(process.hrtime.bigint() - start) / 1e6,
      analyzed: buffer.length
    }

    // Add URL informations
    if (headers) {
      data.realUrl = headers[realUrlHeader] as string

      if ('content-length' in headers) {
        data.size = parseInt(headers['content-length']!, 10)
      }
    }

    // Close the URL if possible
    aborter.emit('abort')

    callback(null, data)
    return true
  } catch (e) {
    // Check threshold
    if (threshold > 0 && buffer.length > threshold) {
      aborter.emit('abort')

      callback(new FastImageError('Unsupported data.', 'UNSUPPORTED'))
      return true
    }

    return false
  }
}

export function handleError(error: FastImageError, url: string): Error {
  let message = null
  let code = 'NETWORK_ERROR'

  switch (error.code) {
    case 'EISDIR':
      code = 'FS_ERROR'
      message = 'Source is a directory.'
      break
    case 'ENOENT':
      code = 'FS_ERROR'
      message = 'Source not found.'
      break
    case 'EACCES':
      code = 'FS_ERROR'
      message = 'Source is not readable.'
      break
    case 'ENOTFOUND':
      message = 'Invalid remote host requested.'
      break
    /* c8 ignore next 2 */
    case 'ECONNRESET':
    case 'EPIPE':
    case 'UND_ERR_SOCKET':
      message = 'Connection with the remote host interrupted.'
      break
    case 'ECONNREFUSED':
      message = 'Connection refused from the remote host.'
      break
    /* c8 ignore next */
    case 'ETIMEDOUT':
    case 'UND_ERR_HEADERS_TIMEOUT':
      message = 'Connection to the remote host timed out.'
      break
  }

  if (message) {
    error = new FastImageError(message, code, url)
  }

  return error
}
