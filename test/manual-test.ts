import { MultiCurl } from '../src/MultiCurl';

async function testBasicRequests() {
  console.log('🚀 Temel istek testi başlıyor...');
  
  const multiCurl = new MultiCurl({
    concurrency: 2,
    timeout: 10000,
    retries: 1
  });

  try {
    const responses = await multiCurl.execute([
      { url: 'https://www.cloudflare.com/', method: 'GET' },
      { url: 'https://www.cloudflare.com/', method: 'POST', body: { test: 'data' } },
      { url: 'https://www.cloudflare.com/', headers: { 'X-Custom-Header': 'Test' } }
    ]);

    responses.forEach((response, index) => {
      console.log(`\n✅ İstek ${index + 1} yanıtı:`);
      console.log(`URL: ${response.url}`);
      console.log(`Status: ${response.statusCode}`);
      console.log(`Headers: ${JSON.stringify(response.headers, null, 2)}`);
      console.log(`Body: ${response.body.substring(0, 100)}...`);
    });
  } catch (error) {
    console.error('❌ Test hatası:', error);
  }
}

async function testDockerCurl() {
  console.log('\n🐳 Docker curl testi başlıyor...');
  
  const multiCurl = new MultiCurl({
    concurrency: 1,
    timeout: 15000,
    retries: 1,
    curlConfig: {
      useDocker: true,
      dockerImage: 'badouralix/curl-http2:latest'
    }
  });

  try {
    const responses = await multiCurl.execute([
      { url: 'https://www.cloudflare.com/', method: 'GET' }
    ]);

    console.log(`\n✅ Docker curl yanıtı:`);
    console.log(`Status: ${responses[0].statusCode}`);
    console.log(`Body: ${responses[0].body.substring(0, 100)}...`);
  } catch (error) {
    console.error('❌ Docker test hatası:', error);
  }
}

// Tüm testleri çalıştır
async function runAllTests() {
  try {
    await testBasicRequests();
    await testDockerCurl();
    console.log('\n✨ Tüm testler tamamlandı');
  } catch (error) {
    console.error('⛔ Test çalışması sırasında beklenmeyen hata:', error);
  }
}

runAllTests();