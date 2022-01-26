import { ImageInfo } from './models'

export type Callback = (error: Error | null, info?: ImageInfo) => void
type PromiseResolver<T> = (value: T) => void
type PromiseRejecter = (error: Error) => void

export function ensurePromiseCallback(callback?: Callback): [Callback, Promise<ImageInfo>?] {
  if (typeof callback === 'function') {
    return [callback]
  }

  let promiseResolve: PromiseResolver<ImageInfo>, promiseReject: PromiseRejecter

  const promise = new Promise<ImageInfo>((resolve, reject) => {
    promiseResolve = resolve
    promiseReject = reject
  })

  return [
    (err, info) => {
      if (err) {
        return promiseReject(err)
      }

      return promiseResolve(info!)
    },
    promise
  ]
}
