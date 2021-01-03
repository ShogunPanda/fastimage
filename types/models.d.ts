export interface ImageInfo {
    width: number;
    height: number;
    type: string;
    time: number;
    analyzed: number;
    realUrl?: string;
    size?: number;
}
export interface Options {
    timeout: number;
    threshold: number;
    userAgent: string;
}
export declare class FastImageError extends Error {
    code: string;
    url?: string;
    httpResponseCode?: number;
    constructor(message: string, code: string, url?: string, httpResponseCode?: number);
}
export declare const defaultOptions: Options;
