"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultOptions = exports.FastImageError = void 0;
// The version is dynamically generated via build script in order not rely on require in the ESM case.
const version_1 = require("./version");
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
    userAgent: `fastimage/${version_1.version}`
};
