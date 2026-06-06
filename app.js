const RENDER_BACKEND_URL = "https://push-reminder2.onrender.com";

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

        // --- КОРРЕКТИРУЕМ ВРЕМЯ ПОД ТВОЙ GMT+3 ЧАСОВОЙ ПОЯС ---
        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, '0');
        const day = String(targetDate.getDate()).padStart(2, '0');
        const hours = String(targetDate.getHours()).padStart(2, '0');
        const minutes = String(targetDate.getMinutes()).padStart(2, '0');
        
        const formattedDateForOneSignal = `${year}-${month}-${day} ${hours}:${minutes}:00 GMT+0300`;

        const titleText = `Пора принять: ${text}`;
        const bodyText = `Напоминание для пользователя ${user}`;

        // Мы убрали жесткую блокировку по ID устройства, теперь отправка сработает везде!
        const response = await fetch(`${RENDER_BACKEND_URL}/api/remind`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: titleText,
                body: bodyText,
                send_after: formattedDateForOneSignal,
                userId: "ALL" // Передаем серверу сигнал "отправить всем подпискам"
            })
        });

        if (response.ok) {
            alert(`Ура! Напоминание успешно создано на ${hours}:${minutes}.`);
        } else {
            const errData = await response.json();
            alert(`Сервер Render ответил ошибкой: ${errData.error || response.statusText}`);
        }

    } catch (globalError) {
        alert("Критическая ошибка в JS: " + globalError.message);
    }
}
