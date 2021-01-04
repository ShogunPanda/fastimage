import { Writable } from 'stream';
import { handleData } from "./internals.mjs";
import { defaultOptions, FastImageError } from "./models.mjs";
export class FastImageStream extends Writable {
    constructor(options) {
        var _a;
        super(options);
        this.threshold = (_a = options.threshold) !== null && _a !== void 0 ? _a : defaultOptions.threshold;
        this.buffer = Buffer.alloc(0);
        this.start = process.hrtime.bigint();
        this.finished = false;
    }
    analyze(chunk) {
        this.buffer = Buffer.concat([this.buffer, chunk]);
        this.finished = handleData(this.buffer, undefined, this.threshold, this.start, (error, data) => {
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
        cb(new FastImageError('Unsupported data.', 'UNSUPPORTED'));
    }
}
