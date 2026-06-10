const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors()); // Теперь CORS будет работать без ошибок, так как мы починили package.json!
app.use(express.json());

// --- НАСТРОЙКИ ONESIGNAL ---
// 1. Вставь сюда свой App ID приложения "Напоминалка"
const APP_ID = "22f04b3f-265d-466e-adf3-80f08960fa23"; // Взято из твоей ссылки в панели

// 2. Вставь сюда Ключ Организации, который ты создал во вкладке Keys & IDs
const REST_API_KEY = "ТВОЙ_КЛЮЧ_ОРГАНИЗАЦИИ_ИЗ_ПАНЕЛИ_ONESIGNAL"; 


app.get('/', (req, res) => {
    res.send('Сервер напоминаний запущен и готов к работе!');
});

app.post('/send-reminder', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Поле 'message' обязательно" });
    }

    const notificationBody = {
        app_id: APP_ID,
        included_segments: ["All Subscribed Users"], // Отправка всем зарегистрированным
        headings: { "ru": "Напоминалка" },
        contents: { "ru": message }
    };

    try {
        const response = await fetch("https://onesignal.com/api/v1/notifications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                // Ключи организации требуют префикс Key вместо Basic!
                "Authorization": `Key ${REST_API_KEY}`
            },
            body: JSON.stringify(notificationBody)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Ошибка OneSignal:", data);
            return res.status(response.status).json({ error: data.errors || data });
        }

        return res.json({ success: true, details: data });

    } catch (error) {
        console.error("Ошибка сервера:", error);
        return res.status(500).json({ error: "Внутренняя ошибка сервера: " + error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер работает на порту ${PORT}`);
});
