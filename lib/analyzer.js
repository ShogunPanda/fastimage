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

  var identify = function(buffer, url, realUrl, size, time){
    var info = null;
    var elapsed = null;

    try{
      info = imageSize(buffer);

      // Set URL informations
      info.url = url;
      if(realUrl != url)
        info.realUrl = realUrl;

      // Set file size informations
      info.transferred = buffer.length;
      if(size)
        info.size = size;

      // Set time informations
      elapsed = process.hrtime(time);
      info.time = (elapsed[0] * 1E3) + elapsed[1] / 1E6;
    }catch(e){
      info = null;
    }

    return info;
  };

  module.exports = {
    analyzeFile: function(url, callback){
      var elapsed = process.hrtime();
      var realPath = path.resolve(url.replace('~', process.env.HOME));
      var stats = fs.lstatSync(realPath);

      if(stats.isDirectory())
        return callback(new errors.FastImageError("Path is a directory.", {url: url, code: "IS_DIRECTORY"}));

      imageSize(realPath, function(error, info){
        if(error){
          if(error.code == "EACCES")
            return callback(new errors.FastImageError("Path is not readable.", {url: url, code: "ACCESS_DENIED"}));

          console.log(error);
          return;
        }

        elapsed = process.hrtime(elapsed);

        info.path = url;
        if(path != realPath)
          info.realPath = realPath;
        info.size = stats.size;
        info.time = (elapsed[0] * 1E3) + elapsed[1] / 1E6;

        callback(null, info);
      });
    },

    analyzeRemote: function(url, callback){
      var buffer = new Buffer(0);
      var info = null;
      var time = process.hrtime();
      var size = null;
      var realUrl = null;

      request({url: url, method: "GET", encoding: null})// When a response is received, control the HTTP code. If is not in the 2xx range, return a error.
        .on("response", function(response){
          realUrl = response.request.uri.href;
          size = response.headers["content-length"];

          if(response.statusCode / 100 !== 2){
            this.abort();
            callback(errors.handleNetworkError({code: "HTTP_ERROR", status: response.statusCode}, url));
          }
        }).on("data", function(chunk){
          // Append the new data and try the identification again.
          buffer = Buffer.concat([buffer, chunk]);
          info = identify(buffer, url, realUrl, size, time);

          // Informations found. End the transfer and call the callback.
          if(info){
            this.abort();
            callback(null, info);
          }
        }).on("error", function(error){
          this.abort();
          callback(errors.handleNetworkError(error, url));
        }).on("end", function(){
          // The end of the transfer has been reached with no results. Return an error.
          if(!this._aborted && !info)
            callback(new errors.FastImageError("Unsupported image file.", {url: url, code: "UNSUPPORTED_TYPE"}));
        });
    }
  };
})();