// The version is dynamically generated via build script in order not rely on require in the ESM case.

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
    this.name = 'FastImageError'
    this.code = `FASTIMAGE_${code}`
    this.url = url
    this.httpResponseCode = httpResponseCode
  }
}

// Since it's harder to keep this in sync with package.json, let's use a different number.
export const userAgentVersion = '1.0.0'

export const defaultOptions: Options = {
  timeout: 30_000,
  threshold: 4096,
  userAgent: `fastimage/${userAgentVersion}`
}
