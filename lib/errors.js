/*
 * This file is part of the fastimage node module. Copyright (C) 2015 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at http://www.opensource.org/licenses/mit-license.php.
 */

(function(){
  "use strict";

  /**
   * The error used by fastimage.
   *
   * @class module:fastimage.FastImageError
   * @param {string} message - The description of the message.
   * @param {string} attributes - The attributes of the error.
   */
  var FastImageError = function(message, attributes){
    var self = this;

    // Setup the error
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);

    // Setup inspecting
    this.name = "FastImageError";
    this.message = message || "";

    // Copy other properties
    Object.keys(attributes).forEach(function(key){
      self[key] = attributes[key];
    });
  };

  require("util").inherits(FastImageError, Error);

  // Exports.
  module.exports = {
    FastImageError: FastImageError,

    handleNetworkError: function(error, url){
      var message = null;
      var finalError = error;

      switch(error.code){
        case "ENOTFOUND":
          message = "Invalid remote host requested.";
          break;
        case "ECONNRESET":
        case "EPIPE":
          message = "Connection with the remote host interrupted.";
          break;
        case "ECONNREFUSED":
          message = "Connection refused from the remote host.";
          break;
        case "ETIMEDOUT":
          message = "Connection to the remote host timed out.";
          break;
      }

      if(message)
        finalError = new FastImageError(message, {url: url, code: "NETWORK_ERROR", originalError: error});
      else if(error.code === "HTTP_ERROR")
        finalError = new FastImageError("Unexpected response from the remote host.", {url: url, code: "SERVER_ERROR", httpCode: error.status});

      return finalError;
    }
  };
})();
