# fastimage

[![Gem Version](https://badge.fury.io/js/fastimage.png)](http://badge.fury.io/js/fastimage)
[![Dependency Status](https://gemnasium.com/ShogunPanda/fastimage.png?travis)](https://gemnasium.com/ShogunPanda/fastimage)
[![Build Status](https://secure.travis-ci.org/ShogunPanda/fastimage.png?branch=master)](http://travis-ci.org/ShogunPanda/fastimage)
[![Coverage Status](https://coveralls.io/repos/github/ShogunPanda/fastimage/badge.svg?branch=master)](https://coveralls.io/github/ShogunPanda/fastimage?branch=master)


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

## Supported implementations.

FastImage supports and has been tested on [NodeJS](http://nodejs.org) 5.0+. 

## Usage

For more details usage examples, see the `examples` folder.

### Callback style

To get the image informations, call `fastimage.info` passing the URL (can be also a local file path or a Buffer) and a callback.

```javascript
var fastimage = require("fastimage");
fastimage.info("http://placehold.it/100x100", function(error, information){
  if(error){
    // ...
  else{
    // ...
  }
});
```

For the details about the second parameter of the callback, see [fastimage.info](#user-content-fastimageinfosubject-callback), 
[fastimage.size](#user-content-fastimagesizesubject-callback) and [fastimage.type](#user-content-fastimagetypesubject-callback).

### Promise style

All the fastime image methods `info`, `filteredInfo`, `size` and `type` return a Promise. Once resolved, the promises have the same payload of the callbacks.

```javascript
var fastimage = require("fastimage");

fastimage.info("http://placehold.it/100x100")
  .then(function(info){
    // ...
  })
  .catch(function(error){
    // ...
  });
```

### Stream style

If you want to go *The Node.js Way*, you can use the streaming API.
 
Calling `fastimage.stream` it will return a Duplex stream object. Called without arguments, it's ideal for piping. Otherwise, you can use only it's readable side.

```javascript
// Duplex
request("http://placehold.it/100x100.png").pipe(fastimage.stream()).pipe(/*...*/);

// Readable
fastimage.stream("http://placehold.it/100x100.png").pipe(/*...*/);
```

Streams will emit the `size` and `type` if you only need those informations.

## Supported implementations.

Fastimage supports and has been tested on [NodeJS](http://nodejs.org) 0.10+ and [io.js](http://iojs.org) 1.0+.

## API Documentation

The API documentation can be found [here](https://sw.cowtech.it/fastimage/docs).

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
