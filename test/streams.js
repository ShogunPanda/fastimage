(function(){
  "use strict";

  var expect = require("expect.js");
  var through = require("through");
  var fs = require("fs");
  var path = require("path");

  var fastimage = require("../main");

  var verify = function(done, checks){
    try{
      checks();
      done();
    }catch(e){
      done(e);
    }
  };

  describe("using streams", function(){
    this.timeout(5000);

    it("should allow readable only mode", function(done){
      fastimage.stream(__dirname + "/../examples/image.png").pipe(through(function(info){
        verify(done, function(){
          expect(info).to.only.have.keys(["width", "height", "type", "path", "realPath", "size", "time", "analyzed"]);
          expect(info.width).to.equal(150);
          expect(info.height).to.equal(150);
          expect(info.type).to.equal("png");
          expect(info.path).to.equal(__dirname + "/../examples/image.png");
          expect(info.realPath).to.equal(path.resolve(__dirname + "/../examples/image.png"));
          expect(info.analyzed).to.equal(0);
          expect(info.size).to.equal(24090);
          expect(info.time).to.be.a("number");
        });
      }));
    });

    it("should allow duplex piping", function(done){
      fs.createReadStream(__dirname + "/../examples/image.png").pipe(fastimage.stream()).pipe(through(function(info){
        verify(done, function(){
          expect(info).to.only.have.keys(["width", "height", "type", "analyzed", "time"]);
          expect(info.width).to.equal(150);
          expect(info.height).to.equal(150);
          expect(info.type).to.equal("png");
          expect(info.analyzed).to.equal(24090);
          expect(info.time).to.be.a("number");
        });
      }));
    });

    it("should emit size event", function(done){
      fastimage.stream(__dirname + "/../examples/image.png").on("size", function(info){
        verify(done, function(){
          expect(info).to.eql({width: 150, height: 150});
        });
      }).pipe(through());;
    });

    it("should emit type event", function(done){
      fastimage.stream(__dirname + "/../examples/image.png").on("type", function(info){
        verify(done, function(){
          expect(info).to.equal("png");
        });
      }).pipe(through());;
    });

    it("should respect buffer option", function(done){
      fastimage.threshold(1);

      var stream = fastimage.stream().on("error", function(error){
        fastimage.threshold(null);

        verify(done, function(){
          expect(error).to.be.a(fastimage.FastImageError);

          expect(error.code).to.equal("UNSUPPORTED_TYPE");
          expect(error.message).to.equal("Unsupported image data.");
        });
      });

      fs.createReadStream("/etc/hosts").pipe(stream).pipe(through());
    });

    it("should emit error event", function(done){
      fastimage.stream("/etc/hosts").on("error", function(error){
        verify(done, function(){
          expect(error).to.be.a(fastimage.FastImageError);

          expect(error.code).to.equal("UNSUPPORTED_TYPE");
          expect(error.message).to.equal("Unsupported image file.");
        });
      }).pipe(through());
    });
  });
})();