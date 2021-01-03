/// <reference types="node" />
import { HTTPError, Response } from 'got';
import { Stream } from 'stream';
import { Callback } from './callback';
import { FastImageError } from './models';
export declare function toStream(source: string | Stream | Buffer, timeout: number, threshold: number, userAgent: string): [Stream, string | undefined];
export declare function handleData(buffer: Buffer, response: Response | undefined, threshold: number, start: bigint, callback: Callback): boolean;
export declare function handleError(error: FastImageError | HTTPError, url: string): Error;
