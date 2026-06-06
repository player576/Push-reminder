const RENDER_BACKEND_URL = "https://push-reminder2.onrender.com";
let currentOneSignalUserId = null;
let rawInfoDebug = "Ничего не получено"; // Переменная для теста

window.median_onesignal_info = function(info) {
    if (info) {
        rawInfoDebug = JSON.stringify(info); // Сохраняем весь объект от Median
        currentOneSignalUserId = info.subscriptionId || info.userId || null;
    } else {
        rawInfoDebug = "Объект info пустой или null";
    }
};

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        if (window.median) {
            window.location.href = "median://onesignal/info?callback=median_onesignal_info";
        }
    }, 1500);
});

async function scheduleReminder() {
    // ВЫВОДИМ ДИАГНОСТИКУ ПРЯМО ПРИ НАЖАТИИ НА КНОПКУ
    alert("Диагностика Median:\n" + rawInfoDebug + "\n\nПойманный ID: " + currentOneSignalUserId);

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

        if (!window.median) {
            alert(`Тест на ПК: сработает через ${Math.round(delay / 1000)} сек.`);
            setTimeout(() => { alert(`Пора принять: ${text}\nНапоминание для ${user}`); }, delay);
            return;
        }

        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, '0');
        const day = String(targetDate.getDate()).padStart(2, '0');
        const hours = String(targetDate.getHours()).padStart(2, '0');
        const minutes = String(targetDate.getMinutes()).padStart(2, '0');
        
        const formattedDateForOneSignal = `${year}-${month}-${day} ${hours}:${minutes}:00 GMT+0300`;

        const titleText = `Пора принять: ${text}`;
        const bodyText = `Напоминание для пользователя ${user}`;

        const finalUserId = currentOneSignalUserId || "";

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
            alert(`Ура! Напоминание успешно создано на ${hours}:${minutes}.`);
        } else {
            alert(`Сервер Render вернул ошибку: ${resData.error || response.statusText}`);
        }

    } catch (globalError) {
        alert("Критическая ошибка в JS: " + globalError.message);
    }
}
