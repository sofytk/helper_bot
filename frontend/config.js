const AppConfig = {
    YANDEX_MAPS_API_KEY: process.env.YANDEX_MAPS_API_KEY,
    API_BASE_URL: process.env.BACKEND_URL || 'http://0.0.0.0:8000/',
    
    MAP: {
        defaultCenter: [55.7558, 37.6173],
        defaultZoom: 10,
        minZoom: 5,
        maxZoom: 18
    },
    
    SEARCH_RADIUS: 50,
    
    MAX: {
        theme: 'light',
        showBackButton: true,
        BOT_TOKEN: process.env.MAX_BOT_TOKEN || ''
    }
};

if (typeof AppConfig.YANDEX_MAPS_API_KEY !== 'undefined' && AppConfig.YANDEX_MAPS_API_KEY !== 'YOUR_YANDEX_MAPS_API_KEY') {
   
    const yandexScript = document.querySelector('script[src*="api-maps.yandex.ru"]');
    if (yandexScript) {
        yandexScript.src = yandexScript.src.replace('YOUR_YANDEX_MAPS_API_KEY', AppConfig.YANDEX_MAPS_API_KEY);
    }
}

window.AppConfig = AppConfig;


