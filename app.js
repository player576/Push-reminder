const RENDER_BACKEND_URL = "https://push-reminder2.onrender.com";
let currentOneSignalUserId = null;

function getOneSignalId() {
    return new Promise((resolve) => {
        try {
            if (window.median && window.median.onesignal) {
                window.median.onesignal.getRegistrationInfo((info) => {
                    if (info && info.userId) {
                        currentOneSignalUserId = info.userId;
                        resolve(info.userId);
                    } else {
                        resolve(null);
                    }
                });
            } else {
                resolve(null);
            }
        } catch (e) {
            alert("Ошибка инициализации Median: " + e.message);
            resolve(null);
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(async () => {
        await getOneSignalId();
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

        // Пытаемся получить ID устройства
        if (!currentOneSignalUserId) {
            await getOneSignalId();
        }

        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, '0');
        const day = String(targetDate.getDate()).padStart(2, '0');
        const hours = String(targetDate.getHours()).padStart(2, '0');
        const minutes = String(targetDate.getMinutes()).padStart(2, '0');
        
        const formattedDateForOneSignal = `${year}-${month}-${day} ${hours}:${minutes}:00 GMT+0300`;

        const titleText = `Пора принять: ${text}`;
        const bodyText = `Напоминание для пользователя ${user}`;

        // Если мы внутри приложения
        if (window.median) {
            if (!currentOneSignalUserId) {
                alert('ID устройства еще не загрузился от OneSignal. Подожди 3 сек и нажми еще раз!');
                return;
            }

            alert("Отправляю запрос на Render..."); // Информационное окно, чтобы видеть, что кнопка сработала

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

            if (response.ok) {
                alert(`Ура! Сервер принял задачу на ${hours}:${minutes}.`);
            } else {
                const errData = await response.json();
                alert(`Сервер Render ответил ошибкой: ${errData.error || response.statusText}`);
            }
        } else {
            // Тест в обычном браузере
            alert(`Тест на ПК: сработает через ${Math.round(delay / 1000)} сек.`);
            setTimeout(() => { alert(`${titleText}\n${bodyText}`); }, delay);
        }

    } catch (globalError) {
        // Если код упадёт в любой точке — ты увидишь это окно!
        alert("Критическая ошибка в JS: " + globalError.message);
    }
            }
