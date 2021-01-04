"use strict";
// The version is dynamically generated via build script in order not rely on require in the ESM case.
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultOptions = exports.userAgentVersion = exports.FastImageError = void 0;
class FastImageError extends Error {
    constructor(message, code, url, httpResponseCode) {
        super(message);
        this.code = `FASTIMAGE_${code}`;
        this.url = url;
        this.httpResponseCode = httpResponseCode;
    }
}
exports.FastImageError = FastImageError;
// Since it's harder to keep this in sync with package.json, let's use a different number.
exports.userAgentVersion = '1.0.0';
exports.defaultOptions = {
    timeout: 30000,
    threshold: 4096,
    userAgent: `fastimage/${exports.userAgentVersion}`
};
