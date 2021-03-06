import { Writable, WritableOptions } from 'stream'
import { handleData } from './internals'
import { defaultOptions, FastImageError, ImageInfo, Options } from './models'

export class FastImageStream extends Writable {
  buffer: Buffer
  threshold: number
  start: bigint
  finished: boolean

  constructor(options: Partial<Options> & WritableOptions) {
    super(options as WritableOptions)

    this.threshold = options.threshold ?? defaultOptions.threshold
    this.buffer = Buffer.alloc(0)
    this.start = process.hrtime.bigint()
    this.finished = false
  }

  analyze(chunk: Buffer): void {
    this.buffer = Buffer.concat([this.buffer, chunk])

    this.finished = handleData(
      this.buffer,
      undefined,
      this.threshold,
      this.start,
      (error: Error | null, data?: ImageInfo) => {
        if (error) {
          this.emit('error', error)
        } else {
          this.emit('info', data)
        }

        this.destroy()
      }
    )
  }

  _write(chunk: any, _e: BufferEncoding, cb: (error?: Error | null) => void): void {
    this.analyze(chunk)
    cb()
  }

  /* istanbul ignore next */
  _writev(chunks: Array<{ chunk: any }>, cb: (error?: Error | null) => void): void {
    for (const { chunk } of chunks) {
      this.analyze(chunk)
    }

    cb()
  }

  _final(cb: (error?: Error | null) => void): void {
    /* istanbul ignore if */
    if (this.finished) {
      cb()
      return
    }

    cb(new FastImageError('Unsupported data.', 'UNSUPPORTED'))
  }
}
