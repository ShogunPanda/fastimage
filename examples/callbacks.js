/*
 * This file is part of the fastimage node module. Copyright (C) 2015 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at http://www.opensource.org/licenses/mit-license.php.
 */

var fastimage = require("../main");
var fs = require("fs");

var results = function(header){
  return function(error, info){
    if(error)
      console.error(header + "\n\t" + JSON.stringify(error));
    else
      console.log(header + "\n\t" + JSON.stringify(info));
  };
};

// Calling on a remote URL
fastimage.info("http://placehold.it/100x100.png", results("REMOTE CALLBACK 1"));
fastimage.info("http://placehold1.it", results("REMOTE CALLBACK 2"));
fastimage.info("http://placehold.it", results("REMOTE CALLBACK 3"));
fastimage.size("http://placehold.it/100x100.png", results("REMOTE CALLBACK 4"));
fastimage.type("http://placehold.it/100x100.png", results("REMOTE CALLBACK 5"));

// Calling on a local file
fastimage.info("examples/image.png", results("LOCAL CALLBACK 1"));
fastimage.info("/etc/hosts", results("LOCAL CALLBACK 2"));
fastimage.size("examples/image.png", results("LOCAL CALLBACK 3"));
fastimage.type("examples/image.png", results("LOCAL CALLBACK 4"));

// Calling using a buffer
var valid_buffer = new Buffer(10000);

fs.open("examples/image.png", "r", function(error, fd){
  fs.read(fd, valid_buffer, 0, 1000, null, function(){
    fastimage.info(valid_buffer, results("BUFFER CALLBACK 1"));
    fastimage.size(valid_buffer, results("BUFFER CALLBACK 2"));
    fastimage.type(valid_buffer, results("BUFFER CALLBACK 3"));
  });
});

var invalid_buffer = new Buffer(10000);

fs.open("/etc/hosts", "r", function(error, fd){
  fs.read(fd, invalid_buffer, 0, 1000, null, function(){
    fastimage.info(invalid_buffer, results("BUFFER CALLBACK 4"));
    fastimage.size(invalid_buffer, results("BUFFER CALLBACK 5"));
    fastimage.type(invalid_buffer, results("BUFFER CALLBACK 6"));
  });
});