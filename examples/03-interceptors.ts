/**
 * İstek ve yanıt interceptor'larının nasıl kullanılacağını gösteren örnek
 */
import { MultiCurl } from '../src/MultiCurl';

async function interceptorsExample() {
  console.log('Interceptor örneği başlıyor...');
  
  const client = MultiCurl.create();
  
  // 1. İstek interceptor'u ekleyelim
  client.interceptors.request.use(request => {
    console.log(`> İstek gönderiliyor: ${request.method || 'GET'} ${request.url}`);
    
    // Her isteğe özel başlık ekleyelim
    request.headers = {
      ...request.headers,
      'X-Custom-Header': 'MultiCurl-Client',
      'User-Agent': 'MultiCurl/1.0'
    };
    
    return request;
  });
  
  // 2. Yanıt interceptor'u ekleyelim
  client.interceptors.response.use(response => {
    console.log(`< Yanıt alındı: ${response.url} (${response.statusCode})`);
    
    // Yanıt verilerini işleyelim
    if (response.body && response.body.includes('"headers"')) {
      try {
        const data = JSON.parse(response.body);
        console.log('Gönderilen başlıklar:');
        console.log(data.headers);
      } catch (e) {
        // JSON parse hatası
      }
    }
    
    return response;
  });
  
  // 3. Hata interceptor'u
  client.interceptors.response.use(
    // Başarılı yanıtlar için
    response => response,
    // Hata durumunda
    error => {
      console.error(`❌ İstek başarısız: ${error.message}`);
      throw error; // Hatayı yeniden fırlat
    }
  );
  
  // İstekleri çalıştıralım
  await client.get('https://httpbin.org/headers');
  
  try {
    await client.get('https://httpbin.org/status/404');
  } catch (error) {
    console.log('404 hatası yakalandı');
  }
}

interceptorsExample()
  .then(() => console.log('✅ Interceptor örneği tamamlandı'))
  .catch(error => console.error('❌ Hata:', error));