import { deepStrictEqual, ok, rejects } from 'node:assert'
import { readFileSync } from 'node:fs'
import { createServer as createHttpServer } from 'node:http'
import { createServer, type AddressInfo } from 'node:net'
import { resolve } from 'node:path'
import { test } from 'node:test'
import { FastImageError, info, userAgentVersion } from '../src/index.ts'

test('fastimage.info', async () => {
  const imagePath = resolve(import.meta.dirname, 'fixtures/image.png')

  await test('when working with URLS', async () => {
    await test('should return the information of a image', async () => {
      const data = await info('https://placehold.co/1000x1000')

      // This is to let the test pass if the server returns no Content-Length hader
      const size = data.size
      data.size = undefined

      deepStrictEqual(data, {
        width: 1000,
        height: 1000,
        type: 'svg',
        time: data.time,
        size: undefined,
        analyzed: data.analyzed,
        realUrl: 'https://placehold.co/1000x1000'
      })

      if (size) {
        deepStrictEqual(size, 3928)
        ok(data.analyzed < size)
      }
    })

    await test('should return a error when the host cannot be found', async () => {
      await rejects(
        info('https://placehold.invalid.co/1000x1000'),
        new FastImageError('Invalid remote host requested.', 'NETWORK_ERROR', 'https://placehold.invalid.co/1000x1000')
      )
    })

    await test('should return a error when the URL cannot be found', async () => {
      await rejects(
        info('https://placehold.co/invalid'),
        new FastImageError('Remote host replied with HTTP 404.', 'NETWORK_ERROR', 'https://placehold.co/invalid')
      )
    })

    await test('should return a error when the URL is not a image', async () => {
      await rejects(info('https://www.google.com/robots.txt'), new FastImageError('Unsupported data.', 'UNSUPPORTED'))
    })

    await test('should return a error when the URL is not a image when downloading the entire file', async () => {
      await rejects(
        info('https://www.google.com/robots.txt', { threshold: 0 }),
        new FastImageError('Unsupported data.', 'UNSUPPORTED')
      )
    })

    await test('should handle connection timeouts', async () => {
      const server = createServer(c => {})

      server.listen({ port: 0 })

      const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`

      await rejects(
        info(url, { timeout: 10 }),
        new FastImageError('Connection to the remote host timed out.', 'NETWORK_ERROR', url)
      )

      server.close()
    })

    await test('should handle connection failures', async () => {
      await rejects(
        info('http://127.0.0.1:65000/100x100'),
        new FastImageError(
          'Connection refused from the remote host.',
          'NETWORK_ERROR',
          'http://127.0.0.1:65000/100x100'
        )
      )
    })

    await test('should handle connection interruptions', async () => {
      const server = createServer(c => {
        c.end()
      })

      server.listen({ port: 0 })

      const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
      await rejects(info(url), new FastImageError('Connection with the remote host interrupted.', 'NETWORK_ERROR', url))

      server.close()
    })

    await test('should complain about invalid URLs.', async () => {
      await rejects(
        info('ftp://127.0.0.1:65000/100x100'),
        new FastImageError('Invalid URL.', 'URL_ERROR', 'ftp://127.0.0.1:65000/100x100')
      )
    })

    await test('should send the right user agent', async () => {
      const agents: string[] = []

      const server = createHttpServer((r, s) => {
        agents.push(r.headers['user-agent']!)
        s.end(readFileSync(imagePath))
      })

      server.listen({ port: 0 })

      const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`

      await info(url)
      await info(url, { userAgent: 'FOO' })

      server.close()

      deepStrictEqual(agents, [`fastimage/${userAgentVersion}`, 'FOO'])
    })
  })
})
