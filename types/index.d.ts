/// <reference types="node" />
import { Stream, Writable, WritableOptions } from 'stream';
import { Callback } from './callback';
import { ImageInfo, Options } from './models';
export declare function info(source: string | Stream | Buffer, options?: Partial<Options> | Callback, cb?: Callback): Promise<ImageInfo>;
export declare function stream(options?: Partial<Options> & Partial<WritableOptions>): Writable;
