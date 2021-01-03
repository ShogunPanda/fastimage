# fastimage

[![Package Version](https://img.shields.io/npm/v/fastimage.svg)](https://npm.im/fastimage)
[![Dependency Status](https://img.shields.io/david/ShogunPanda/fastimage)](https://david-dm.org/ShogunPanda/fastimage)
[![Build](https://github.com/ShogunPanda/fastimage/workflows/CI/badge.svg)](https://github.com/ShogunPanda/fastimage/actions?query=workflow%3ACI)
[![Code Coverage](https://img.shields.io/codecov/c/gh/ShogunPanda/fastimage?token=KMA8EPI3DI)](https://codecov.io/gh/ShogunPanda/fastimage)

A module that finds the size and type of an image by fetching and reading as little data as needed.

http://sw.cowtech.it/fastimage

## Installation

Just run:

```bash
npm install fastimage
```

## Usage

The signature is `fastimage.info(source, [options], [callback])`.

The `source` argument can be:

- String representing a URL (only `http` and `https` protocol are supported).
- String representing a local file path.
- Buffer containing image data.
- Stream containing image data.

The `options` object supports the following options:

- `threshold`: The maximum about of data (in bytes) to downloaded or read before giving up. Default is `4096`.
- `timeout`: The maximum time (in milliseconds) to wait for a URL to be downloaded before giving up. Default is `30000` (30 s).
- `userAgent`: The user agent to use when making HTTP(S) requests. Default is `fastimage/$VERSION`.

If `callback` is not provided, the method returns a `Promise`.

## Example

```js
const { info } = require('fastimage')

info('http://fakeimg.pl/1000x1000/', (error, data) => {
  if (error) {
    // ...
  } else {
    // ...
  }
})

const data = await fastimage('http://fakeimg.pl/1000x1000/')
```

The callback argument (or the resolved value) will be an object with the following properties:

```js
{
  "width": 1000, // The width of the image in pixels.
  "height": 1000, // The height of the image in pixels.
  "type": "png", // The type of the image. Can be one of the supported images formats (see section below).
  "time": 171.43721 // The time required for the operation, in milliseconds.
  "analyzed": 979, // The amount of data transferred (in bytes) or read (in case of files or Buffer) to identify the image.
  "realUrl": "https://fakeimg.pl/1000x1000/", // The final URL of the image after all the redirects. Only present if the source was a URL.
  "size": 17300, // The size of the image (in bytes). Only present if the source was a URL and  if the server returned the "Content-Length" HTTP header.
}
```

## Streams

Calling `fastimage.stream` it will return a Writable stream which will emit the `info` event once informations are ready.

The stream accepts only the `threshold` option.

```js
const { info } = require('fastimage')
const pipe = createReadStream('/path/to/image.png').pipe(stream({ threshold: 100 }))

pipe.on('info', data => {
  // ...
})
```

## Supported image formats

The supported image type are (thanks to the [image-size](https://github.com/netroy/image-size) module):

- BMP
- CUR
- DDS
- GIF
- ICNS
- ICO
- JPEG
- KTX
- PNG
- PNM (PAM, PBM, PFM, PGM, PPM)
- PSD
- SVG
- TIFF
- WebP

## Contributing to fastimage

- Check out the latest master to make sure the feature hasn't been implemented or the bug hasn't been fixed yet.
- Check out the issue tracker to make sure someone already hasn't requested it and/or contributed it.
- Fork the project.
- Start a feature/bugfix branch.
- Commit and push until you are happy with your contribution.
- Make sure to add tests for it. This is important so I don't break it in a future version unintentionally.

## Copyright

Copyright (C) 2015 and above Shogun (shogun@cowtech.it).

Licensed under the MIT license, which can be found at https://choosealicense.com/licenses/isc.
