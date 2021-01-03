import { ImageInfo } from './models';
export declare type Callback = (error: Error | null, info?: ImageInfo) => void;
export declare function ensurePromiseCallback(callback?: Callback): [Callback, Promise<ImageInfo>?];
