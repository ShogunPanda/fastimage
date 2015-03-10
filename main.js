//
// This file is part of the fastimage node module. Copyright (C) 2015 and above Shogun <shogun@cowtech.it>.
// Licensed under the MIT license, which can be found at http://www.opensource.org/licenses/mit-license.php.
//

// TODO: Test
// TODO: ESLint
// TODO: Set coveralls.
// TODO: Set codeclimate style.
// TODO: Add JSDoc annotation
// TODO: README

(function(){
  "use strict";

  var request = require("request");
  var imageSize = require("image-size");
  var errors = require("./lib/errors");

  // TODO: handle local files
  // TODO: Stream interface
  // TODO: Promise interface

  var identify = function(buffer, url, time){
    var info = null;
    var elapsed = null;

    try{
      info = imageSize(buffer);
      elapsed = process.hrtime(time);

      info.url = url;
      info.transferred = buffer.length;
      info.time = (elapsed[0] * 1E3) + elapsed[1] / 1E6;
    }catch(e){
      info = null;
    }

    return info;
  };

  var analyze = function(url, callback){
    var buffer = new Buffer(0);
    var info = null;
    var time = process.hrtime();

    request({url: url, method: "GET", encoding: null})
      // When a response is received, control the HTTP code. If is not in the 2xx range, return a error.
      .on("response", function(response){
        if(response.statusCode / 100 !== 2){
          this.abort();
          callback(errors.handleNetworkError({code: "HTTP_ERROR", status: response.statusCode}, url));
        }
      })
      .on("data", function(chunk){
        // Append the new data and try the identification again.
        buffer = Buffer.concat([buffer, chunk]);
        info = identify(buffer, url, time);

        // Informations found. End the transfer and call the callback.
        if(info){
          this.abort();
          callback(null, info);
        }
      })
      .on("error", function(error){
        this.abort();
        callback(errors.handleNetworkError(error, url));
      })
      .on("end", function(){
        // The end of the transfer has been reached with no results. Return an error.
        if(!this._aborted && !info)
          callback(new errors.FastImageError("Unsupported image file.", {url: url, code: "UNSUPPORTED_TYPE"}));
      });
  };

  var size = function(url, callback){
    analyze(url, function(error, info){
      if(error)
        callback(error);
      else
        callback(null, {width: info.width, height: info.height});
    });
  };

  var type = function(url, callback){
    analyze(url, function(error, info){
      if(error)
        callback(error);
      else
        callback(null, info.type);
    });
  };

  module.exports = {
    analyze: analyze,
    size: size,
    type: type
  };
})();
