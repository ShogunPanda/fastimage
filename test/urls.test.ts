/* eslint-disable @typescript-eslint/no-floating-promises */

import { deepStrictEqual, ok, rejects } from 'node:assert'
import { readFileSync } from 'node:fs'
import { createServer as createHttpServer } from 'node:http'
import { createServer, type AddressInfo } from 'node:net'
import { test } from 'node:test'
import { info } from '../src/index.js'
import { FastImageError, userAgentVersion } from '../src/models.js'

test('fastimage.info', async () => {
  await test('when working with URLS', async () => {
    await test('should return the information of a image', async () => {
      const data = await info('http://fakeimg.pl/1000x1000/')

      deepStrictEqual(data, {
        width: 1000,
        height: 1000,
        type: 'png',
        time: data.time,
        analyzed: data.analyzed,
        realUrl: 'https://fakeimg.pl/1000x1000/',
        size: 17_308
      })

      ok(data.analyzed < data.size)
    })

    await test('should return a error when the host cannot be found', async () => {
      await rejects(
        info('https://fakeimg-no.pl/1000x1000/'),
        new FastImageError('Invalid remote host requested.', 'NETWORK_ERROR', 'https://fakeimg-no.pl/1000x1000/')
      )
    })

    await test('should return a error when the URL cannot be found', async () => {
      await rejects(
        info('https://fakeimg.pl/invalid'),
        new FastImageError('Remote host replied with HTTP 404.', 'NETWORK_ERROR', 'https://fakeimg.pl/invalid')
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
      await rejects(
        info('https://fakeimg.pl/1000x1000/', { timeout: 10 }),
        new FastImageError('Connection to the remote host timed out.', 'NETWORK_ERROR', 'https://fakeimg.pl/1000x1000/')
      )
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
        s.end(readFileSync(new URL('fixtures/image.png', import.meta.url).toString().replace('file://', '')))
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
