/**
 * Çoklu istekleri farklı eşzamanlılık seviyelerinde nasıl yapacağımızı gösteren örnek
 */
import { MultiCurl } from '../src/MultiCurl';

async function concurrencyExample() {
  console.log('Eşzamanlılık örneği başlıyor...');
  
  // 20 adet URL oluşturalım (gecikme süresiyle)
  const urls = Array.from({ length: 20 }, (_, i) => 
    `https://httpbin.org/delay/1?req=${i+1}`);
  
  // 1. Yüksek eşzamanlılık (10 istek aynı anda)
  console.log('\n1. Yüksek eşzamanlılık (10 istek aynı anda)');
  const highConcurrency = new MultiCurl({ concurrency: 10 });
  
  console.time('Yüksek eşzamanlılık süresi');
  const highResponses = await highConcurrency.execute(
    urls.map(url => ({ url, method: 'GET' }))
  );
  console.timeEnd('Yüksek eşzamanlılık süresi');
  
  console.log(`Başarılı istekler: ${highResponses.filter(r => r.statusCode === 200).length}`);
  
  // 2. Düşük eşzamanlılık (2 istek aynı anda)
  console.log('\n2. Düşük eşzamanlılık (2 istek aynı anda)');
  const lowConcurrency = new MultiCurl({ concurrency: 2 });
  
  console.time('Düşük eşzamanlılık süresi');
  const lowResponses = await lowConcurrency.execute(
    urls.map(url => ({ url, method: 'GET' }))
  );
  console.timeEnd('Düşük eşzamanlılık süresi');
  
  console.log(`Başarılı istekler: ${lowResponses.filter(r => r.statusCode === 200).length}`);
  
  // 3. Sırayla işlem (1 istek aynı anda)
  console.log('\n3. Sıralı istekler (1 istek aynı anda)');
  const sequential = new MultiCurl({ concurrency: 1 });
  
  console.time('Sıralı istekler süresi');
  const seqResponses = await sequential.execute(
    urls.slice(0, 5).map(url => ({ url, method: 'GET' }))
  );
  console.timeEnd('Sıralı istekler süresi');
  
  console.log(`Başarılı istekler: ${seqResponses.filter(r => r.statusCode === 200).length}`);
}

concurrencyExample()
  .then(() => console.log('✅ Eşzamanlılık örneği tamamlandı'))
  .catch(error => console.error('❌ Hata:', error));