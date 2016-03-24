/*
 * This file is part of the fastimage npm package. Copyright (C) 2015 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at http://www.opensource.org/licenses/mit-license.php.
 */

/* globals describe, it */
/* eslint-disable no-unused-expressions */

"use strict";

const expect = require("chai").expect;
const through = require("through");
const fs = require("fs");
const path = require("path");
const fastimage = require("../main");

const TIMEOUT = 5000;
const SAMPLE_WIDTH = 150;
const SAMPLE_HEIGHT = 150;
const SAMPLE_SIZE = 24090;

const verify = function(done, checks){
  try{
    checks();
    done();
  }catch(e){
    done(e);
  }
};

describe("using streams", function(){
  this.timeout(TIMEOUT);

  it("should allow readable only mode", done => {
    fastimage.stream(`${__dirname}/../examples/image.png`).pipe(through(info => {
      verify(done, () => {
        expect(info).to.have.all.keys(["width", "height", "type", "path", "realPath", "size", "time", "analyzed"]);
        expect(info.width).to.equal(SAMPLE_WIDTH);
        expect(info.height).to.equal(SAMPLE_HEIGHT);
        expect(info.type).to.equal("png");
        expect(info.path).to.equal(`${__dirname}/../examples/image.png`);
        expect(info.realPath).to.equal(path.resolve(`${__dirname}/../examples/image.png`));
        expect(info.analyzed).to.equal(0);
        expect(info.size).to.equal(SAMPLE_SIZE);
        expect(info.time).to.be.a("number");
      });
    }));
  });

  it("should allow duplex piping", done => {
    fs.createReadStream(`${__dirname}/../examples/image.png`).pipe(fastimage.stream()).pipe(through(info => {
      verify(done, () => {
        expect(info).to.have.all.keys(["width", "height", "type", "analyzed", "time"]);
        expect(info.width).to.equal(SAMPLE_WIDTH);
        expect(info.height).to.equal(SAMPLE_HEIGHT);
        expect(info.type).to.equal("png");
        expect(info.analyzed).to.equal(SAMPLE_SIZE);
        expect(info.time).to.be.a("number");
      });
    }));
  });

  it("should emit size event", done => {
    fastimage.stream(`${__dirname}/../examples/image.png`).on("size", info => {
      verify(done, () => {
        expect(info).to.eql({width: SAMPLE_WIDTH, height: SAMPLE_HEIGHT});
      });
    }).pipe(through());
  });

  it("should emit type event", done => {
    fastimage.stream(`${__dirname}/../examples/image.png`).on("type", info => {
      verify(done, () => {
        expect(info).to.equal("png");
      });
    }).pipe(through());
  });

  it("should respect buffer option", done => {
    fastimage.threshold(1);

    const stream = fastimage.stream().on("error", error => {
      fastimage.threshold(null);

      verify(done, () => {
        expect(error).to.be.instanceof(fastimage.FastImageError);

        expect(error.code).to.equal("UNSUPPORTED_TYPE");
        expect(error.message).to.equal("Unsupported image data.");
      });
    });

    fs.createReadStream("/etc/hosts").pipe(stream).pipe(through());
  });

  it("should emit error event", done => {
    fastimage.stream("/etc/hosts").on("error", error => {
      verify(done, () => {
        expect(error).to.be.instanceof(fastimage.FastImageError);

        expect(error.code).to.equal("UNSUPPORTED_TYPE");
        expect(error.message).to.equal("Unsupported image file.");
      });
    }).pipe(through());
  });
});

/* eslint-enable no-unused-expressions */
