// The version is dynamically generated via build script in order not rely on require in the ESM case.
import { version } from "./version.mjs";
export class FastImageError extends Error {
    constructor(message, code, url, httpResponseCode) {
        super(message);
        this.code = `FASTIMAGE_${code}`;
        this.url = url;
        this.httpResponseCode = httpResponseCode;
    }
}
export const defaultOptions = {
    timeout: 30000,
    threshold: 4096,
    userAgent: `fastimage/${version}`
};
