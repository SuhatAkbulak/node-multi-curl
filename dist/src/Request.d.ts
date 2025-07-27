import { IRequestOptions } from './types';
export declare class Request {
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: any;
    proxy?: string;
    timeout?: number;
    id: string;
    startTime: number;
    constructor(options: IRequestOptions);
}
