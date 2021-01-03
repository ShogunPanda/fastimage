export interface ImageInfo {
  width: number
  height: number
  type: string
  time: number
  analyzed: number
  realUrl?: string
  size?: number
}

export interface Options {
  timeout: number
  threshold: number
  userAgent: string
}

export class FastImageError extends Error {
  code: string
  url?: string
  httpResponseCode?: number

  constructor(message: string, code: string, url?: string, httpResponseCode?: number) {
    super(message)
    this.code = `FASTIMAGE_${code}`
    this.url = url
    this.httpResponseCode = httpResponseCode
  }
}

export const defaultOptions: Options = {
  timeout: 30000,
  threshold: 4096,
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  userAgent: `fastimage/${require('../package.json').version}`
}
