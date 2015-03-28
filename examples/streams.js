/*
 * This file is part of the fastimage node module. Copyright (C) 2015 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at http://www.opensource.org/licenses/mit-license.php.
 */

var fastimage = require("../main");
var fs = require("fs");
var through = require("through");
var request = require("request");

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

// Piping a remote URL
var remote_pipe_1 = fastimage.stream().on("size", success("REMOTE CALLBACK 1")).on("type", success("REMOTE CALLBACK 2"))
request("http://placehold.it/100x100.png").pipe(remote_pipe_1).pipe(through(success("REMOTE CALLBACK 3")));

var remote_pipe_2 = fastimage.stream().on("error", success("REMOTE CALLBACK 4"));
request("http://placehold.it/100x100.png").pipe(remote_pipe_2);

// Piping a local file
var local_pipe_1 = fastimage.stream().on("size", success("LOCAL CALLBACK 1")).on("type", success("LOCAL CALLBACK 2"))
fs.createReadStream("examples/image.png").pipe(local_pipe_1).pipe(through(success("LOCAL CALLBACK 3")));

var local_pipe_2 = fastimage.stream().on("error", failure("LOCAL CALLBACK 4"));
fs.createReadStream("/etc/hosts").pipe(local_pipe_2);

// Readable stream with a remote URL
var remote_readable_1 = fastimage.stream("http://placehold.it/100x100.png").on("size", success("REMOTE CALLBACK 5")).on("type", success("REMOTE CALLBACK 6"))
remote_readable_1.pipe(through(success("REMOTE CALLBACK 7")));

var remote_readable_2 = fastimage.stream("http://placehold.it/").on("error", failure("REMOTE CALLBACK 8"));
remote_readable_2.pipe(through(success("REMOTE CALLBACK 9")));

// Readable stream with a remote URL
var local_readable_1 = fastimage.stream("examples/image.png").on("size", success("LOCAL CALLBACK 5")).on("type", success("LOCAL CALLBACK 6"))
local_readable_1.pipe(through(success("LOCAL CALLBACK 7")));

var local_readable_2 = fastimage.stream("/etc/hosts").on("error", failure("LOCAL CALLBACK 8"));
local_readable_2.pipe(through(success("LOCAL CALLBACK 9")));

// Readable stream with a buffer
var valid_buffer = new Buffer(10000);

fs.open("examples/image.png", "r", function(error, fd){
  fs.read(fd, valid_buffer, 0, 1000, null, function(){
    var stream = fastimage.stream(valid_buffer).on("size", success("BUFFER CALLBACK 1")).on("type", success("BUFFER CALLBACK 2"));
    stream.pipe(through(success("BUFFER CALLBACK 2")));
  });
});

var invalid_buffer = new Buffer(10000);

fs.open("/etc/hosts", "r", function(error, fd){
  fs.read(fd, invalid_buffer, 0, 1000, null, function(){
    var stream = fastimage.stream(invalid_buffer);
    stream.on("error", failure("BUFFER CALLBACK 4"));
    stream.pipe(through(success("BUFFER CALLBACK 5")));
  });
});