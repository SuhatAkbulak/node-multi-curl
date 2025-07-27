import { MultiCurl } from '../src/MultiCurl';

async function runBatchRequests() {
    const multiCurl = new MultiCurl();

    // Define an array of request URLs
    const requests = [
        { url: 'https://jsonplaceholder.typicode.com/posts/1', method: 'GET' },
        { url: 'https://jsonplaceholder.typicode.com/posts/2', method: 'GET' },
        { url: 'https://jsonplaceholder.typicode.com/posts/3', method: 'GET' },
        { url: 'https://jsonplaceholder.typicode.com/posts/4', method: 'GET' },
        { url: 'https://jsonplaceholder.typicode.com/posts/5', method: 'GET' },
    ];

    // Add requests to MultiCurl
    requests.forEach(request => {
        multiCurl.addRequest(request);
    });

    // Execute all requests concurrently
    try {
        const responses = await multiCurl.execute();
        console.log('Batch Request Responses:', responses);
    } catch (error) {
        console.error('Error executing batch requests:', error);
    }
}

// Run the batch requests example
runBatchRequests();