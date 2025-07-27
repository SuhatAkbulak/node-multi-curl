module.exports = {
  exec: jest.fn((command, options, callback) => {
    // URL'ye göre farklı yanıt ver
    if (command.includes('invalid-url')) {
      // Geçersiz URL için 404 hatası döndür
      setTimeout(() => {
        callback(null, 'HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\n\r\nNot Found', '');
      }, 0);
    } else {
      // Normal URL için 200 başarı kodu döndür
      setTimeout(() => {
        callback(null, 'HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{"data":"mocked"}', '');
      }, 0);
    }
    
    return {
      stdout: { on: jest.fn(), pipe: jest.fn() },
      stderr: { on: jest.fn(), pipe: jest.fn() },
      on: jest.fn()
    };
  })
};