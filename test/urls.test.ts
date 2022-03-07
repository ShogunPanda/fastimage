/* eslint-disable @typescript-eslint/no-floating-promises */

import { readFileSync } from 'node:fs'
import { createServer as createHttpServer } from 'node:http'
import { AddressInfo, createServer } from 'node:net'
import t from 'tap'
import { info } from '../src/index.js'
import { FastImageError, userAgentVersion } from '../src/models.js'

t.test('fastimage.info', t => {
  t.test('when working with URLS', t => {
    t.test('should return the information of a image', async t => {
      const data = await info('http://fakeimg.pl/1000x1000/')

      t.same(data, {
        width: 1000,
        height: 1000,
        type: 'png',
        time: data.time,
        analyzed: data.analyzed,
        realUrl: 'https://fakeimg.pl/1000x1000/',
        size: 17_308
      })

      t.ok(data.analyzed < data.size!)
    })

    t.test('should return a error when the host cannot be found', async t => {
      await t.rejects(
        info('https://fakeimg-no.pl/1000x1000/'),
        new FastImageError('Invalid remote host requested.', 'NETWORK_ERROR', 'https://fakeimg-no.pl/1000x1000/')
      )
    })

    t.test('should return a error when the URL cannot be found', async t => {
      await t.rejects(
        info('https://fakeimg.pl/invalid'),
        new FastImageError('Remote host replied with HTTP 404', 'NETWORK_ERROR', 'https://fakeimg.pl/invalid')
      )
    })

    t.test('should return a error when the URL is not a image', async t => {
      await t.rejects(info('https://www.google.com/robots.txt'), new FastImageError('Unsupported data.', 'UNSUPPORTED'))
    })

    t.test('should return a error when the URL is not a image when downloading the entire file', async t => {
      await t.rejects(
        info('https://www.google.com/robots.txt', { threshold: 0 }),
        new FastImageError('Unsupported data.', 'UNSUPPORTED')
      )
    })

    t.test('should handle connection timeouts', async t => {
      await t.rejects(
        info('https://fakeimg.pl/1000x1000/', { timeout: 10 }),
        new FastImageError('Connection to the remote host timed out.', 'NETWORK_ERROR', 'https://fakeimg.pl/1000x1000/')
      )
    })

    t.test('should handle connection failures', async t => {
      await t.rejects(
        info('http://127.0.0.1:65000/100x100'),
        new FastImageError(
          'Connection refused from the remote host.',
          'NETWORK_ERROR',
          'http://127.0.0.1:65000/100x100'
        )
      )
    })

    t.test('should handle connection interruptions', async t => {
      const server = createServer(c => {
        c.end()
      })

      server.listen(0)

      const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
      await t.rejects(
        info(url),
        new FastImageError('Connection with the remote host interrupted.', 'NETWORK_ERROR', url)
      )

      server.close()
    })

    t.test('should complain about invalid URLs.', async t => {
      await t.rejects(
        info('ftp://127.0.0.1:65000/100x100'),
        new FastImageError('Invalid URL.', 'URL_ERROR', 'ftp://127.0.0.1:65000/100x100')
      )
    })

    t.test('should send the right user agent', async t => {
      const agents: Array<string> = []

      const server = createHttpServer((r, s) => {
        agents.push(r.headers['user-agent']!)
        s.end(readFileSync(new URL('fixtures/image.png', import.meta.url).toString().replace('file://', '')))
      })

      server.listen(0)

      const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`

      await info(url)
      await info(url, { userAgent: 'FOO' })

      server.close()

      t.same(agents, [`fastimage/${userAgentVersion}`, 'FOO'])
    })

    t.end()
  })

  t.end()
})
