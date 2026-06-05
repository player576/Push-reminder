const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

// Секреты хранятся в переменных окружения Render, а не в коде!
const REST_API_KEY = process.env.ONE_SIGNAL_REST_KEY;
const APP_ID = process.env.ONE_SIGNAL_APP_ID;

app.post('/api/remind', async (req, res) => {
    const { title, body, send_after, userId } = req.body;
    
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Basic ${REST_API_KEY}`
        },
        body: JSON.stringify({
            app_id: APP_ID,
            include_subscription_ids: [userId],
            headings: { "ru": title },
            contents: { "ru": body },
            send_after: send_after
        })
    });
    const data = await response.json();
    res.json(data);
});

app.listen(3000, () => console.log('Сервер запущен'));
