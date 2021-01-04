"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stream = exports.info = void 0;
const callback_1 = require("./callback");
const internals_1 = require("./internals");
const models_1 = require("./models");
const stream_1 = require("./stream");
function info(source, options, cb) {
    // Normalize arguments
    if (typeof options === 'function') {
        cb = options;
        options = {};
    }
    const { timeout, threshold, userAgent } = { ...models_1.defaultOptions, ...options };
    // Prepare execution
    let finished = false;
    let response;
    let buffer = Buffer.alloc(0);
    const [callback, promise] = callback_1.ensurePromiseCallback(cb);
    const start = process.hrtime.bigint();
    // Make sure the source is always a Stream
    let stream;
    let url;
    try {
        ;
        [stream, url] = internals_1.toStream(source, timeout, threshold, userAgent);
    }
    catch (e) {
        callback(e);
        return promise;
    }
    // When dealing with URLs, save the response to extract data later
    stream.on('response', (r) => {
        response = r;
    });
    stream.on('data', (chunk) => {
        if (finished) {
            return;
        }
        buffer = Buffer.concat([buffer, chunk]);
        finished = internals_1.handleData(buffer, response, threshold, start, callback);
    });
    stream.on('error', (error) => {
        callback(internals_1.handleError(error, url));
    });
    stream.on('end', () => {
        if (finished) {
            return;
        }
        // We have reached the end without figuring the image type. Just give up
        callback(new models_1.FastImageError('Unsupported data.', 'UNSUPPORTED'));
    });
    return promise;
}
exports.info = info;
function stream(options) {
    return new stream_1.FastImageStream(options !== null && options !== void 0 ? options : {});
}
exports.stream = stream;
