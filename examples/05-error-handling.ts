/**
 * Hata yönetimi ve yeniden deneme mekanizması örneği
 */
import { MultiCurl } from '../src/MultiCurl';

async function errorHandlingExample() {
  console.log('Hata yönetimi örneği başlıyor...');
  
  // 1. Yeniden deneme mekanizması
  console.log('\n1. Yeniden deneme mekanizması');
  const retryClient = new MultiCurl({
    retries: 3, // 3 kez yeniden dene
    timeout: 2000 // 2 saniye timeout
  });
  
  try {
    console.log('Zaman aşımına uğrayacak istek yapılıyor (5 saniyelik gecikme)...');
    await retryClient.get('https://httpbin.org/delay/5');
  } catch (error) {
    console.log(`✅ Beklenen hata alındı: ${error instanceof Error ? error.message : String(error)}`);
    console.log('İstek 3 kez denendi ve başarısız oldu');
  }
  
  // 2. HTTP durum kodları yönetimi
  console.log('\n2. HTTP durum kodları yönetimi');
  const client = new MultiCurl();
  
  // Farklı durum kodları test edelim
  const statusCodes = [200, 404, 500];
  
  for (const code of statusCodes) {
    try {
      const response = await client.get(`https://httpbin.org/status/${code}`);
      console.log(`${code} durum kodu alındı - başarılı: ${response.statusCode === code}`);
    } catch (error) {
      console.log(`${code} durum kodu için hata: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  // 3. try/catch ile hata yakalama
  console.log('\n3. try/catch ile hata yakalama');
  try {
    await client.execute([
      { url: 'https://geçersiz-domain-örneği.com' }
    ]);
  } catch (error) {
    console.log(`✅ Beklenen hata alındı: ${error instanceof Error ? error.message : String(error)}`);
  }
}

errorHandlingExample()
  .then(() => console.log('✅ Hata yönetimi örneği tamamlandı'))
  .catch(error => console.error('❌ Hata:', error));