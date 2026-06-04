// Просим разрешение на отправку уведомлений при запуске
document.addEventListener('DOMContentLoaded', () => {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
    
    // Регистрируем Service Worker (нужен для работы уведомлений в фоне)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker зарегистрирован!', reg))
            .catch(err => console.error('Ошибка SW:', err));
    }
});

function scheduleReminder() {
    const text = document.getElementById('remindText').value;
    const timeVal = document.getElementById('remindTime').value;

    if (!text || !timeVal) {
        alert('Заполни все поля, а то как я напомню? 😉');
        return;
    }

    const targetTime = new Date(timeVal).getTime();
    const currentTime = new Date().getTime();
    const delay = targetTime - currentTime;

    if (delay <= 0) {
        alert('Это время уже прошло! Выбери будущее.');
        return;
    }

    alert(`Напоминание успешно создано! Придет через ${Math.round(delay / 60000)} мин.`);

    // Запускаем таймер
    setTimeout(() => {
        sendNotification(text);
    }, delay);
}

function sendNotification(message) {
    if (Notification.permission === 'granted') {
        // Проверяем, активен ли Service Worker, чтобы послать уведомление "в фоне"
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification('Aidanil Напоминание! ⏰', {
                body: message,
                icon: 'https://via.placeholder.com/128' // Сюда можно поставить иконку приложения
            });
        });
    } else {
        alert(`Напоминание: ${message}`);
    }
}
