import { Request } from './Request';
import { IResponseOptions } from './types';
export declare class Response {
    url: string;
    body: string;
    error: string | null;
    statusCode: number;
    headers: Record<string, string>;
    request: Request;
    timings: {
        start: number;
        end: number;
        duration: number;
    };
    constructor(options: IResponseOptions);
    isSuccess(): boolean;
    json<T = any>(): T;
}
