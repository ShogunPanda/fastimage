/// <reference types="node" />
import { Writable, WritableOptions } from 'stream';
import { Options } from './models';
export declare class FastImageStream extends Writable {
    buffer: Buffer;
    threshold: number;
    start: bigint;
    finished: boolean;
    constructor(options: Partial<Options> & WritableOptions);
    analyze(chunk: Buffer): void;
    _write(chunk: any, _e: BufferEncoding, cb: (error?: Error | null) => void): void;
    _writev(chunks: Array<{
        chunk: any;
    }>, cb: (error?: Error | null) => void): void;
    _final(cb: (error?: Error | null) => void): void;
}
