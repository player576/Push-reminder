// НАСТРОЙКА: Вставь сюда адрес своего запущенного сервиса с Render
const RENDER_BACKEND_URL = "https://push-reminder2.onrender.com";

// Переменная, куда запишется уникальный ID устройства для отправки пуша конкретному игроку
let currentOneSignalUserId = null;

// Автоматически запрашиваем ID пользователя у плагина Median при запуске приложения
document.addEventListener("DOMContentLoaded", () => {
    if (window.median && window.median.onesignal) {
        window.median.onesignal.getRegistrationInfo((info) => {
            if (info && info.userId) {
                currentOneSignalUserId = info.userId;
                console.log("Успешно получен OneSignal User ID:", currentOneSignalUserId);
            }
        });
    }
});

async function scheduleReminder() {
    const user = document.getElementById('userName')?.value?.trim() || "Игрок";
    const text = document.getElementById('remindText')?.value?.trim();
    const timeVal = document.getElementById('remindTime')?.value;

    // Валидация полей
    if (!text || !timeVal) {
        alert('Заполни, пожалуйста, что нужно сделать и выбери время! ⏰');
        return;
    }

    const targetDate = new Date(timeVal);
    const currentTime = new Date().getTime();
    const delay = targetDate.getTime() - currentTime;

    if (delay <= 0) {
        alert('Упс! Это время уже в прошлом. Выбери будущее время.');
        return;
    }

    // Текст уведомления
    const titleText = `Пора принять: ${text}`;
    const bodyText = `Напоминание для пользователя ${user}`;

    // Проверяем, открыто ли это в приложении или просто в обычном браузере
    if (window.median && currentOneSignalUserId) {
        try {
            // Отправляем запрос на наш защищенный бэкенд на Render
            const response = await fetch(`${RENDER_BACKEND_URL}/api/remind`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: titleText,
                    body: bodyText,
                    send_after: targetDate.toISOString(), // Переводим время в международный формат ISO
                    userId: currentOneSignalUserId       // Отправляем пуш именно на этот планшет/смартфон
                })
            });

            if (response.ok) {
                alert(`Отлично! Напоминание успешно создано на сервере.`);
            } else {
                const errData = await response.json();
                alert(`Сервер вернул ошибку: ${errData.error || response.statusText}`);
            }
        } catch (error) {
            console.error("Ошибка сети при обращении к Render:", error);
            alert("Не удалось связаться с сервером уведомлений. Проверь статус бэкенда на Render.");
        }
    } else {
        // Обычный фоллбэк таймера, если тестируешь сайт просто с компьютера через браузер
        alert(`Тест в браузере: Напоминание сработает через ${Math.round(delay / 1000)} сек.`);
        setTimeout(() => {
            alert(`${titleText}\n${bodyText}`);
        }, delay);
    }
}
