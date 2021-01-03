"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultOptions = exports.FastImageError = void 0;
class FastImageError extends Error {
    constructor(message, code, url, httpResponseCode) {
        super(message);
        this.code = `FASTIMAGE_${code}`;
        this.url = url;
        this.httpResponseCode = httpResponseCode;
    }
}
exports.FastImageError = FastImageError;
exports.defaultOptions = {
    timeout: 30000,
    threshold: 4096,
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    userAgent: `fastimage/${require('../package.json').version}`
};
