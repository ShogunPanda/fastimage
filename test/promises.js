/*
 * This file is part of the fastimage npm package. Copyright (C) 2015 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at https://choosealicense.com/licenses/mit.
 */

/* globals describe, it */
/* eslint-disable no-unused-expressions */

"use strict";

const expect = require("chai").expect;
const path = require("path");
const fastimage = require("../main");

const TIMEOUT = 5000;
const SAMPLE_WIDTH = 150;
const SAMPLE_HEIGHT = 150;
const SAMPLE_SIZE = 24090;
const SAMPLE_OTHER_SIZE = 22500;

const verify = function(done, checks){
  try{
    checks();
    done();
  }catch(e){
    done(e);
  }
};

describe("using promises", function(){
  this.timeout(TIMEOUT);

  describe("info", () => {
    it("should resolve providing the info", done => {
      fastimage.info(`${__dirname}/../examples/image.png`).then(info => {
        verify(done, () => {
          expect(info).to.have.all.keys(["width", "height", "type", "path", "realPath", "size", "time"]);
          expect(info.width).to.equal(SAMPLE_WIDTH);
          expect(info.height).to.equal(SAMPLE_HEIGHT);
          expect(info.type).to.equal("png");
          expect(info.path).to.equal(`${__dirname}/../examples/image.png`);
          expect(info.realPath).to.equal(path.resolve(`${__dirname}/../examples/image.png`));
          expect(info.size).to.equal(SAMPLE_SIZE);
          expect(info.time).to.a("number");
        });
      });
    });

    it("should reject providing the error", done => {
      fastimage.info("/etc/hosts").catch(error => {
        verify(done, () => {
          expect(error).to.be.instanceof(fastimage.FastImageError);

          expect(error.code).to.equal("UNSUPPORTED_TYPE");
          expect(error.message).to.equal("Unsupported image file.");
        });
      });
    });
  });

  describe("filteredInfo", () => {
    it("should resolve providing the info", done => {
      fastimage.filteredInfo(
        `${__dirname}/../examples/image.png`,
        info => { // eslint-disable-line arrow-body-style
          return {area: info.width * info.height, type: info.type};
        }
      ).then(info => {
        verify(done, () => {
          expect(info).to.have.all.keys(["area", "type"]);
          expect(info.area).to.equal(SAMPLE_OTHER_SIZE);
          expect(info.type).to.equal("png");
        });
      });
    });

    it("should reject providing the error", done => {
      fastimage.filteredInfo("/etc/hosts").catch(error => {
        verify(done, () => {
          expect(error).to.be.instanceof(fastimage.FastImageError);

          expect(error.code).to.equal("UNSUPPORTED_TYPE");
          expect(error.message).to.equal("Unsupported image file.");
        });
      });
    });
  });

  describe("size", () => {
    it("should resolve providing the info", done => {
      fastimage.size(`${__dirname}/../examples/image.png`).then(info => {
        verify(done, () => {
          expect(info).to.eql({width: SAMPLE_WIDTH, height: SAMPLE_HEIGHT});
        });
      });
    });

    it("should reject providing the error", done => {
      fastimage.size("/etc/hosts").catch(error => {
        verify(done, () => {
          expect(error).to.be.instanceof(fastimage.FastImageError);

          expect(error.code).to.equal("UNSUPPORTED_TYPE");
          expect(error.message).to.equal("Unsupported image file.");
        });
      });
    });
  });

  describe("type", () => {
    it("should resolve providing the info", done => {
      fastimage.type(`${__dirname}/../examples/image.png`).then(info => {
        verify(done, () => {
          expect(info).to.equal("png");
        });
      });
    });

    it("should reject providing the error", done => {
      fastimage.type("/etc/hosts").catch(error => {
        verify(done, () => {
          expect(error).to.be.instanceof(fastimage.FastImageError);

          expect(error.code).to.equal("UNSUPPORTED_TYPE");
          expect(error.message).to.equal("Unsupported image file.");
        });
      });
    });
  });
});

/* eslint-enable no-unused-expressions */
