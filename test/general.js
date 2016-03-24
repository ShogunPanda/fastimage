/*
 * This file is part of the fastimage npm package. Copyright (C) 2015 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at http://www.opensource.org/licenses/mit-license.php.
 */

/* globals describe, it, beforeEach, afterEach */
/* eslint-disable no-unused-expressions, max-nested-callbacks */

"use strict";

const expect = require("chai").expect;
const fs = require("fs");
const path = require("path");
const net = require("net");
const sinon = require("sinon");
const request = require("request");
const fastimage = require("../main");
const sepia = require("sepia");

const PORT = 65001;
const TIMEOUT = 5000;
const SMALL_VALUE = 10;
const DEFAULT_THRESHOLD = 4096;
const DEFAULT_TIMEOUT = 30000;
const SAMPLE_WIDTH = 150;
const SAMPLE_HEIGHT = 150;
const SAMPLE_SIZE = 24090;
const SAMPLE_OTHER_WIDTH = 200;
const SAMPLE_OTHER_HEIGHT = 100;
const SAMPLE_OTHER_SIZE = 22500;
const SAMPLE_ANALYZED = 10000;
const SAMPLE_PORTION = 1000;

const verify = function(done, checks){
  try{
    checks();
    done();
  }catch(e){
    done(e);
  }
};

sepia.fixtureDir(path.join(__dirname, "cassettes"));
sepia.filter({url: /timeout|wikimedia/, forceLive: true});

describe("threshold", () => {
  it("should set and get the value", () => {
    expect(fastimage.threshold()).to.equal(DEFAULT_THRESHOLD);
    expect(fastimage.threshold(SMALL_VALUE)).to.equal(SMALL_VALUE);
    expect(fastimage.threshold()).to.equal(SMALL_VALUE);
    expect(fastimage.threshold(null)).to.equal(DEFAULT_THRESHOLD);
    expect(fastimage.threshold()).to.equal(DEFAULT_THRESHOLD);
  });
});

describe("timeout", () => {
  it("should set and get the value", () => {
    expect(fastimage.timeout()).to.equal(DEFAULT_TIMEOUT);
    expect(fastimage.timeout(SMALL_VALUE)).to.equal(SMALL_VALUE);
    expect(fastimage.timeout()).to.equal(SMALL_VALUE);
    expect(fastimage.timeout(null)).to.equal(DEFAULT_TIMEOUT);
    expect(fastimage.timeout()).to.equal(DEFAULT_TIMEOUT);
  });
});

describe("user agent", () => {
  it("should set and get the value", () => {
    expect(fastimage.userAgent()).not.to.exist;
    expect(fastimage.userAgent("new value")).to.equal("new value");
    expect(fastimage.userAgent()).to.equal("new value");
    expect(fastimage.userAgent(null)).not.to.exist;
    expect(fastimage.userAgent()).not.to.exist;
  });
});

describe("using callbacks", function(){
  this.timeout(TIMEOUT);

  describe("info", () => {
    it("should return an error when an invalid data is asked", done => {
      fastimage.info("", (error, info) => {
        verify(done, () => {
          expect(info).not.to.exist;
          expect(error).to.be.instanceof(fastimage.FastImageError);

          expect(error.code).to.equal("INVALID_DATA");
          expect(error.message).to.equal("Invalid data provided.");
        });
      });
    });

    describe("URL", () => {
      it("should return the information of a image", done => {
        fastimage.info("http://placehold.it/200x100.png", (error, info) => {
          verify(done, () => {
            expect(error).not.to.exist;
            expect(info).to.have.all.keys(["width", "height", "type", "url", "transferred", "time", "realUrl", "size"]);
            expect(info.width).to.equal(SAMPLE_OTHER_WIDTH);
            expect(info.height).to.equal(SAMPLE_OTHER_HEIGHT);
            expect(info.type).to.equal("png");
            expect(info.url).to.equal("http://placehold.it/200x100.png");
            expect(info.transferred).to.be.a("number");
            expect(info.time).to.be.a("number");
          });
        });
      });

      it("should contain redirect information and size when available", done => {
        fastimage.info("http://graph.facebook.com/Nodejs/picture", (error, info) => {
          verify(done, () => {
            expect(info.realUrl).to.be.a("string");
            expect(info.size).to.be.a("number");
            expect(info.url).not.to.equal(info.realUrl);
          });
        });
      });

      it("should return a error when the host cannot be found", done => {
        fastimage.info("http://placehold1.it", (error, info) => {
          verify(done, () => {
            expect(info).not.to.exist;
            expect(error).to.be.instanceof(fastimage.FastImageError);

            expect(error.code).to.equal("NETWORK_ERROR");
            expect(error.message).to.equal("Invalid remote host requested.");
          });
        });
      });

      it("should return a error when the URL cannot be found", done => {
        fastimage.info("http://placehold.it/foo", (error, info) => {
          verify(done, () => {
            expect(info).not.to.exist;
            expect(error).to.be.instanceof(fastimage.FastImageError);

            expect(error.code).to.equal("SERVER_ERROR");
            expect(error.message).to.equal("Unexpected response from the remote host.");
          });
        });
      });

      it("should return a error when the URL is not a image", done => {
        fastimage.info("http://www.google.com/robots.txt", (error, info) => {
          verify(done, () => {
            expect(info).not.to.exist;
            expect(error).to.be.instanceof(fastimage.FastImageError);

            expect(error.code).to.equal("UNSUPPORTED_TYPE");
            expect(error.message).to.equal("Unsupported image file.");
          });
        });
      });

      it("should handle connection timeouts", done => {
        fastimage.timeout(1);

        fastimage.info("http://placehold.it/timeout", (error, info) => {
          verify(done, () => {
            expect(info).not.to.exist;
            expect(error).to.be.instanceof(fastimage.FastImageError);

            expect(error.code).to.equal("NETWORK_ERROR");
            expect(error.message).to.equal("Connection to the remote host timed out.");
            fastimage.timeout(null);
          });
        });
      });

      it("should handle connection failures", done => {
        fastimage.info("http://127.0.0.1:65000/100x100", (error, info) => {
          verify(done, () => {
            expect(info).not.to.exist;
            expect(error).to.be.instanceof(fastimage.FastImageError);

            expect(error.code).to.equal("NETWORK_ERROR");
            expect(error.message).to.equal("Connection refused from the remote host.");
          });
        });
      });

      it("should handle connection interruptions", done => {
        const server = net.createServer(c => {
          c.end();
        });
        server.listen(PORT);

        fastimage.info(`http://127.0.0.1:${PORT}`, (error, info) => {
          verify(done, () => {
            expect(info).not.to.exist;
            expect(error).to.be.instanceof(fastimage.FastImageError);

            expect(error.code).to.equal("NETWORK_ERROR");
            expect(error.message).to.equal("Connection with the remote host interrupted.");

            server.close();
          });
        });
      });
    });

    describe("Path", () => {
      it("should return the information of a image", done => {
        fastimage.info(`${__dirname}/../examples/image.png`, (error, info) => {
          verify(done, () => {
            expect(error).not.to.exist;
            expect(info).to.have.all.keys(["width", "height", "type", "path", "realPath", "size", "time"]);
            expect(info.width).to.equal(SAMPLE_WIDTH);
            expect(info.height).to.equal(SAMPLE_HEIGHT);
            expect(info.type).to.equal("png");
            expect(info.path).to.equal(`${__dirname}/../examples/image.png`);
            expect(info.realPath).to.equal(path.resolve(`${__dirname}/../examples/image.png`));
            expect(info.size).to.equal(SAMPLE_SIZE);
            expect(info.time).to.be.a("number");
          });
        });
      });

      it("should return a error when the path is a directory", done => {
        fastimage.info(__dirname, (error, info) => {
          verify(done, () => {
            expect(info).not.to.exist;
            expect(error).to.be.instanceof(fastimage.FastImageError);

            expect(error.code).to.equal("IS_DIRECTORY");
            expect(error.message).to.equal("Path is a directory.");
          });
        });
      });

      it("should return a error when the path cannot be found", done => {
        fastimage.info("/not/existent", (error, info) => {
          verify(done, () => {
            expect(info).not.to.exist;
            expect(error).to.be.instanceof(fastimage.FastImageError);

            expect(error.code).to.equal("NOT_FOUND");
            expect(error.message).to.equal("Path not found.");
          });
        });
      });

      it("should return a error when the path cannot be read", done => {
        fastimage.info("/etc/sudoers", (error, info) => {
          verify(done, () => {
            expect(info).not.to.exist;
            expect(error).to.be.instanceof(fastimage.FastImageError);

            expect(error.code).to.equal("ACCESS_DENIED");
            expect(error.message).to.equal("Path is not readable.");
          });
        });
      });

      it("should return a error when the path is not a image", done => {
        fastimage.info(__filename, (error, info) => {
          expect(info).not.to.exist;
          expect(error).to.be.instanceof(fastimage.FastImageError);

          expect(error.code).to.equal("UNSUPPORTED_TYPE");
          expect(error.message).to.equal("Unsupported image file.");

          done();
        });
      });
    });

    describe("Buffer", () => {
      it("should return the information of a image", done => {
        fs.open(`${__dirname}/../examples/image.png`, "r", (error, fd) => {
          const buffer = new Buffer(SAMPLE_ANALYZED);
          fs.read(fd, buffer, 0, SAMPLE_PORTION, null, () => {
            fastimage.info(buffer, (infoError, info) => {
              verify(done, () => {
                expect(infoError).not.to.exist;
                expect(info).to.have.all.keys(["width", "height", "type", "time", "analyzed"]);
                expect(info.width).to.equal(SAMPLE_WIDTH);
                expect(info.height).to.equal(SAMPLE_HEIGHT);
                expect(info.type).to.equal("png");
                expect(info.analyzed).to.equal(SAMPLE_ANALYZED);
                expect(info.time).to.be.a("number");
              });
            });
          });
        });
      });

      it("should return a error when the data is not a image", done => {
        fs.open("/etc/hosts", "r", (error, fd) => {
          const buffer = new Buffer(SAMPLE_ANALYZED);
          fs.read(fd, buffer, 0, SAMPLE_PORTION, null, () => {
            fastimage.info(buffer, (infoError, info) => {
              verify(done, () => {
                expect(info).not.to.exist;
                expect(infoError).to.be.instanceof(fastimage.FastImageError);

                expect(infoError.code).to.equal("UNSUPPORTED_TYPE");
                expect(infoError.message).to.equal("Unsupported image data.");
              });
            });
          });
        });
      });
    });

    describe("it should handle the User-Agent", () => {
      let requestParams = {};

      beforeEach(() => {
        sinon.stub(request, "get", params => {
          requestParams = params;

          return {
            on(){
              // Do nothing
            }
          };
        });
      });

      afterEach(() => {
        request.get.restore();
      });

      it("not sending any header if no agent has been set", done => {
        fastimage.info("http://placehold.it/100x100.png");
        expect(requestParams.headers).not.to.exist;
        done(null);
      });

      it("sending the header if the agent has been set", done => {
        fastimage.userAgent("AGENT");
        fastimage.info("http://placehold.it/100x100.png");
        expect(requestParams.headers["User-Agent"]).to.equal("AGENT");
        done(null);
      });
    });
  });

  describe("filteredInfo", () => {
    it("should return the object through the filter function", done => {
      fastimage.filteredInfo(
        `${__dirname}/../examples/image.png`,
        info => { // eslint-disable-line arrow-body-style
          return {area: info.width * info.height, type: info.type};
        },
        (error, info) => {
          verify(done, () => {
            expect(error).not.to.exist;
            expect(info).to.have.all.keys(["area", "type"]);
            expect(info.area).to.equal(SAMPLE_OTHER_SIZE);
            expect(info.type).to.equal("png");
          });
        }
      );
    });
  });

  describe("size", () => {
    describe("URL", () => {
      it("should return the size of a image", done => {
        fastimage.size("http://placehold.it/200x100", (error, info) => {
          verify(done, () => {
            expect(info).to.eql({width: SAMPLE_OTHER_WIDTH, height: SAMPLE_OTHER_HEIGHT});
          });
        });
      });
    });

    describe("Path", () => {
      it("should return the size of a image", done => {
        fastimage.size(`${__dirname}/../examples/image.png`, (error, info) => {
          verify(done, () => {
            expect(info).to.eql({width: SAMPLE_WIDTH, height: SAMPLE_HEIGHT});
          });
        });
      });
    });

    describe("Buffer", () => {
      it("should return the size of a image", done => {
        fs.open(`${__dirname}/../examples/image.png`, "r", (error, fd) => {
          const buffer = new Buffer(SAMPLE_ANALYZED);
          fs.read(fd, buffer, 0, SAMPLE_PORTION, null, () => {
            fastimage.size(buffer, (sizeError, info) => {
              verify(done, () => {
                expect(info).to.eql({width: SAMPLE_WIDTH, height: SAMPLE_HEIGHT});
              });
            });
          });
        });
      });
    });
  });

  describe("type", () => {
    describe("URL", () => {
      it("should return the type of a image", done => {
        fastimage.type("http://placehold.it/200x100.png", (error, info) => {
          verify(done, () => {
            expect(info).to.equal("png");
          });
        });
      });
    });

    describe("Path", () => {
      it("should return the size of a image", done => {
        fastimage.type(`${__dirname}/../examples/image.png`, (error, info) => {
          verify(done, () => {
            expect(info).to.equal("png");
          });
        });
      });
    });

    describe("Buffer", () => {
      it("should return the size of a image", done => {
        fs.open(`${__dirname}/../examples/image.png`, "r", (error, fd) => {
          const buffer = new Buffer(SAMPLE_ANALYZED);
          fs.read(fd, buffer, 0, SAMPLE_PORTION, null, () => {
            fastimage.type(buffer, (typeError, info) => {
              verify(done, () => {
                expect(info).to.equal("png");
              });
            });
          });
        });
      });
    });
  });
});

describe("side cases", function(){
  this.timeout(TIMEOUT);

  // This is a file which is corrupted. To correctly recognize the threshold must be disabled.
  it("https://upload.wikimedia.org/wikipedia/commons/b/b2/%27Journey_to_the_Center_of_the_Earth%27_by_%C3%89douard_Riou_38.jpg", done => {
    fastimage.type("https://upload.wikimedia.org/wikipedia/commons/b/b2/%27Journey_to_the_Center_of_the_Earth%27_by_%C3%89douard_Riou_38.jpg", error => {
      expect(error.code).to.equal("UNSUPPORTED_TYPE");

      fastimage.threshold(-1);
      fastimage.type("https://upload.wikimedia.org/wikipedia/commons/b/b2/%27Journey_to_the_Center_of_the_Earth%27_by_%C3%89douard_Riou_38.jpg", (e, i) => {
        fastimage.threshold(null);
        expect(i).to.equal("jpg");
        done();
      });
    });
  });
});

/* eslint-enable no-unused-expressions, max-nested-callbacks */
