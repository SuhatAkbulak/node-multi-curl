import { MultiCurl } from '../../src/MultiCurl';
import { Request } from '../../src/Request';
import { Response } from '../../src/Response';

jest.mock('child_process');

describe('MultiCurl', () => {
    let multiCurl: MultiCurl;

    beforeEach(() => {
        multiCurl = new MultiCurl();
    });

    test('addRequest should add a request to the queue', () => {
        const request = multiCurl.addRequest({ url: 'https://example.com', method: 'GET' });
        
        expect(request.url).toBe('https://example.com');
        expect(request.method).toBe('GET');
    });

    test('addRequests should add multiple requests', () => {
        const requests = multiCurl.addRequests([
            { url: 'https://example.com', method: 'GET' },
            { url: 'https://example.org', method: 'GET' }
        ]);
        
        expect(requests.length).toBe(2);
        expect(requests[0].url).toBe('https://example.com');
        expect(requests[1].url).toBe('https://example.org');
    });

    test('execute should process requests and return responses', async () => {
        // Mock the exec implementation for testing
        const mockExec = require('child_process').exec as jest.Mock;
        mockExec.mockImplementation((cmd, options, callback) => {
            callback(null, 'HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{"data":"test"}', '');
            return { stdout: {}, stderr: {} };
        });

        const responses = await multiCurl.execute([
            { url: 'https://example.com', method: 'GET' }
        ]);
        
        expect(responses.length).toBe(1);
        expect(responses[0].statusCode).toBe(200); // Changed from status to statusCode
        expect(responses[0].body).toContain('{"data":"test"}');
    });
});