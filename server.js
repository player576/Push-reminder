const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());

// Включаем CORS, чтобы твой сайт (из любого места) мог достучаться до этого бэкенда
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Сервер берёт секреты из настроек Render (Environment Variables)
const REST_API_KEY = process.env.ONE_SIGNAL_REST_KEY;
const APP_ID = process.env.ONE_SIGNAL_APP_ID;

app.post('/api/remind', async (req, res) => {
    try {
        const { title, body, send_after, userId } = req.body;

        // Отправляем запрос напрямую в OneSignal
        const response = await fetch("https://onesignal.com/api/v1/notifications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Authorization": `Basic ${REST_API_KEY}`
            },
            body: JSON.stringify({
                app_id: APP_ID,
                include_subscription_ids: [userId],
                headings: { "ru": title, "en": title },
                contents: { "ru": body, "en": body },
                send_after: send_after,
                android_visibility: 1
            })
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error("Ошибка на бэкенде:", error);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});

// Render сам автоматически назначит порт, если его нет — включится 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер успешно запущен на порту ${PORT}`));
