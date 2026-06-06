const RENDER_BACKEND_URL = "https://push-reminder2.onrender.com";
let currentOneSignalUserId = null;

// Создаем глобальную функцию, которую Median сам вызовет и передаст туда ID
window.median_onesignal_info = function(info) {
    if (info && info.userId) {
        currentOneSignalUserId = info.userId;
        console.log("Успешно получен пуш-ID девайса:", currentOneSignalUserId);
    }
};

// Как только страница загрузилась — даем команду Median вернуть нам инфо
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        if (window.median) {
            // Специальная нативная команда Median для запроса данных OneSignal
            window.location.href = "median://onesignal/info?callback=median_onesignal_info";
        }
    }, 1500);
});

async function scheduleReminder() {
    try {
        const user = document.getElementById('userName')?.value?.trim() || "Игрок";
        const text = document.getElementById('remindText')?.value?.trim();
        const timeVal = document.getElementById('remindTime')?.value;

        if (!text || !timeVal) {
            alert('Заполни поля! ⏰');
            return;
        }

        const targetDate = new Date(timeVal);
        const currentTime = new Date().getTime();
        const delay = targetDate.getTime() - currentTime;

        if (delay <= 0) {
            alert('Это время уже в прошлом!');
            return;
        }

        // Если к моменту нажатия ID еще не подтянулся, пинаем Median еще раз
        if (window.median && !currentOneSignalUserId) {
            window.location.href = "median://onesignal/info?callback=median_onesignal_info";
            alert('Регистрируем устройство в пуш-сети... Подожди 2 секунды и нажми кнопку еще раз! 🔄');
            return;
        }

        // Если открыли на ПК в обычном браузере
        if (!window.median) {
            alert(`Тест на ПК (не в приложении): сработает через ${Math.round(delay / 1000)} сек.`);
            setTimeout(() => { alert(`Пора принять: ${text}\nНапоминание для ${user}`); }, delay);
            return;
        }

        // Форматируем время под твой GMT+3
        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, '0');
        const day = String(targetDate.getDate()).padStart(2, '0');
        const hours = String(targetDate.getHours()).padStart(2, '0');
        const minutes = String(targetDate.getMinutes()).padStart(2, '0');
        
        const formattedDateForOneSignal = `${year}-${month}-${day} ${hours}:${minutes}:00 GMT+0300`;

        const titleText = `Пора принять: ${text}`;
        const bodyText = `Напоминание для пользователя ${user}`;

        // Шлем запрос на Render строго с ID этого конкретного планшета!
        const response = await fetch(`${RENDER_BACKEND_URL}/api/remind`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: titleText,
                body: bodyText,
                send_after: formattedDateForOneSignal,
                userId: currentOneSignalUserId
            })
        });

        const resData = await response.json();

        if (response.ok) {
            alert(`Ура! Напоминание успешно создано на ${hours}:${minutes}.`);
        } else {
            alert(`Сервер Render вернул ошибку: ${resData.error || response.statusText}`);
        }

    } catch (globalError) {
        alert("Критическая ошибка в JS: " + globalError.message);
    }
}
