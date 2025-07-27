import { MultiCurl } from '../../src/MultiCurl';
import { Request } from '../../src/Request';
import { Response } from '../../src/Response';

describe('Integration Tests for MultiCurl Requests', () => {
    let multiCurl: MultiCurl;

    beforeEach(() => {
        multiCurl = new MultiCurl();
    });

    test('should successfully execute multiple requests', async () => {
        const responses: Response[] = await multiCurl.execute([
            { url: 'https://jsonplaceholder.typicode.com/posts/1', method: 'GET' },
            { url: 'https://jsonplaceholder.typicode.com/posts/2', method: 'GET' },
            { url: 'https://jsonplaceholder.typicode.com/posts/3', method: 'GET' },
        ]);

        expect(responses).toHaveLength(3);
        responses.forEach((response) => {
            expect(response.statusCode).toBe(200);
            expect(response.body).toBeDefined();
        });
    });

    test('should handle request errors gracefully', async () => {
        const responses: Response[] = await multiCurl.execute([
            { url: 'https://jsonplaceholder.typicode.com/invalid-url', method: 'GET' },
            { url: 'https://jsonplaceholder.typicode.com/posts/2', method: 'GET' },
        ]);

        expect(responses).toHaveLength(2);
        expect(responses[0].statusCode).not.toBe(200);
        expect(responses[1].statusCode).toBe(200);
    });

    test('should support proxy usage', async () => {
        // MultiCurl'de proxy tanımlama yöntemi farklı, constructor'da tanımlıyoruz
        const multiCurlWithProxy = new MultiCurl({
            proxies: ['http://proxy-server:8080']
        });

        const responses: Response[] = await multiCurlWithProxy.execute([
            { url: 'https://jsonplaceholder.typicode.com/posts/1', method: 'GET' },
            { url: 'https://jsonplaceholder.typicode.com/posts/2', method: 'GET' },
        ]);

        expect(responses).toHaveLength(2);
        responses.forEach((response) => {
            expect(response.statusCode).toBe(200);
        });
    });
});