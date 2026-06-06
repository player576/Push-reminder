const RENDER_BACKEND_URL = "https://push-reminder2.onrender.com";
let currentOneSignalUserId = null;

// Глобальный колбэк для Median
window.median_onesignal_info = function(info) {
    if (info && info.userId) {
        currentOneSignalUserId = info.userId;
        console.log("Успешно получен пуш-ID девайса:", currentOneSignalUserId);
    }
};

// Запрашиваем инфо при старте
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        if (window.median) {
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

        // Если мы на ПК в Chrome — обычный таймер-заглушка
        if (!window.median) {
            alert(`Тест на ПК: сработает через ${Math.round(delay / 1000)} сек.`);
            setTimeout(() => { alert(`Пора принять: ${text}\nНапоминание для ${user}`); }, delay);
            return;
        }

        // --- КОРРЕКТИРУЕМ ВРЕМЯ ПОД GMT+3 ---
        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, '0');
        const day = String(targetDate.getDate()).padStart(2, '0');
        const hours = String(targetDate.getHours()).padStart(2, '0');
        const minutes = String(targetDate.getMinutes()).padStart(2, '0');
        
        const formattedDateForOneSignal = `${year}-${month}-${day} ${hours}:${minutes}:00 GMT+0300`;

        const titleText = `Пора принять: ${text}`;
        const bodyText = `Напоминание для пользователя ${user}`;

        // УМНЫЙ ВЫБОР: Если ID нет, шлем "ALL" как временный режим для тестов
        const finalUserId = currentOneSignalUserId || "ALL";

        if (finalUserId === "ALL") {
            console.log("Внимание: Пуш-плагин не активен в APK. Включен демонстрационный режим отправки.");
        }

        const response = await fetch(`${RENDER_BACKEND_URL}/api/remind`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: titleText,
                body: bodyText,
                send_after: formattedDateForOneSignal,
                userId: finalUserId
            })
        });

        const resData = await response.json();

        if (response.ok) {
            if (finalUserId === "ALL") {
                alert(`Успешно (Демо-режим): Напоминание создано на ${hours}:${minutes}.\n\nЗаписка: Пересоберите APK с включенным плагином OneSignal для персональных уведомлений.`);
            } else {
                alert(`Ура! Напоминание успешно создано на ${hours}:${minutes}.`);
            }
        } else {
            alert(`Сервер Render вернул ошибку: ${resData.error || response.statusText}`);
        }

    } catch (globalError) {
        alert("Критическая ошибка в JS: " + globalError.message);
    }
}
