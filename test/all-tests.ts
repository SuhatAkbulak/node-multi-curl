import { MultiCurl } from '../src/MultiCurl';

/**
 * Temel HTTP yöntemlerini test eder
 */
async function testHttpMethods() {
  console.log('🔄 HTTP yöntemleri testi başlıyor...');
  
  try {
    // GET isteği
    console.log('GET isteği yapılıyor...');
    const getResponse = await MultiCurl.get('https://httpbin.org/get?param=test');
    console.log(`✅ GET durum kodu: ${getResponse.statusCode}`);

    // POST isteği
    console.log('POST isteği yapılıyor...');
    const postData = { name: 'test', value: 'data' };
    const postResponse = await MultiCurl.post('https://httpbin.org/post', postData);
    console.log(`✅ POST durum kodu: ${postResponse.statusCode}`);

    // PUT isteği
    console.log('PUT isteği yapılıyor...');
    const putResponse = await MultiCurl.put('https://httpbin.org/put', { updated: true });
    console.log(`✅ PUT durum kodu: ${putResponse.statusCode}`);

    // DELETE isteği
    console.log('DELETE isteği yapılıyor...');
    const deleteResponse = await MultiCurl.delete('https://httpbin.org/delete');
    console.log(`✅ DELETE durum kodu: ${deleteResponse.statusCode}`);
  } catch (error) {
    console.error('❌ HTTP yöntemleri testi başarısız:', error);
  }
}

/**
 * İnterceptor kullanımını test eder
 */
async function testInterceptors() {
  console.log('\n🔄 Interceptor testi başlıyor...');
  
  try {
    const client = MultiCurl.create();
    
    // İstek interceptor'ı ekle
    client.interceptors.request.use(request => {
      request.headers = { ...request.headers, 'X-Custom-Header': 'Test-Value' };
      console.log('✅ İstek interceptor çalıştı');
      return request;
    });
    
    // Yanıt interceptor'ı ekle
    client.interceptors.response.use(response => {
      console.log('✅ Yanıt interceptor çalıştı');
      return response;
    });
    
    const response = await client.get('https://httpbin.org/headers');
    console.log(`✅ Yanıt durum kodu: ${response.statusCode}`);
    console.log(`✅ Özel başlık gönderildi mi: ${response.body.includes('X-Custom-Header')}`);
  } catch (error) {
    console.error('❌ Interceptor testi başarısız:', error);
  }
}

/**
 * Çoklu istek ve eşzamanlılık testi
 */
async function testConcurrentRequests() {
  console.log('\n🔄 Çoklu istek testi başlıyor...');
  
  try {
    const client = MultiCurl.create({
      concurrency: 2 // Sadece 2 eşzamanlı istek
    });
    
    const startTime = Date.now();
    
    // 5 istek ekle
    const responses = await client.execute([
      { url: 'https://httpbin.org/delay/1' },
      { url: 'https://httpbin.org/delay/1' },
      { url: 'https://httpbin.org/delay/1' },
      { url: 'https://httpbin.org/delay/1' },
      { url: 'https://httpbin.org/delay/1' }
    ]);
    
    const duration = Date.now() - startTime;
    
    console.log(`✅ 5 istek tamamlandı, süre: ${duration}ms`);
    console.log(`✅ Tüm yanıtlar başarılı: ${responses.every(r => r.statusCode === 200)}`);
    
    // Eğer concurrency 2 ise ve her istek ~1 saniye sürüyorsa, toplam süre ~2.5 saniye olmalı
    // (5 istek / 2 eşzamanlılık = 3 batch, ilk iki batch 2 istek, son batch 1 istek)
    if (duration > 2000 && duration < 4000) {
      console.log('✅ Eşzamanlılık kontrolü doğru çalışıyor');
    } else {
      console.log('⚠️ Eşzamanlılık kontrolü beklendiği gibi çalışmıyor olabilir');
    }
  } catch (error) {
    console.error('❌ Çoklu istek testi başarısız:', error);
  }
}

/**
 * Docker curl testi
 */
async function testDockerCurl() {
  console.log('\n🔄 Docker curl testi başlıyor...');
  
  try {
    const client = MultiCurl.create({
      curlConfig: {
        useDocker: true,
        dockerImage: 'badouralix/curl-http2:latest'
      }
    });
    
    const response = await client.get('https://httpbin.org/get');
    console.log(`✅ Docker curl yanıtı durum kodu: ${response.statusCode}`);
  } catch (error) {
    console.warn('⚠️ Docker testi başarısız (Docker kurulu olmayabilir):', 
      error instanceof Error ? error.message : String(error));
  }
}

/**
 * Hata durumunu ve yeniden deneme mekanizmasını test eder
 */
async function testRetryMechanism() {
  console.log('\n🔄 Yeniden deneme testi başlıyor...');
  
  try {
    const client = MultiCurl.create({
      retries: 2,
      timeout: 5000
    });
    
    // 404 hata durum kodu ile yeniden deneme olmayacak (geçerli yanıt)
    const notFoundResponse = await client.get('https://httpbin.org/status/404');
    console.log(`✅ 404 yanıt durum kodu: ${notFoundResponse.statusCode}`);
    
    // Zaman aşımı testi (bu 10 saniye bekleyecek, timeout 5 saniye)
    console.log('⏳ Zaman aşımı testi yapılıyor (5 saniye timeout)...');
    try {
      await client.get('https://httpbin.org/delay/10');
      console.log('❌ Zaman aşımı testi başarısız: Timeout tetiklenmedi');
    } catch (error) {
      console.log('✅ Zaman aşımı testi başarılı:', 
        error instanceof Error ? error.message : String(error));
    }
  } catch (error) {
    console.error('❌ Yeniden deneme testi başarısız:', error);
  }
}

/**
 * Tüm testleri sırayla çalıştır
 */
async function runAllTests() {
  console.log('🚀 MultiCurl testleri başlıyor...\n');
  
  try {
    await testHttpMethods();
    await testInterceptors();
    await testConcurrentRequests();
    await testDockerCurl();
    await testRetryMechanism();
    
    console.log('\n✨ Tüm testler tamamlandı');
  } catch (error) {
    console.error('\n⛔ Testler sırasında beklenmeyen hata:', error);
  }
}

runAllTests();