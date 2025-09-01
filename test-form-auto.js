const puppeteer = require('puppeteer');

(async () => {
  try {
    console.log('🚀 Iniciando prueba automatizada...');
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Interceptar logs de consola
    page.on('console', msg => {
      console.log('BROWSER LOG:', msg.text());
    });
    
    // Interceptar errores JavaScript
    page.on('pageerror', error => {
      console.log('BROWSER ERROR:', error.message);
    });
    
    // Ir a la página
    console.log('📱 Navegando a debug form...');
    await page.goto('https://8000-i2laypwrf943b2kjj1zwi-6532622b.e2b.dev/debug-form.html');
    
    // Esperar que cargue
    await page.waitForSelector('#debugForm');
    console.log('✅ Formulario cargado');
    
    // Hacer clic en el botón de envío
    console.log('🖱️ Haciendo clic en enviar...');
    await page.click('#submitBtn');
    
    // Esperar a que aparezca resultado
    console.log('⏳ Esperando resultado...');
    await page.waitForSelector('#resultado', { timeout: 10000 });
    
    // Capturar el resultado
    const resultado = await page.$eval('#resultado', el => el.innerText);
    console.log('📋 RESULTADO:', resultado);
    
    // Capturar debug log
    const debugLog = await page.$eval('#debugLog', el => el.innerText);
    console.log('🔍 DEBUG LOG:', debugLog);
    
    await browser.close();
    console.log('✅ Prueba completada');
    
  } catch (error) {
    console.error('💥 Error en la prueba:', error.message);
  }
})();
