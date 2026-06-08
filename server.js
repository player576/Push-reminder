const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());

// Разрешаем CORS, чтобы планшет мог достучаться до сервера
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const REST_API_KEY = process.env.ONE_SIGNAL_REST_KEY;
const APP_ID = process.env.ONE_SIGNAL_APP_ID;

app.post('/api/remind', async (req, res) => {
    try {
        const { title, body, send_after } = req.body;

        // Формируем запрос к OneSignal с жестким фильтром по твоему тегу
        const notificationBody = {
            app_id: APP_ID,
            headings: { "ru": title, "en": title },
            contents: { "ru": body, "en": body },
            send_after: send_after,
            android_visibility: 1,
            // ФОКУС: Отправка строго на устройство с тегом username = Danil
            filters: [
                { "field": "tag", "key": "username", "relation": "=", "value": "Danil" }
            ]
        };

        const response = await fetch("https://onesignal.com/api/v1/notifications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Authorization": `Basic ${REST_API_KEY}`
            },
            body: JSON.stringify(notificationBody)
        });

        const data = await response.json();

        if (response.ok) {
            res.status(200).json(data);
        } else {
            const errorText = data.errors ? JSON.stringify(data.errors) : "Ошибка OneSignal";
            res.status(response.status).json({ error: errorText });
        }
    } catch (error) {
        console.error("Ошибка на бэкенде:", error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер успешно запущен на порту ${PORT}`));
