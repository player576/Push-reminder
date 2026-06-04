// Фоновый Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker: Установлен');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker: Активирован');
    return self.clients.claim();
});

// Слушатель на случай, если пуш придёт через стандартный Web-канал
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: 'https://via.placeholder.com/128',
            vibrate: [200, 100, 200],
            data: {
                dateOfArrival: Date.now()
            }
        };
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});
