/*
 * This file is part of the fastimage node module. Copyright (C) 2015 and above Shogun <shogun@cowtech.it>.
 * Licensed under the MIT license, which can be found at http://www.opensource.org/licenses/mit-license.php.
 */

(function(){
  "use strict";

  var expect = require("expect.js");
  var path = require("path");
  var sinon = require("sinon");
  var request = require("request");

  var fastimage = require("../main");

  var verify = function(done, checks){
    try{
      checks();
      done();
    }catch(e){
      done(e);
    }
  };

  describe("using promises", function(){
    this.timeout(5000);

    describe("info", function(){
      it("should resolve providing the info", function(done){
        fastimage.info(__dirname + "/../examples/image.png").then(function(info){
          verify(done, function(){
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

      it("should reject providing the error", function(done){
        fastimage.info("/etc/hosts").catch(function(error){
          verify(done, function(){
            expect(error).to.be.a(fastimage.FastImageError);

            expect(error.code).to.equal("UNSUPPORTED_TYPE");
            expect(error.message).to.equal("Unsupported image file.");
          });
        });
      });
    });

    describe("filteredInfo", function(){
      it("should resolve providing the info", function(done){
        fastimage.filteredInfo(
          __dirname + "/../examples/image.png",
          function(info){
            return {area: info.width * info.height, type: info.type};
          }
        ).then(function(info){
          verify(done, function(){
            expect(info).to.only.have.keys(["area", "type"]);
            expect(info.area).to.equal(22500);
            expect(info.type).to.equal("png");
          });
        });
      });

      it("should reject providing the error", function(done){
        fastimage.filteredInfo("/etc/hosts").catch(function(error){
          verify(done, function(){
            expect(error).to.be.a(fastimage.FastImageError);

            expect(error.code).to.equal("UNSUPPORTED_TYPE");
            expect(error.message).to.equal("Unsupported image file.");
          });
        });
      });
    });

    describe("size", function(){
      it("should resolve providing the info", function(done){
        fastimage.size(__dirname + "/../examples/image.png").then(function(info){
          verify(done, function(){
            expect(info).to.eql({width: 150, height: 150});
          });
        });
      });

      it("should reject providing the error", function(done){
        fastimage.size("/etc/hosts").catch(function(error){
          verify(done, function(){
            expect(error).to.be.a(fastimage.FastImageError);

            expect(error.code).to.equal("UNSUPPORTED_TYPE");
            expect(error.message).to.equal("Unsupported image file.");
          });
        });
      });
    });

    describe("type", function(){
      it("should resolve providing the info", function(done){
        fastimage.type(__dirname + "/../examples/image.png").then(function(info){
          verify(done, function(){
            expect(info).to.equal("png");
          });
        });
      });

      it("should reject providing the error", function(done){
        fastimage.type("/etc/hosts").catch(function(error){
          verify(done, function(){
            expect(error).to.be.a(fastimage.FastImageError);

            expect(error.code).to.equal("UNSUPPORTED_TYPE");
            expect(error.message).to.equal("Unsupported image file.");
          });
        });
      });
    });

    describe("outgoing request", function(){
      var waitForTestToCallRequest, defaultUserAgent;

      beforeEach(function(){
        defaultUserAgent = "Fast Image - Node Image Lookup - https://www.npmjs.com/package/fastimage";
        waitForTestToCallRequest = new Promise(function (res) {
          sinon.stub(request, "get", function (outgoingRequest) {
            res(outgoingRequest);
            var ret = {
              on: function () {
                return ret;
              }
            };
            return ret;
          });
        });
      });
      afterEach(function(){
        request.get.restore();
      });

      it("should contain a default user agent string", function (done) {
        waitForTestToCallRequest.then(function (outgoingRequest) {
          expect(outgoingRequest.headers["user-agent"]).to.be(defaultUserAgent);
          done();
        }).catch(done);

        fastimage.info("http://example.com/");
      });

      it("should contain a default user agent string", function (done) {
        var newUserAgentString = "Hello World!";

        waitForTestToCallRequest.then(function (outgoingRequest) {
          expect(outgoingRequest.headers["user-agent"]).to.be(newUserAgentString);
          done();
        }).catch(done);

        fastimage.userAgent(newUserAgentString);
        fastimage.info("http://example.com/");
      });

      it("should have a standard setter/getter for user agent string", function (done) {
        waitForTestToCallRequest.then(function (outgoingRequest) {
          expect(outgoingRequest.headers["user-agent"]).to.be(defaultUserAgent);
          done();
        }).catch(done);

        fastimage.userAgent("this will never actually be used");
        expect(fastimage.userAgent()).to.eql("this will never actually be used");
        fastimage.userAgent(null);
        expect(fastimage.userAgent()).to.eql(defaultUserAgent);
        fastimage.info("http://example.com/");
      });
    });
  });
})();
