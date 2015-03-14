# fastimage

[![Gem Version](https://badge.fury.io/js/fastimage.png)](http://badge.fury.io/js/fastimage)
[![Dependency Status](https://gemnasium.com/ShogunPanda/fastimage.png?travis)](https://gemnasium.com/ShogunPanda/fastimage)
[![Build Status](https://secure.travis-ci.org/ShogunPanda/fastimage.png?branch=master)](http://travis-ci.org/ShogunPanda/fastimage)
[![Code Climate](https://codeclimate.com/github/ShogunPanda/fastimage.png)](https://codeclimate.com/github/ShogunPanda/fastimage)
[![Coverage Status](https://coveralls.io/repos/ShogunPanda/fastimage/badge.png)](https://coveralls.io/r/ShogunPanda/fastimage)

FastImage finds the size or type of an image given its URL by fetching as little as needed.

http://sw.cowtech.it/fastimage

The supported image type are (thanks to the [image-size](https://github.com/netroy/image-size) module):

* BMP
* GIF
* JPEG
* PNG
* PSD
* TIFF
* WebP
* SVG

## Usage

### Callback style

To get the image informations, call `fastimage.analyze` passing the URL (can be also a local file path) and a callback.

```javascript
var fastimage = require("fastimage");
fastimage.analyze("http://placehold.it/100x100", function(error, information){
  if(error){
    // ...
  else{
    // ...
  }
});
```

For the details about the second parameter of the callback, see [fastimage.analyze](#user-content-fastimageanalyzeurl-callback), 
[fastimage.size](#user-content-fastimagesizeurl-callback) and [fastimage.type](#user-content-fastimagetypeurl-callback).

### Promise style

# TODO

### Stream style

# TODO

## Supported implementations.

Chalkbars supports and has been tested on [NodeJS](http://nodejs.org) 0.10+ and [io.js](http://iojs.org) 1.0+.

## API Documentation

### fastimage.analyze(url, callback)
  
Analyzes a URL (local or remote) and return the image informations.

The signature of the callback is `function(error, info)`.

The first argument of the callback, when failed, will be a [FastImageError](#user-content-fastimageFastImageError) instance.

The second argument of the callback, when successful, will be a object containing the image informations.

Specifically, when the URL is a remote URL, the object will be similar to this:

```javascript
{
  "width": 1000, // The width of the image in pixels.
  "height": 1000, // The height of the image in pixels.
  "type": "gif", // The type of the image. Can be `bmp`, `gif`, `jpeg`, `png`, `psd`, `tif`, `webp` or `svg`.
  "url": "http://placehold.it/1000x1000.gif", // The original URL of the image.
  "realUrl": "http://placehold.it/1000x1000.gif", // The real URL of the image after all the redirects. It will be omitted if equals to the URL.
  "size": 24090, // The size of the image (in bytes). Present only if the server returned the Content-Length HTTP header.
  "transferred": 979, // The amount of data transferred (in bytes) to identify the image.
  "time": 171.43721 // The time required for the operation, in milliseconds.
}
```

When the URL is a local file the object will be similar to this:

```javascript
{
  "width": 150, // The width of the image in pixels.
  "height": 150, // The height of the image in pixels.
  "type": "png", // The type of the image. Can be `bmp`, `gif`, `jpeg`, `png`, `psd`, `tif`, `webp` or `svg`.
  "path": "1.png", // The original path of the image.
  "realPath": "/home/user/1.png", // The absolute path of the image. It will be omitted if equals to the path.
  "size": 24090, // The size (in bytes) of the image.
  "time": 14.00558 // The time required for the operation, in milliseconds.
}
```

### fastimage.size(url, callback)

Analyzes a URL (local or remote) and return the image size.

The signature of the callback is `function(error, dimensions)`.

The first argument of the callback, when failed, will be a [FastImageError](#user-content-fastimageFastImageError) instance.

The second argument of the callback, when successful, will be a object containing the fields `width` and `height` in pixels.

### fastimage.type(url, callback)

Analyzes a URL (local or remote) and return the image type.

The signature of the callback is `function(error, type)`.

The first argument of the callback, when failed, will be a [FastImageError](#user-content-fastimageFastImageError) instance.

The second argument of the callback, when successful, will be the type of the image.

### fastimage.FastImageError

This error will be returned as the first argument of the callbacks if anything goes wrong.

It always have the `message` and `code` fields set.

## Contributing to fastimage

* Check out the latest master to make sure the feature hasn't been implemented or the bug hasn't been fixed yet.
* Check out the issue tracker to make sure someone already hasn't requested it and/or contributed it.
* Fork the project.
* Start a feature/bugfix branch.
* Commit and push until you are happy with your contribution.
* Make sure to add tests for it. This is important so I don't break it in a future version unintentionally.

## Copyright

Copyright (C) 2015 and above Shogun (shogun@cowtech.it).

Licensed under the MIT license, which can be found at http://opensource.org/licenses/MIT.
