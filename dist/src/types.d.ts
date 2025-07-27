import { Request } from './Request';
export interface IMultiCurlOptions {
    concurrency?: number;
    timeout?: number;
    retries?: number;
    proxies?: string[];
    curlConfig?: {
        useDocker?: boolean;
        dockerImage?: string;
    };
}
export interface IRequestOptions {
    url: string;
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    proxy?: string;
    timeout?: number;
    id?: string;
}
export interface IResponseOptions {
    url: string;
    body: string;
    error?: string | null;
    statusCode: number;
    headers?: Record<string, string>;
    request: Request;
}
