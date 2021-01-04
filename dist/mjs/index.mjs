import { ensurePromiseCallback } from "./callback.mjs";
import { handleData, handleError, toStream } from "./internals.mjs";
import { defaultOptions, FastImageError } from "./models.mjs";
import { FastImageStream } from "./stream.mjs";
export function info(source, options, cb) {
    // Normalize arguments
    if (typeof options === 'function') {
        cb = options;
        options = {};
    }
    const { timeout, threshold, userAgent } = { ...defaultOptions, ...options };
    // Prepare execution
    let finished = false;
    let response;
    let buffer = Buffer.alloc(0);
    const [callback, promise] = ensurePromiseCallback(cb);
    const start = process.hrtime.bigint();
    // Make sure the source is always a Stream
    let stream;
    let url;
    try {
        ;
        [stream, url] = toStream(source, timeout, threshold, userAgent);
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
        finished = handleData(buffer, response, threshold, start, callback);
    });
    stream.on('error', (error) => {
        callback(handleError(error, url));
    });
    stream.on('end', () => {
        if (finished) {
            return;
        }
        // We have reached the end without figuring the image type. Just give up
        callback(new FastImageError('Unsupported data.', 'UNSUPPORTED'));
    });
    return promise;
}
export function stream(options) {
    return new FastImageStream(options !== null && options !== void 0 ? options : {});
}
