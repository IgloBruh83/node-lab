const express = require('express');
const path = require('path');
const app = express();

app.use(express.static('public'));

app.use(express.json());

const apiRoutes = require('./src/routes');
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
app.use('/api', apiRoutes);

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Сервер запрацював!`);
  console.log(`http://localhost:${PORT}`);
});