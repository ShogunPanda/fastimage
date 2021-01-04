import { createReadStream } from 'fs';
import got from 'got';
import imageSize from 'image-size';
import { Readable } from 'stream';
import { FastImageError } from "./models.mjs";
export function toStream(source, timeout, threshold, userAgent) {
    let url;
    const highWaterMark = threshold > 0 ? Math.floor(threshold / 10) : 1024;
    // If the source is a buffer, get it as stream
    if (Buffer.isBuffer(source)) {
        source = Readable.from(source, { highWaterMark });
    }
    else if (typeof source === 'string') {
        // Try to parse the source as URL - If it succeeds, we will fetch it
        try {
            const parsedUrl = new URL(source);
            if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
                throw new FastImageError('Invalid URL.', 'URL_ERROR', parsedUrl.toString());
            }
            url = source;
            source = got.stream(parsedUrl.toString(), {
                headers: { 'user-agent': userAgent },
                followRedirect: true,
                timeout
            });
        }
        catch (e) {
            if (e.code === 'FASTIMAGE_URL_ERROR') {
                throw e;
            }
            // Parsing failed. Treat as local file
            source = createReadStream(source, { highWaterMark });
        }
    }
    return [source, url];
}
export function handleData(buffer, response, threshold, start, callback) {
    try {
        const info = imageSize(buffer);
        const data = {
            width: info.width,
            height: info.height,
            type: info.type,
            time: Number(process.hrtime.bigint() - start) / 1e6,
            analyzed: buffer.length
        };
        // Add URL informations
        if (response) {
            data.realUrl = response.url;
            /* istanbul ignore else */
            if ('content-length' in response.headers) {
                data.size = parseInt(response.headers['content-length'], 10);
            }
        }
        // Close the URL if possible
        if (response) {
            response.destroy();
        }
        callback(null, data);
        return true;
    }
    catch (e) {
        // Check threshold
        if (threshold > 0 && buffer.length > threshold) {
            if (response) {
                response.destroy();
            }
            callback(new FastImageError('Unsupported data.', 'UNSUPPORTED'));
            return true;
        }
        return false;
    }
}
export function handleError(error, url) {
    let message = null;
    let code = 'NETWORK_ERROR';
    switch (error.code) {
        case 'EISDIR':
            code = 'FS_ERROR';
            message = 'Source is a directory.';
            break;
        case 'ENOENT':
            code = 'FS_ERROR';
            message = 'Source not found.';
            break;
        case 'EACCES':
            code = 'FS_ERROR';
            message = 'Source is not readable.';
            break;
        case 'ENOTFOUND':
            message = 'Invalid remote host requested.';
            break;
        case 'ECONNRESET':
        case 'EPIPE':
            message = 'Connection with the remote host interrupted.';
            break;
        case 'ECONNREFUSED':
            message = 'Connection refused from the remote host.';
            break;
        case 'ETIMEDOUT':
            message = 'Connection to the remote host timed out.';
            break;
    }
    if (error.response) {
        message = `Remote host replied with HTTP ${error.response.statusCode}.`;
    }
    /* istanbul ignore else */
    if (message) {
        error = new FastImageError(message, code, url);
    }
    return error;
}
