import { Request } from './Request';
import { Response } from './Response';
import { IMultiCurlOptions, IRequestOptions } from './types';
import { InterceptorManager } from './InterceptorManager';
export declare class MultiCurl {
    private requests;
    private proxyManager?;
    private queueManager;
    private concurrency;
    private timeout;
    private retries;
    private useDockerCurl;
    private dockerImage;
    readonly interceptors: {
        request: InterceptorManager<Request>;
        response: InterceptorManager<Response>;
    };
    static get(url: string, options?: Partial<IRequestOptions>): Promise<Response>;
    static post(url: string, data?: any, options?: Partial<IRequestOptions>): Promise<Response>;
    static put(url: string, data?: any, options?: Partial<IRequestOptions>): Promise<Response>;
    static delete(url: string, options?: Partial<IRequestOptions>): Promise<Response>;
    static create(options?: IMultiCurlOptions): MultiCurl;
    constructor(options?: IMultiCurlOptions);
    get(url: string, options?: Partial<IRequestOptions>): Promise<Response>;
    post(url: string, data?: any, options?: Partial<IRequestOptions>): Promise<Response>;
    put(url: string, data?: any, options?: Partial<IRequestOptions>): Promise<Response>;
    delete(url: string, options?: Partial<IRequestOptions>): Promise<Response>;
    addRequest(options: IRequestOptions): Request;
    addRequests(requestsOptions: IRequestOptions[]): Request[];
    execute(requestsOptions?: IRequestOptions[]): Promise<Response[]>;
    private executeRequest;
    private buildCurlCommand;
    private extractStatusCode;
    private extractHeaders;
    private extractBody;
    private isDockerAvailable;
}
