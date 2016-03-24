/*
 * This file is part of the fastimage npm package. Copyright (C) 2015 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at http://www.opensource.org/licenses/mit-license.php.
 */

const S_TO_MS = 1E3;
const US_TO_MS = 1E6;

const Duplex = require("stream").Duplex;
const util = require("util");
const core = require("./core");
const errors = require("./errors");
const imageSize = require("image-size");

/**
 * A image analysis stream.
 *
 * @class module:fastimage.FastImageStream
 */
const FastImageStream = function(){
  const legacyNode = process.version.match(/v0\.10/);
  const options = arguments[arguments.length - 1] || {};

  // Enable ObjectMode for Node 0.12+ or io.js
  if(!legacyNode)
    options.readableObjectMode = true;

  Duplex.call(this, options);

  // Enable ObjectMode for Node 0.10 or pause for the rest
  if(legacyNode)
    this._readableState.objectMode = true;
  else
    this.pause();

  if(arguments.length === 2)
    this.source = arguments[0];

  this.elapsed = process.hrtime();
  this.buffer = new Buffer(0);

  this.on("finish", function(){
    if(!this.info)
      this._failAnalysis();
  });
};
util.inherits(FastImageStream, Duplex);

FastImageStream.prototype = util._extend(FastImageStream.prototype, {
  _read(){
    // The destination is ready, perform the analysis.
    if(this.source){
      this._analyze(this.source);
      this.source = null;
    }
  },

  _write(chunk, encoding, callback){
    "use strict";

    let info = null;

    try{
      // Attemp identification.
      this.buffer = Buffer.concat([this.buffer, chunk]);
      info = imageSize(this.buffer);

      // Setup informations.
      this._finalizeAnalysis(info);

      // Push the data and close.
      this.push(this.info);
    }catch(e){
      if(this.buffer.length > core.manageThreshold())
        this.end();
    }

    callback();
  },

  _calculateElapsedTime(){
    this.elapsed = process.hrtime(this.elapsed);
    return (this.elapsed[0] * S_TO_MS) + this.elapsed[1] / US_TO_MS; // eslint-disable-line no-extra-parens
  },

  _analyze(source){
    core.performAnalysis(source, (error, info) => {
      if(error){
        this.error = error;
        return this.end();
      }

      // Setup informations.
      this._finalizeAnalysis(info);

      // Queue the reply.
      return this.push(this.info);
    });
  },

  _finalizeAnalysis(info){
    // Save metadata.
    info.time = this._calculateElapsedTime();
    info.analyzed = this.buffer.length;

    // Emit events.
    this.emit("size", {width: info.width, height: info.height});
    this.emit("type", info.type);

    this.info = info;
  },

  _failAnalysis(){
    if(!this.info)
      this.emit("error", this.error || new errors.FastImageError("Unsupported image data.", {code: "UNSUPPORTED_TYPE"}));
  }
});

module.exports = {
  FastImageStream,

  /**
   * Creates a new fastimage stream analysis. This is a Duplex stream which works in object mode on the readable side.
   *
   * It will emit the following events:
   *
   *   * **size**: The payload will be a object containing the fields `width` and `height` in pixels.
   *   * **type**: The payload will the type of the image.
   *
   * @alias module:fastimage.stream
   * @param {string|Buffer} subject - The source to analyze. It can be a local path, a remote URL or a Buffer.
   * @param {object} [options] - The options to pass to the stream.
   * @returns {FastImageStream} A image analysis stream.
   */
  stream(subject, options){
    if(subject)
      return new FastImageStream(subject, options);

    return new FastImageStream(options);
  }
};
