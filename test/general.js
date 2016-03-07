/*
 * This file is part of the fastimage node module. Copyright (C) 2015 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at http://www.opensource.org/licenses/mit-license.php.
 */

(function(){
  "use strict";

  var expect = require("expect.js");
  var sepia = require("sepia");
  var fs = require("fs");
  var path = require("path");
  var net = require("net");
  var crypto = require("crypto");

  var fastimage = require("../main");

  sepia.fixtureDir(path.join(__dirname, "cassettes"));

  sepia.filter({
    url: /timeout/,
    forceLive: true
  });

  var verify = function(done, checks){
    try{
      checks();
      done();
    }catch(e){
      done(e);
    }
  };

  describe("threshold", function(){
    it("should set and get the value", function(){
      expect(fastimage.threshold()).to.equal(4096);
      expect(fastimage.threshold(10)).to.equal(10);
      expect(fastimage.threshold()).to.equal(10);
      expect(fastimage.threshold(null)).to.equal(4096);
      expect(fastimage.threshold()).to.equal(4096);
    });
  });

  describe("timeout", function(){
    it("should set and get the value", function(){
      expect(fastimage.timeout()).to.equal(30000);
      expect(fastimage.timeout(10)).to.equal(10);
      expect(fastimage.timeout()).to.equal(10);
      expect(fastimage.timeout(null)).to.equal(30000);
      expect(fastimage.timeout()).to.equal(30000);
    });
  });

  describe("using callbacks", function(){
    this.timeout(5000);

    describe("info", function(){
      it("should return an error when an invalid data is asked", function(done){
        fastimage.info("", function(error, info){
          verify(done, function(){
            expect(info).not.to.be.ok();
            expect(error).to.be.a(fastimage.FastImageError);

            expect(error.code).to.equal("INVALID_DATA");
            expect(error.message).to.equal("Invalid data provided.");
          });
        });
      });


      describe("URL", function(){
        it("should return the information of a image", function(done){
          fastimage.info("http://placehold.it/200x100", function(error, info){
            verify(done, function(){
              expect(error).not.to.be.ok();
              expect(info).to.only.have.keys(["width", "height", "type", "url", "transferred", "time", "realUrl", "size"]);
              expect(info.width).to.equal(200);
              expect(info.height).to.equal(100);
              expect(info.type).to.equal("png");
              expect(info.url).to.equal("http://placehold.it/200x100");
              expect(info.transferred).to.be.a("number");
              expect(info.time).to.be.a("number");
            });
          });
        });

        it("should contain redirect information and size when available", function(done){
          fastimage.info("http://graph.facebook.com/Nodejs/picture", function(error, info){
            verify(done, function(){
              expect(info.realUrl).to.be.a("string");
              expect(info.size).to.be.a("number");
              expect(info.url).not.to.equal(info.realUrl);
            });
          });
        });

        it("should return a error when the host cannot be found", function(done){
          fastimage.info("http://placehold1.it", function(error, info){
            verify(done, function(){
              expect(info).not.to.be.ok();
              expect(error).to.be.a(fastimage.FastImageError);

              expect(error.code).to.equal("NETWORK_ERROR");
              expect(error.message).to.equal("Invalid remote host requested.");
            });
          });
        });

        it("should return a error when the URL cannot be found", function(done){
          fastimage.info("http://placehold.it/foo", function(error, info){
            verify(done, function(){
              expect(info).not.to.be.ok();
              expect(error).to.be.a(fastimage.FastImageError);

              expect(error.code).to.equal("SERVER_ERROR");
              expect(error.message).to.equal("Unexpected response from the remote host.");
            });
          });
        });

        it("should return a error when the URL is not a image", function(done){
          fastimage.info("http://example.com/", function(error, info){
            verify(done, function(){
              expect(info).not.to.be.ok();
              expect(error).to.be.a(fastimage.FastImageError);

              expect(error.code).to.equal("UNSUPPORTED_TYPE");
              expect(error.message).to.equal("Unsupported image file.");
            });
          });
        });

        it("should return a error when the URL is a text file", function(done){
          fastimage.info("https://placeholdit.imgix.net/~text?txtsize=28&bg=0099ff&txt=300%C3%97300&w=300&h=300&fm=tif", function(error, info){
            verify(done, function(){
              expect(info).not.to.be.ok();
              expect(error).to.be.a(fastimage.FastImageError);

              expect(error.code).to.equal("UNSUPPORTED_TYPE");
              expect(error.message).to.equal("Unsupported image file.");
            });
          });
        });

        it("should handle connection timeouts", function(done){
          fastimage.timeout(1);

          fastimage.info("http://placehold.it/timeout", function(error, info){
            verify(done, function(){
              expect(info).not.to.be.ok();
              expect(error).to.be.a(fastimage.FastImageError);

              expect(error.code).to.equal("NETWORK_ERROR");
              expect(error.message).to.equal("Connection to the remote host timed out.");
              fastimage.timeout(null);
            });
          });
        });

        it("should handle connection failures", function(done){
          fastimage.info("http://127.0.0.1:65000/100x100", function(error, info){
            verify(done, function(){
              expect(info).not.to.be.ok();
              expect(error).to.be.a(fastimage.FastImageError);

              expect(error.code).to.equal("NETWORK_ERROR");
              expect(error.message).to.equal("Connection refused from the remote host.");
            });
          });
        });

        it("should handle connection interruptions", function(done){
          var server = net.createServer(function(c){
            c.end();
          });
          server.listen(65001);

          fastimage.info("http://127.0.0.1:65001", function(error, info){
            verify(done, function(){
              expect(info).not.to.be.ok();
              expect(error).to.be.a(fastimage.FastImageError);

              expect(error.code).to.equal("NETWORK_ERROR");
              expect(error.message).to.equal("Connection with the remote host interrupted.");

              server.close();
            });
          });
        });
      });

      describe("Path", function(){
        it("should return the information of a image", function(done){
          fastimage.info(__dirname + "/../examples/image.png", function(error, info){
            verify(done, function(){
              expect(error).not.to.be.ok();
              expect(info).to.only.have.keys(["width", "height", "type", "path", "realPath", "size", "time"]);
              expect(info.width).to.equal(150);
              expect(info.height).to.equal(150);
              expect(info.type).to.equal("png");
              expect(info.path).to.equal(__dirname + "/../examples/image.png");
              expect(info.realPath).to.equal(path.resolve(__dirname + "/../examples/image.png"));
              expect(info.size).to.equal(24090);
              expect(info.time).to.be.a("number");
            });
          });
        });

        it("should return a error when the path is a directory", function(done){
          fastimage.info(__dirname, function(error, info){
            verify(done, function(){
              expect(info).not.to.be.ok();
              expect(error).to.be.a(fastimage.FastImageError);

              expect(error.code).to.equal("IS_DIRECTORY");
              expect(error.message).to.equal("Path is a directory.");
            });
          });
        });

        it("should return a error when the path cannot be found", function(done){
          fastimage.info("/not/existent", function(error, info){
            verify(done, function(){
              expect(info).not.to.be.ok();
              expect(error).to.be.a(fastimage.FastImageError);

              expect(error.code).to.equal("NOT_FOUND");
              expect(error.message).to.equal("Path not found.");
            });
          });
        });

        it("should return a error when the path cannot be read", function(done){
          fastimage.info("/etc/sudoers", function(error, info){
            verify(done, function(){
              expect(info).not.to.be.ok();
              expect(error).to.be.a(fastimage.FastImageError);

              expect(error.code).to.equal("ACCESS_DENIED");
              expect(error.message).to.equal("Path is not readable.");
            });
          });
        });

        it("should return a error when the path is not a image", function(done){
          fastimage.info(__filename, function(error, info){
            expect(info).not.to.be.ok();
            expect(error).to.be.a(fastimage.FastImageError);

            expect(error.code).to.equal("UNSUPPORTED_TYPE");
            expect(error.message).to.equal("Unsupported image file.");

            done();
          })
        });
      });

      describe("Buffer", function(){
        it("should return the information of a image", function(done){
          fs.open(__dirname + "/../examples/image.png", "r", function(error, fd){
            var buffer = new Buffer(10000);
            fs.read(fd, buffer, 0, 1000, null, function(){
              fastimage.info(buffer, function(error, info){
                verify(done, function(){
                  expect(error).not.to.be.ok();
                  expect(info).to.only.have.keys(["width", "height", "type", "time", "analyzed"]);
                  expect(info.width).to.equal(150);
                  expect(info.height).to.equal(150);
                  expect(info.type).to.equal("png");
                  expect(info.analyzed).to.equal(10000);
                  expect(info.time).to.be.a("number");
                });
              });
            });
          });
        });

        it("should return a error when the data is not a image", function(done){
          fs.open("/etc/hosts", "r", function(error, fd){
            var buffer = new Buffer(10000);
            fs.read(fd, buffer, 0, 1000, null, function(){
              fastimage.info(buffer, function(error, info){
                verify(done, function(){
                  expect(info).not.to.be.ok();
                  expect(error).to.be.a(fastimage.FastImageError);

                  expect(error.code).to.equal("UNSUPPORTED_TYPE");
                  expect(error.message).to.equal("Unsupported image data.");
                });
              });
            });
          });
        });
      });
    });

    describe("filteredInfo", function(){
      it("should return the object through the filter function", function(done){
        fastimage.filteredInfo(
          __dirname + "/../examples/image.png",
          function(info){
            return {area: info.width * info.height, type: info.type};
          },
          function(error, info){
            verify(done, function(){
              expect(error).not.to.be.ok();
              expect(info).to.only.have.keys(["area", "type"]);
              expect(info.area).to.equal(22500);
              expect(info.type).to.equal("png");
            });
          }
        );
      })
    });

    describe("size", function(){
      describe("URL", function(){
        it("should return the size of a image", function(done){
          fastimage.size("http://placehold.it/200x100", function(error, info){
            verify(done, function(){
              expect(info).to.eql({width: 200, height: 100});
            });
          });
        });
      });

      describe("Path", function(){
        it("should return the size of a image", function(done){
          fastimage.size(__dirname + "/../examples/image.png", function(error, info){
            verify(done, function(){
              expect(info).to.eql({width: 150, height: 150});
            });
          });
        });
      });

      describe("Buffer", function(){
        it("should return the size of a image", function(done){
          fs.open(__dirname + "/../examples/image.png", "r", function(error, fd){
            var buffer = new Buffer(10000);
            fs.read(fd, buffer, 0, 1000, null, function(){
              fastimage.size(buffer, function(error, info){
                verify(done, function(){
                  expect(info).to.eql({width: 150, height: 150});
                });
              });
            });
          });
        });
      });
    });

    describe("type", function(){
      describe("URL", function(){
        it("should return the type of a image", function(done){
          fastimage.type("http://placehold.it/200x100", function(error, info){
            verify(done, function(){
              expect(info).to.equal("png");
            });
          });
        });
      });

      describe("Path", function(){
        it("should return the size of a image", function(done){
          fastimage.type(__dirname + "/../examples/image.png", function(error, info){
            verify(done, function(){
              expect(info).to.equal("png");
            });
          });
        });
      });

      describe("Buffer", function(){
        it("should return the size of a image", function(done){
          fs.open(__dirname + "/../examples/image.png", "r", function(error, fd){
            var buffer = new Buffer(10000);
            fs.read(fd, buffer, 0, 1000, null, function(){
              fastimage.type(buffer, function(error, info){
                verify(done, function(){
                  expect(info).to.equal("png");
                });
              });
            });
          });
        });
      });
    });
  });
})();