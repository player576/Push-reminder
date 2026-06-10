const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- НАСТРОЙКИ ONESIGNAL ---
const APP_ID = "22f04b3f-265d-466e-adf3-80f08960fa23"; 

// Вставь сюда свой полный ключ, который начинается на Os_v2_app_...
const REST_API_KEY = "os_v2_app_elyewpzglvdg5lptfe77xp6jnqnvypx6tgxusfmnddgsdchlsmuu22mvbdv7njwfordkzs74p5lqf4ioci2tri7ty25al7hsgqylmaq"; 

app.get('/', (req, res) => {
    res.send('Сервер готов к отправке пушей через двойную авторизацию!');
});

app.post('/send-reminder', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Поле 'message' обязательно" });
    }

    const notificationBody = {
        app_id: APP_ID,
        included_segments: ["All Subscribed Users"],
        headings: { "ru": "Напоминалка" },
        contents: { "ru": message }
    };

    try {
        const response = await fetch("https://onesignal.com/api/v1/notifications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                // Отправляем оба варианта! OneSignal сам выберет тот, который ему нужен
                "Authorization": `Key ${REST_API_KEY}`,
                "X-Authorization": `Basic ${REST_API_KEY}`
            },
            body: JSON.stringify(notificationBody)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Ошибка OneSignal API:", data);
            // Возвращаем подробную ошибку от OneSignal прямо в приложение!
            return res.status(response.status).json({ 
                error: data.errors ? JSON.stringify(data.errors) : JSON.stringify(data) 
            });
        }

        return res.json({ success: true, details: data });

    } catch (error) {
        console.error("Внутренняя ошибка сервера:", error);
        return res.status(500).json({ error: "Ошибка сервера: " + error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер успешно работает на порту ${PORT}`);
});
