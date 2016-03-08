/*
 * This file is part of the fastimage node module. Copyright (C) 2015 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at http://www.opensource.org/licenses/mit-license.php.
 */

// Polyfill for Node 0.10
if(typeof Promise === "undefined")
  Promise = require("promise"); /* globals Promise */ // eslint-disable-line no-implicit-globals, no-native-reassign

(function(){ // eslint-disable-line max-statements
  "use strict";

  var path = require("path");
  var request = require("request");
  var imageSize = require("image-size");
  var fs = require("fs");
  var errors = require("./errors");
  var parseUrl = require("url").parse;

  var userAgent = null;
  var originalThreshold = 4096;
  var threshold = originalThreshold;

  var originalTimeout = 30000;
  var timeout = originalTimeout;

  var S_TO_MS = 1E3;
  var US_TO_MS = 1E6;
  var HTTP_RESPONSE_CLASS_FACTOR = 100;

  /**
   * Gets or sets the maximum number of bytes to read to attempt an identification before giving up and state that the source is not an image.
   *
   * Choosing a value less than or equal to zero will disable the feature, trying to download/open the entire file/stream.
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

  /**
   * Gets or sets the user agent string to send when connecting to a host.
   *
   * @alias module:fastimage.userAgent
   * @param {string} [value] - The new value to set. Passing `null` will delete the current value and not send any User-Agent.
   * @returns {number} The current value
   */
  var manageUserAgent = function(value){
    if(typeof value === "string")
      userAgent = value;
    else if(value === null)
      userAgent = null;

    return userAgent;
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
      info.time = (elapsed[0] * S_TO_MS) + elapsed[1] / US_TO_MS; // eslint-disable-line no-extra-parens
    }catch(e){
      info = null;
    }

    return info;
  };

  var analyzeBuffer = function(buffer, callback){
    var elapsed = process.hrtime();
    var info = null;

    try{
      info = imageSize(buffer);

      elapsed = process.hrtime(elapsed);
      // Return the time in milliseconds.
      info.time = (elapsed[0] * S_TO_MS) + elapsed[1] / US_TO_MS; // eslint-disable-line no-extra-parens
      info.analyzed = buffer.length;

      return callback(null, info);
    }catch(e){
      return callback(new errors.FastImageError("Unsupported image data.", {code: "UNSUPPORTED_TYPE"}));
    }
  };

  var analyzeFile = function(relativePath, callback){
    var elapsed = process.hrtime();
    var realPath = path.resolve(relativePath.replace("~", process.env.HOME));
    var stats = null;

    try{
      stats = fs.lstatSync(realPath); // eslint-disable-line no-sync
    }catch(error){
      return callback(new errors.FastImageError("Path not found.", {path: realPath, code: "NOT_FOUND"}));
    }

    if(stats.isDirectory())
      return callback(new errors.FastImageError("Path is a directory.", {path: realPath, code: "IS_DIRECTORY"}));

    return imageSize(realPath, function(error, info){
      // Handle a error.
      if(error){
        if(error.code === "EACCES")
          error = new errors.FastImageError("Path is not readable.", {path: realPath, code: "ACCESS_DENIED"});
        else
          error = new errors.FastImageError("Unsupported image file.", {path: realPath, code: "UNSUPPORTED_TYPE"});

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
      info.time = (elapsed[0] * S_TO_MS) + elapsed[1] / US_TO_MS; // eslint-disable-line no-extra-parens

      return callback(null, info);
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
    var params = {url: url, encoding: null, timeout: timeout};

    if(userAgent)
      params.headers = {"User-Agent": userAgent};

    request.get(params)
      .on("response", function(response){
        realUrl = response.request.uri.href;
        size = parseFloat(response.headers["content-length"]);

        if(response.statusCode / HTTP_RESPONSE_CLASS_FACTOR !== 2){
          this.abort();
          return callback(errors.handleNetworkError({code: "HTTP_ERROR", status: response.statusCode}, url));
        }

        return null;
      }).on("data", function(chunk){
        // Append the new data and try the identification again.
        buffer = Buffer.concat([buffer, chunk]);
        info = identify(buffer, url, realUrl, size, time);

        // Informations found or threshold reached. End the transfer and call the callback.
        if(info || (threshold > 0 && buffer.length >= threshold)){ // eslint-disable-line no-extra-parens
          this.abort();

          if(info)
            return callback(null, info);

          return callback(unsupportedError);
        }

        return null;
      }).on("error", function(error){
        this.abort();
        callback(errors.handleNetworkError(error, url));
      }).on("end", function(){
        // The end of the transfer has been reached with no results. Return an error.
        if(!this._aborted && !info)
          return callback(unsupportedError);

        return null;
      });
  };

  var performAnalysis = function(subject, callback){
    var parsed = null;

    // Buffer uses synchronous analysis.
    if(Buffer.isBuffer(subject))
      return analyzeBuffer(subject, callback);

    // Try to parse as a URL.
    parsed = parseUrl(subject);

    if(!parsed.path) // Not a URL.
      return callback(new errors.FastImageError("Invalid data provided.", {url: subject, code: "INVALID_DATA"}));
    else if(!parsed.protocol || parsed.protocol === "file") // It is a file.
      return analyzeFile(parsed.path, callback);

    // It is a remote URL, use request to fetch it.
    return analyzeRemote(subject, callback);
  };

  module.exports = {
    threshold: manageThreshold,

    timeout: manageTimeout,

    userAgent: manageUserAgent,

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
              callback(error); // eslint-disable-line callback-return

            return reject(error);
          }

          // Perform the filtering, if asked to.
          if(typeof filter === "function")
            info = filter(info);

          if(hasCallback)
            callback(null, info); // eslint-disable-line callback-return

          return complete(info);
        };

        performAnalysis(subject, done);
      });
    }
  };
})();
