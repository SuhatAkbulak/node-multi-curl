/**
 * Proxy kullanımı ve Docker curl entegrasyonu örneği
 */
import { MultiCurl } from '../src/MultiCurl';

async function proxyAndDockerExample() {
  console.log('Proxy ve Docker örneği başlıyor...');
  
  // 1. Proxy kullanımı örneği
  console.log('\n1. Proxy kullanımı örneği');
  try {
    // NOT: Geçerli bir proxy adresi ile değiştirin veya ücretsiz proxy bulun
    const proxyClient = new MultiCurl({
      proxies: [
        'http://örnek.proxy.adresi:8080',
        'http://örnek2.proxy.adresi:8080'
      ]
    });
    
    console.log('Proxy istekleri hazırlanıyor...');
    // Proxy'ler otomatik olarak sırayla kullanılacak
    await proxyClient.execute([
      { url: 'https://httpbin.org/ip' },
      { url: 'https://httpbin.org/ip' }
    ]);
  } catch (error) {
    console.log('⚠️ Proxy örneği çalıştırılamadı: Lütfen geçerli proxy adresleri ekleyin');
  }
  
  // 2. Tek istek için proxy tanımlama
  console.log('\n2. Tek istek için proxy tanımlama');
  try {
    const client = new MultiCurl();
    await client.execute([
      { 
        url: 'https://httpbin.org/ip', 
        proxy: 'http://kullanici:şifre@örnek.proxy.adresi:8080' 
      }
    ]);
  } catch (error) {
    console.log('⚠️ Tek proxy örneği çalıştırılamadı: Lütfen geçerli proxy adresi ekleyin');
  }
  
  // 3. Docker curl entegrasyonu
  console.log('\n3. Docker curl entegrasyonu');
  try {
    const dockerClient = new MultiCurl({
      curlConfig: {
        useDocker: true,
        dockerImage: 'badouralix/curl-http2:latest'
      }
    });
    
    console.log('Docker curl isteği yapılıyor...');
    const responses = await dockerClient.execute([
      { url: 'https://http2.pro/api/v1' } // HTTP/2 destekleyen endpoint
    ]);
    
    console.log(`Docker curl yanıtı: ${responses[0].statusCode}`);
    console.log(`HTTP/2 yanıtı: ${responses[0].body.slice(0, 100)}...`);
  } catch (error) {
    console.log('⚠️ Docker curl örneği çalıştırılamadı: Docker yüklü olmayabilir');
  }
}

proxyAndDockerExample()
  .then(() => console.log('✅ Proxy ve Docker örneği tamamlandı'))
  .catch(error => console.error('❌ Hata:', error));