/*
 * This file is part of the fastimage npm package. Copyright (C) 2015 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at http://www.opensource.org/licenses/mit-license.php.
 */

/**
 * The error used by fastimage.
 *
 * @class module:fastimage.FastImageError
 * @param {string} message - The description of the message.
 * @param {string} attributes - The attributes of the error.
 */
const FastImageError = function(message, attributes){
  // Setup the error
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);

  // Setup inspecting
  this.name = "FastImageError";
  this.message = message;

  // Copy other properties
  Object.keys(attributes).forEach(key => {
    this[key] = attributes[key];
  });
};

require("util").inherits(FastImageError, Error);

// Exports.
module.exports = {
  FastImageError,

  handleNetworkError(error, url){
    "use strict";

    let message = null;
    let finalError = error;

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
      finalError = new FastImageError(message, {url, code: "NETWORK_ERROR", originalError: error});
    else
      finalError = new FastImageError("Unexpected response from the remote host.", {url, code: "SERVER_ERROR", httpCode: error.status});

    return finalError;
  }
};
