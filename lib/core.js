/*
 * This file is part of the fastimage node module. Copyright (C) 2015 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at http://www.opensource.org/licenses/mit-license.php.
 */

(function(){
  "use strict";

  var path = require("path");
  var request = require("request");
  var imageSize = require("image-size");
  var fs = require("fs");
  var errors = require("./errors");
  var parseUrl = require("url").parse;

  var originalThreshold = 4096;
  var threshold = originalThreshold;

  var originalTimeout = 30000;
  var timeout = originalTimeout;

  /**
   * Gets or sets the maximum number of bytes to read to attempt an identification before giving up and state that the source is not an image.
   *
   * @alias module:fastimage.threshold
   * @param {number} [value] - The new value to set. Passing `null` will restore the default value (4096).
   * @returns {number} The current value
   */
  var manageThreshold = function(value){
    if(typeof value === "number")
      threshold = value;
    else if(value === null)
      threshold = originalThreshold;

    return threshold;
  };

  /**
   * Gets or sets the maximum number of seconds to wait to connect to a host.
   *
   * @alias module:fastimage.timeout
   * @param {number} [value] - The new value to set. Passing `null` will restore the default value (30000).
   * @returns {number} The current value
   */
  var manageTimeout = function(value){
    if(typeof value === "number")
      timeout = value;
    else if(value === null)
      timeout = originalTimeout;

    return timeout;
  };

  var identify = function(buffer, url, realUrl, size, time){
    var info = null;
    var elapsed = null;

    try{
      info = imageSize(buffer);

      // Set URL informations.
      info.url = url;
      if(realUrl !== url)
        info.realUrl = realUrl;

      // Set file size informations.
      info.transferred = buffer.length;
      if(size)
        info.size = size;

      // Set time informations.
      elapsed = process.hrtime(time);
      // Return the time in milliseconds.
      info.time = (elapsed[0] * 1E3) + elapsed[1] / 1E6; // eslint-disable-line no-extra-parens
    }catch(e){
      info = null;
    }

    return info;
  };

  var analyzeBuffer = function(buffer, callback){
    try{
      var elapsed = process.hrtime();
      var info = imageSize(buffer);

      elapsed = process.hrtime(elapsed);
      // Return the time in milliseconds.
      info.time = (elapsed[0] * 1E3) + elapsed[1] / 1E6; // eslint-disable-line no-extra-parens
      info.analyzed = buffer.length;

      callback(null, info);
    }catch(e){
      callback(new errors.FastImageError("Unsupported image data.", {code: "UNSUPPORTED_TYPE"}));
    }
  };

  var analyzeFile = function(relativePath, callback){
    var elapsed = process.hrtime();
    var realPath = path.resolve(relativePath.replace("~", process.env.HOME));
    var stats;

    try{
      stats = fs.lstatSync(realPath);
    }catch(error){
      return callback(new errors.FastImageError("Path not found.", {path: realPath, code: "NOT_FOUND"}));
    }

    if(stats.isDirectory())
      return callback(new errors.FastImageError("Path is a directory.", {path: realPath, code: "IS_DIRECTORY"}));

    imageSize(realPath, function(error, info){
      // Handle a error.
      if(error){
        error = (error.code === "EACCES") // eslint-disable-line no-extra-parens
          ?
          new errors.FastImageError("Path is not readable.", {path: realPath, code: "ACCESS_DENIED"})
          :
          new errors.FastImageError("Unsupported image file.", {path: realPath, code: "UNSUPPORTED_TYPE"});

        return callback(error);
      }

      elapsed = process.hrtime(elapsed);

      // Set path informations.
      info.path = relativePath;
      if(path !== realPath)
        info.realPath = realPath;

      // Set size and time informations.
      info.size = stats.size;
      // Return the time in milliseconds.
      info.time = (elapsed[0] * 1E3) + elapsed[1] / 1E6; // eslint-disable-line no-extra-parens

      callback(null, info);
    });
  };

  var analyzeRemote = function(url, callback){
    var buffer = new Buffer(0);
    var info = null;
    var time = process.hrtime();
    var size = null;
    var realUrl = null;
    var unsupportedError = new errors.FastImageError("Unsupported image file.", {url: url, code: "UNSUPPORTED_TYPE"});

    // When a response is received, control the HTTP code. If is not in the 2xx range, return a error.
    request({url: url, method: "GET", encoding: null, timeout: timeout})
      .on("response", function(response){
        realUrl = response.request.uri.href;
        size = parseFloat(response.headers["content-length"]);

        if(response.statusCode / 100 !== 2){
          this.abort();
          callback(errors.handleNetworkError({code: "HTTP_ERROR", status: response.statusCode}, url));
        }
      }).on("data", function(chunk){
        // Append the new data and try the identification again.
        buffer = Buffer.concat([buffer, chunk]);
        info = identify(buffer, url, realUrl, size, time);

        // Informations found or threshold reached. End the transfer and call the callback.
        if(info || buffer.length >= threshold){
          this.abort();

          if(info)
            callback(null, info);
          else
            callback(unsupportedError);
        }
      }).on("error", function(error){
        this.abort();
        callback(errors.handleNetworkError(error, url));
      }).on("end", function(){
        // The end of the transfer has been reached with no results. Return an error.
        if(!this._aborted && !info)
          callback(unsupportedError);
      });
  };

  var performAnalysis = function(subject, callback){
    // Buffer uses synchronous analysis.
    if(Buffer.isBuffer(subject))
      return analyzeBuffer(subject, callback);

    // Try to parse as a URL.
    var parsed = parseUrl(subject);

    if(!parsed.path) // Not a URL.
      callback(new errors.FastImageError("Invalid data provided.", {url: subject, code: "INVALID_DATA"}));
    else if(!parsed.protocol || parsed.protocol === "file") // It is a file.
      analyzeFile(parsed.path, callback);
    else // It is a remote URL, use request to fetch it.
      analyzeRemote(subject, callback);
  };

  module.exports = {
    threshold: manageThreshold,

    timeout: manageTimeout,

    performAnalysis: performAnalysis,

    /**
     * Analyzes a source (a local path, a remote URL or a Buffer) and return the image informations, filtering the results through a function.
     *
     * The second argument of the callback, when successful, will be a object containing the image informations.
     *
     * @alias module:fastimage.filteredInfo
     * @param {string|Buffer} subject - The source to analyze. It can be a local path, a remote URL or a Buffer.
     * @param {function} [filter] - The filter function to invoke. It should accept an object as input and return the object to be passed to the callback.
     *  For details on the input object, see {@link module:fastimage.info|info}.
     * @param {function} [callback] - The callback to invoke once finished.
     * @see {@link module:fastimage.info|info}
     * @returns {Promise} A promise which will contain the filtered object once resolved.
     */
    filteredInfo: function(subject, filter, callback){
      return new Promise(function(complete, reject){
        var hasCallback = typeof callback === "function";

        var done = function(error, info){
          // Error handling.
          if(error){
            if(hasCallback)
              callback(error);

            return reject(error);
          }

          // Perform the filtering, if asked to.
          if(typeof filter === "function")
            info = filter(info);

          if(hasCallback)
            callback(null, info);

          complete(info);
        };

        performAnalysis(subject, done);
      });
    }
  };
})();
