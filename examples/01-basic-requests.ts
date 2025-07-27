/**
 * Temel HTTP isteklerinin nasıl yapılacağını gösteren örnek
 */
import { MultiCurl } from '../src/MultiCurl';

async function basicRequests() {
  // 1. Statik metodlarla tek istek örnekleri
  console.log('1. Statik metodlar kullanımı');

  // GET isteği
  const getResponse = await MultiCurl.get('https://httpbin.org/get?param=test');
  console.log(`GET isteği sonucu: ${getResponse.statusCode}`);

  // POST isteği
  const postData = { name: 'Türkçe İçerik', value: 'Test Verisi' };
  const postResponse = await MultiCurl.post('https://httpbin.org/post', postData);
  console.log(`POST isteği sonucu: ${postResponse.statusCode}`);

  // PUT isteği  
  const putResponse = await MultiCurl.put('https://httpbin.org/put', { id: 1, updated: true });
  console.log(`PUT isteği sonucu: ${putResponse.statusCode}`);

  // DELETE isteği
  const deleteResponse = await MultiCurl.delete('https://httpbin.org/delete');
  console.log(`DELETE isteği sonucu: ${deleteResponse.statusCode}`);
  
  // 2. Instance oluşturarak çoklu istek örneği
  console.log('\n2. MultiCurl instance ile istek yapma');
  
  const client = new MultiCurl();
  const responses = await client.execute([
    { url: 'https://httpbin.org/get?q=test', method: 'GET' },
    { url: 'https://httpbin.org/post', method: 'POST', body: { test: true } },
    { url: 'https://httpbin.org/image/jpeg', headers: { 'Accept': 'image/jpeg' } }
  ]);
  
  console.log(`3 istek yapıldı, tümü başarılı: ${responses.every(r => r.statusCode === 200)}`);
}

basicRequests()
  .then(() => console.log('✅ Temel istekler örneği tamamlandı'))
  .catch(error => console.error('❌ Hata:', error));