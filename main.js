/*
 * This file is part of the fastimage node module. Copyright (C) 2015 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at http://www.opensource.org/licenses/mit-license.php.
 */

(function(){
  "use strict";

  var core = require("./lib/core");
  var errors = require("./lib/errors");
  var streams = require("./lib/streams");

  /**
   * Fastimage module.
   *
   * @module fastimage
   */
  module.exports = {
    timeout: core.timeout,

    threshold: core.threshold,

    /**
     * Analyzes a source (a local path, a remote URL or a Buffer) and return the image informations.
     *
     * The second argument of the callback, when successful, will be a object containing the image informations.
     *
     * Specifically, when the source is a remote URL, the object will be similar to this:
     *
     * ```javascript
     * {
     *   "width": 1000, // The width of the image in pixels.
     *   "height": 1000, // The height of the image in pixels.
     *   "type": "gif", // The type of the image. Can be `bmp`, `gif`, `jpeg`, `png`, `psd`, `tif`, `webp` or `svg`.
     *   "subject": "http://placehold.it/1000x1000.gif", // The original URL of the image.
     *   "realUrl": "http://placehold.it/1000x1000.gif", // The real URL of the image after all the redirects. It will be omitted if equals to the URL.
     *   "size": 24090, // The size of the image (in bytes). Present only if the server returned the Content-Length HTTP header.
     *   "transferred": 979, // The amount of data transferred (in bytes) to identify the image.
     *   "time": 171.43721 // The time required for the operation, in milliseconds.
     * }
     * ```
     *
     * When the source is a local file the object will be similar to this:
     *
     * ```javascript
     * {
     *   "width": 150, // The width of the image in pixels.
     *   "height": 150, // The height of the image in pixels.
     *   "type": "png", // The type of the image. Can be `bmp`, `gif`, `jpeg`, `png`, `psd`, `tif`, `webp` or `svg`.
     *   "path": "1.png", // The original path of the image.
     *   "realPath": "/home/user/1.png", // The absolute path of the image. It will be omitted if equals to the path.
     *   "size": 24090, // The size (in bytes) of the image.
     *   "time": 14.00558 // The time required for the operation, in milliseconds.
     * }
     * ```
     *
     * When the source is a Buffer the object will be similar to this:
     *
     * ```javascript
     * {
     *   "width": 150, // The width of the image in pixels.
     *   "height": 150, // The height of the image in pixels.
     *   "type": "png", // The type of the image. Can be `bmp`, `gif`, `jpeg`, `png`, `psd`, `tif`, `webp` or `svg`.
     *   "analyzed": 4096 // The number of bytes analyzed.
     *   "time": 14.00558 // The time required for the operation, in milliseconds.
     * }
     * ```
     *
     * @alias module:fastimage.info
     * @param {string|Buffer} subject - The source to analyze. It can be a local path, a remote URL or a Buffer.
     * @param {function} [callback] - The callback to invoke once finished.
     * @returns {Promise} A promise which will contain the result object once resolved.
     */
    info: function(subject, callback){
      return core.filteredInfo(subject, null, callback);
    },

    /**
     * Analyzes a source (a local path, a remote URL or a Buffer) and return the image size.
     *
     * The second argument of the callback, when successful, will be a object containing the fields `width` and `height` in pixels.
     *
     * @alias module:fastimage.size
     * @param {string|Buffer} subject - The source to analyze. It can be a local path, a remote URL or a Buffer.
     * @param {function} [callback] - The callback to invoke once finished.
     * @returns {Promise} A promise which will contain the image size once resolved.
     */
    size: function(subject, callback){
      return core.filteredInfo(subject, function(info){
        return {width: info.width, height: info.height};
      }, callback);
    },

    /**
     * Analyzes a source (a local path, a remote URL or a Buffer) and return the image type.
     *
     * The second argument of the callback, when successful, will be the type of the image.
     *
     * @alias module:fastimage.type
     * @param {string|Buffer} subject - The source to analyze. It can be a local path, a remote URL or a Buffer.
     * @param {function} [callback] - The callback to invoke once finished.
     * @returns {Promise} A promise which will contain the image type once resolved.
     */
    type: function(subject, callback){
      return core.filteredInfo(subject, function(info){
        return info.type;
      }, callback);
    },

    filteredInfo: core.filteredInfo,

    stream: streams.stream,

    FastImageStream: errors.FastImageStream,

    FastImageError: errors.FastImageError
  };
})();
