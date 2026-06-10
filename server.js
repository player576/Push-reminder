const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- НАСТРОЙКИ ONESIGNAL ---
// 1. Вставь сюда свой App ID (тот же, что и в index.html)
const APP_ID = "ТВОЙ_ОБНОВЛЕННЫЙ_ONE_SIGNAL_APP_ID";

// 2. Вставь сюда длинный Ключ Организации, который мы создали в "Keys & IDs"
const REST_API_KEY = "ТВОЙ_КЛЮЧ_ОРГАНИЗАЦИИ_ИЗ_ПАНЕЛИ_ONESIGNAL"; 


// Маршрут для проверки, что сервер вообще живой
app.get('/', (req, res) => {
    res.send('Сервер напоминаний работает и готов принимать пуши!');
});

// Главный маршрут для отправки пуш-уведомлений
app.post('/send-reminder', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Поле 'message' обязательно для заполнения" });
    }

    // Формируем тело запроса к API OneSignal
    const notificationBody = {
        app_id: APP_ID,
        included_segments: ["All Subscribed Users"], // Шлём всем подписанным устройствам
        headings: { "en": "Напоминалка", "ru": "Напоминалка" },
        contents: { "en": message, "ru": message }
    };

    try {
        const response = await fetch("https://onesignal.com/api/v1/notifications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                // Используем "Key" вместо "Basic" для общего ключа организации!
                "Authorization": `Key ${REST_API_KEY}`
            },
            body: JSON.stringify(notificationBody)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Ошибка от OneSignal API:", data);
            return res.status(response.status).json({ error: data.errors || data });
        }

        console.log("Пуш успешно отправлен через OneSignal:", data);
        return res.json({ success: true, details: data });

    } catch (error) {
        console.error("Внутренняя ошибка сервера при отправке:", error);
        return res.status(500).json({ error: "Внутренняя ошибка сервера: " + error.message });
    }
});

// Запуск сервера на порту Render или локальном 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер успешно запущен на порту ${PORT}`);
});
