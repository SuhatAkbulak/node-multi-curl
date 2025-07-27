import { MultiCurl } from '../src/MultiCurl';

const multiCurl = new MultiCurl();

// Example of adding requests
multiCurl.addRequest({
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
});

multiCurl.addRequest({
    url: 'https://jsonplaceholder.typicode.com/posts/2',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Execute all requests
multiCurl.execute()
    .then(responses => {
        responses.forEach(response => {
            console.log(`Response from ${response.url}:`, response.body);
        });
    })
    .catch(error => {
        console.error('Error executing requests:', error);
    });