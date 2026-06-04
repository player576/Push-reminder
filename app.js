// Проверяем регистрацию Service Worker при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker успешно зарегистрирован!', reg))
            .catch(err => console.error('Ошибка регистрации Service Worker:', err));
    }
});

async function scheduleReminder() {
    const text = document.getElementById('remindText').value;
    const timeVal = document.getElementById('remindTime').value;

    // Проверка заполнения полей
    if (!text || !timeVal) {
        alert('Заполни все поля, а то как я напомню? 😉');
        return;
    }

    const targetDate = new Date(timeVal);
    const currentTime = new Date().getTime();
    const delay = targetDate.getTime() - currentTime;

    // Проверка, что время указано в будущем
    if (delay <= 0) {
        alert('Это время уже прошло! Выбери будущее.');
        return;
    }

    // Форматируем дату и время для текста уведомления на момент срабатывания
    const currentDateString = targetDate.toLocaleDateString('ru-RU'); 
    const currentTimeString = targetDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    const titleText = `Пора принять: ${text}`;
    const bodyText = `Дата: ${currentDateString} | Время: ${currentTimeString}`;

    try {
        // Получаем ID пользователя в системе OneSignal, чтобы отправить пуш именно ему
        const userId = await OneSignal.getUser().getSubscription().id;
        
        if (!userId) {
            alert('Сначала разреши уведомления в приложении!');
            return;
        }

        // Отправляем запрос на OneSignal API для планирования пуша
        const response = await fetch("https://onesignal.com/api/v1/notifications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Authorization": "Basic ТВОЙ_REST_API_KEY" // Замени на свой REST API Key из OneSignal
            },
            body: JSON.stringify({
                app_id: "ТВОЙ_APP_ID_ИЗ_ONESIGNAL", // Замени на свой App ID из панели OneSignal
                include_subscription_ids: [userId], // Отправляем пуш конкретно на этот телефон
                headings: { "en": titleText, "ru": titleText },
                contents: { "en": bodyText, "ru": bodyText },
                send_after: targetDate.toISOString(), // Сервер отправит пуш ровно в это время
                android_sound: "notification", // Использовать стандартный звук
                android_visibility: 1 // Показывать на заблокированном экране (Public)
            })
        });

        if (response.ok) {
            alert(`Отлично! Напоминание запланировано на ${currentDateString} в ${currentTimeString}. Можно закрывать приложение!`);
        } else {
            const errorData = await response.json();
            console.error('Ошибка OneSignal API:', errorData);
            alert('Произошла ошибка при планировании на сервере.');
        }

    } catch (error) {
        console.error('Критическая ошибка:', error);
        alert('Не удалось связаться с сервером уведомлений.');
    }
}
