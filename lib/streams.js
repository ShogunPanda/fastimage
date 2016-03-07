/*
 * This file is part of the fastimage node module. Copyright (C) 2015 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at http://www.opensource.org/licenses/mit-license.php.
 */

var S_TO_MS = 1E3;
var US_TO_MS = 1E6;

(function(){
  "use strict";

  var Duplex = require("stream").Duplex;
  var util = require("util");
  var core = require("./core");
  var errors = require("./errors");
  var imageSize = require("image-size");

  /**
   * A image analysis stream.
   *
   * @class module:fastimage.FastImageStream
   */
  var FastImageStream = function(){
    var legacyNode = process.version.match(/v0\.10/);
    var options = arguments[arguments.length - 1] || {};

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
    _read: function(){
      // The destination is ready, perform the analysis.
      if(this.source){
        this._analyze(this.source);
        this.source = null;
      }
    },

    _write: function(chunk, encoding, callback){
      var info = null;

      try{
        // Attemp identification.
        this.buffer = Buffer.concat([this.buffer, chunk]);
        info = imageSize(this.buffer);

        // Setup informations.
        this._finalizeAnalysis(info);

        // Push the data and close.
        this.push(this.info);
      }catch(e){
        if(this.buffer.length > core.threshold())
          this.end();
      }

      callback();
    },

    _calculateElapsedTime: function(){
      this.elapsed = process.hrtime(this.elapsed);
      return (this.elapsed[0] * S_TO_MS) + this.elapsed[1] / US_TO_MS; // eslint-disable-line no-extra-parens
    },

    _analyze: function(source){
      var self = this;

      core.performAnalysis(source, function(error, info){
        if(error){
          self.error = error;
          return self.end();
        }

        // Setup informations.
        self._finalizeAnalysis(info);

        // Queue the reply.
        return self.push(self.info);
      });
    },

    _finalizeAnalysis: function(info){
      // Save metadata.
      info.time = this._calculateElapsedTime();
      info.analyzed = this.buffer.length;

      // Emit events.
      this.emit("size", {width: info.width, height: info.height});
      this.emit("type", info.type);

      this.info = info;
    },

    _failAnalysis: function(){
      if(!this.info)
        this.emit("error", this.error || new errors.FastImageError("Unsupported image data.", {code: "UNSUPPORTED_TYPE"}));
    }
  });

  module.exports = {
    FastImageStream: FastImageStream,

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
    stream: function(subject, options){
      if(subject)
        return new FastImageStream(subject, options);

      return new FastImageStream(options);
    }
  };
})();
