/*
 * This file is part of the fastimage npm package. Copyright (C) 2015 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at https://choosealicense.com/licenses/mit.
 */

var fastimage = require("../main");
var fs = require("fs");

var success = function(header){
  return function(info){
    console.log(header + "\n\t" + JSON.stringify(info));
  };
};

var failure = function(header){
  return function(error){
    console.error(header + "\n\t" + JSON.stringify(error));
  };
};

// Calling on a remote URL
fastimage.info("http://placehold.it/100x100.png").then(success("REMOTE CALLBACK 1")).catch(failure("REMOTE CALLBACK 1"));
fastimage.size("http://placehold.it/100x100.png").then(success("REMOTE CALLBACK 2")).catch(failure("REMOTE CALLBACK 2"));
fastimage.type("http://placehold.it/100x100.png").then(success("REMOTE CALLBACK 3")).catch(failure("REMOTE CALLBACK 3"));
fastimage.info("http://placehold.it/").then(success("REMOTE CALLBACK 4")).catch(failure("REMOTE CALLBACK 4"));

// Calling on a local file
fastimage.info("examples/image.png").then(success("LOCAL CALLBACK 1")).catch(failure("LOCAL CALLBACK 1"));
fastimage.info("/etc/hosts").then(success("LOCAL CALLBACK 2")).catch(failure("LOCAL CALLBACK 2"));

// Calling using a buffer
var valid_buffer = new Buffer(10000);

fs.open("examples/image.png", "r", function(error, fd){
  fs.read(fd, valid_buffer, 0, 1000, null, function(){
    fastimage.info(valid_buffer).then(success("BUFFER CALLBACK 1")).catch(failure("BUFFER CALLBACK 1"));
    fastimage.size(valid_buffer).then(success("BUFFER CALLBACK 2")).catch(failure("BUFFER CALLBACK 2"));
    fastimage.type(valid_buffer).then(success("BUFFER CALLBACK 3")).catch(failure("BUFFER CALLBACK 3"));
  });
});

var invalid_buffer = new Buffer(10000);

fs.open("/etc/hosts", "r", function(error, fd){
  fs.read(fd, invalid_buffer, 0, 1000, null, function(){
    fastimage.info(invalid_buffer).then(success("BUFFER CALLBACK 4")).catch(failure("BUFFER CALLBACK 4"));
  });
});