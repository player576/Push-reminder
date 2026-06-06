// НАСТРОЙКА: Домен твоего сервера на Render успешно добавлен!
const RENDER_BACKEND_URL = "https://push-reminder2.onrender.com";

let currentOneSignalUserId = null;

// Функция, которая запрашивает ID устройства у Median и возвращает его
function getOneSignalId() {
    return new Promise((resolve) => {
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
    });
}

// Пытаемся получить ID сразу при загрузке страницы
document.addEventListener("DOMContentLoaded", async () => {
    // Небольшая задержка, чтобы плагин Median успел инициализироваться в памяти
    setTimeout(async () => {
        await getOneSignalId();
        console.log("OneSignal ID при старте:", currentOneSignalUserId);
    }, 1000);
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

    // Повторно проверяем ID перед отправкой, если при старте он не успел подгрузиться
    if (!currentOneSignalUserId) {
        await getOneSignalId();
    }

    // --- КОРРЕКТИРУЕМ ВРЕМЯ ПОД ТВОЙ GMT+3 ЧАСОВОЙ ПОЯС ---
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const hours = String(targetDate.getHours()).padStart(2, '0');
    const minutes = String(targetDate.getMinutes()).padStart(2, '0');
    
    const formattedDateForOneSignal = `${year}-${month}-${day} ${hours}:${minutes}:00 GMT+0300`;

    const titleText = `Пора принять: ${text}`;
    const bodyText = `Напоминание для пользователя ${user}`;

    // ЖЕСТКАЯ ПРОВЕРКА: Если мы реально внутри приложения Median
    if (window.median) {
        if (!currentOneSignalUserId) {
            alert('Приложение ещё загружает пуш-модуль. Подожди 3 секунды и нажми кнопку снова! 🔄');
            return;
        }

        try {
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
                alert(`Ура! Напоминание успешно создано на ${hours}:${minutes}. Теперь можно полностью закрыть приложение.`);
            } else {
                const errData = await response.json();
                alert(`Сервер Render вернул ошибку: ${errData.error || response.statusText}`);
            }
        } catch (error) {
            console.error("Ошибка сети:", error);
            alert("Не удалось достучаться до твоего сервера Render. Проверь, горит ли там статус Live.");
        }
    } else {
        // Этот кусок сработает ТОЛЬКО если ты открыл сайт на компе в Chrome
        alert(`Тест в браузере: Окошко выскочит через ${Math.round(delay / 1000)} сек.`);
        setTimeout(() => {
            alert(`${titleText}\n${bodyText}`);
        }, delay);
    }
                      }
