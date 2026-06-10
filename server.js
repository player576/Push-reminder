const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors()); // CORS успешно работает с нашим новым package.json
app.use(express.json());

// --- НАСТРОЙКИ ONESIGNAL ---
// 1. Твой App ID приложения "Напоминалка"
const APP_ID = "22f04b3f-265d-466e-adf3-80f08960fa23"; 

// 2. Твой REST API Key приложения, который начинается на vcsvn...
const REST_API_KEY = "vcsvn7suxevvnajbi2bhxt6pu"; // ОБЯЗАТЕЛЬНО вставь сюда свой КЛЮЧ ПОЛНОСТЬЮ вместо звёздочек!


// Базовый маршрут для проверки работы сервера в браузере
app.get('/', (req, res) => {
    res.send('Сервер напоминаний запущен и готов к отправке пушей через Basic!');
});

// Главный маршрут для обработки нажатия кнопки на планшете
app.post('/send-reminder', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Поле 'message' обязательно" });
    }

    // Формируем запрос к OneSignal для отправки всем подписанным
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
                // Используем "Basic" для личного REST API Key конкретного приложения!
                "Authorization": `Basic ${REST_API_KEY}`
            },
            body: JSON.stringify(notificationBody)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Ошибка OneSignal API:", data);
            return res.status(response.status).json({ error: data.errors || data });
        }

        console.log("Уведомление успешно отправлено!", data);
        return res.json({ success: true, details: data });

    } catch (error) {
        console.error("Внутренняя ошибка сервера:", error);
        return res.status(500).json({ error: "Внутренняя ошибка сервера: " + error.message });
    }
});

// Запуск приложения на порту Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер успешно работает на порту ${PORT}`);
});
