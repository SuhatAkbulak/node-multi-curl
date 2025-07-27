import { MultiCurl } from '../src/MultiCurl';

async function main() {
    // Proxy listesi ile doğrudan MultiCurl oluştur
    const multiCurl = new MultiCurl({
        concurrency: 5,
        timeout: 30000,
        retries: 3,
        proxies: [
            'http://proxy1.example.com:8080',
            'http://proxy2.example.com:8080'
        ]
    });

    // İstekleri tanımla
    const requests = [
        { url: 'https://api.example.com/data1', method: 'GET' },
        { url: 'https://api.example.com/data2', method: 'GET' },
        { url: 'https://api.example.com/data3', method: 'GET' },
        { url: 'https://api.example.com/data4', method: 'GET' },
        { url: 'https://api.example.com/data5', method: 'GET' },
    ];

    try {
        // İstekleri doğrudan execute'a geçir
        const responses = await multiCurl.execute(requests);
        
        // Yanıtları işle
        responses.forEach(response => {
            console.log(`URL: ${response.url}`);
            console.log(`Status: ${response.statusCode}`);
            console.log(`Duration: ${response.timings.duration}ms`);
            console.log(`Body: ${response.body.substring(0, 100)}...`);
            console.log('-'.repeat(50));
        });
    } catch (error) {
        console.error('Error executing requests:', error);
    }
}

main();