// The version is dynamically generated via build script in order not rely on require in the ESM case.
export class FastImageError extends Error {
    constructor(message, code, url, httpResponseCode) {
        super(message);
        this.code = `FASTIMAGE_${code}`;
        this.url = url;
        this.httpResponseCode = httpResponseCode;
    }
}
// Since it's harder to keep this in sync with package.json, let's use a different number.
export const userAgentVersion = '1.0.0';
export const defaultOptions = {
    timeout: 30000,
    threshold: 4096,
    userAgent: `fastimage/${userAgentVersion}`
};
