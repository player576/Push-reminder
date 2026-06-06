// НАСТРОЙКА: Вставь сюда имя своего сервера из Render вместо "ДОМЕН_ТВОЕГО_СЕРВЕРА_НА_RENDER"
const RENDER_BACKEND_URL = "https://push-reminder2.onrender.com";

let currentOneSignalUserId = null;

// При запуске приложения Median автоматически вытаскиваем ID этого устройства
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

    // --- КОРРЕКТИРУЕМ ВРЕМЯ ПОД ТВОЙ GMT+3 ЧАСОВОЙ ПОЯС ---
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const hours = String(targetDate.getHours()).padStart(2, '0');
    const minutes = String(targetDate.getMinutes()).padStart(2, '0');
    
    // Формируем строгий формат даты, который OneSignal поймет без искажений времени
    const formattedDateForOneSignal = `${year}-${month}-${day} ${hours}:${minutes}:00 GMT+0300`;

    const titleText = `Пора принять: ${text}`;
    const bodyText = `Напоминание для пользователя ${user}`;

    // Проверяем: запущены внутри приложения или просто в браузере Chrome
    if (window.median && currentOneSignalUserId) {
        try {
            const response = await fetch(`${RENDER_BACKEND_URL}/api/remind`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: titleText,
                    body: bodyText,
                    send_after: formattedDateForOneSignal, // Шлем время с GMT+0300
                    userId: currentOneSignalUserId
                })
            });

            if (response.ok) {
                alert(`Отлично! Напоминание успешно создано на ${hours}:${minutes}.`);
            } else {
                const errData = await response.json();
                alert(`Сервер вернул ошибку: ${errData.error || response.statusText}`);
            }
        } catch (error) {
            console.error("Ошибка сети:", error);
            alert("Не удалось связаться с сервером. Проверь статус бэкенда на Render.");
        }
    } else {
        // Запасной таймер, если ты тестируешь сайт на ПК без приложения
        alert(`Тест в браузере: Напоминание сработает через ${Math.round(delay / 1000)} сек.`);
        setTimeout(() => {
            alert(`${titleText}\n${bodyText}`);
        }, delay);
    }
}
