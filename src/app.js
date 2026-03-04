const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Головна магія: робимо папку public "публічною"
app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`Сервер працює! Переходь сюди: http://localhost:${PORT}`);
});