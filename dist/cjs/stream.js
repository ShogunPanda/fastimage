"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FastImageStream = void 0;
const stream_1 = require("stream");
const internals_1 = require("./internals");
const models_1 = require("./models");
class FastImageStream extends stream_1.Writable {
    constructor(options) {
        var _a;
        super(options);
        this.threshold = (_a = options.threshold) !== null && _a !== void 0 ? _a : models_1.defaultOptions.threshold;
        this.buffer = Buffer.alloc(0);
        this.start = process.hrtime.bigint();
        this.finished = false;
    }
    analyze(chunk) {
        this.buffer = Buffer.concat([this.buffer, chunk]);
        this.finished = internals_1.handleData(this.buffer, undefined, this.threshold, this.start, (error, data) => {
            if (error) {
                this.emit('error', error);
            }
            else {
                this.emit('info', data);
            }
            this.destroy();
        });
    }
    _write(chunk, _e, cb) {
        this.analyze(chunk);
        cb();
    }
    /* istanbul ignore next */
    _writev(chunks, cb) {
        for (const { chunk } of chunks) {
            this.analyze(chunk);
        }
        cb();
    }
    _final(cb) {
        /* istanbul ignore if */
        if (this.finished) {
            cb();
            return;
        }
        cb(new models_1.FastImageError('Unsupported data.', 'UNSUPPORTED'));
    }
}
exports.FastImageStream = FastImageStream;
