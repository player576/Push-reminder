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

        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, '0');
        const day = String(targetDate.getDate()).padStart(2, '0');
        const hours = String(targetDate.getHours()).padStart(2, '0');
        const minutes = String(targetDate.getMinutes()).padStart(2, '0');
        
        // Форматируем время отправки под формат OneSignal
        const formattedDateForOneSignal = `${year}-${month}-${day} ${hours}:${minutes}:00 GMT+0300`;

        const titleText = `Пора принять: ${text}`;
        const bodyText = `Напоминание для пользователя ${user}`;

        // Отправляем пустой userId. Наш сервер увидит пустую строку и автоматически 
        // переключит отправку на сегмент "Total Subscriptions" (на всех)
        const response = await fetch(`${RENDER_BACKEND_URL}/api/remind`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: titleText,
                body: bodyText,
                send_after: formattedDateForOneSignal,
                userId: "" 
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
