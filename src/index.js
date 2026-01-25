const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));
app.post('/webhook', (req, res) => {
    console.log('🔔 ЗАЯВКА:', req.body);
    res.json({status: 'ok'});
});

app.listen(3000, () => console.log('🚀 Сервер: http://localhost:3000'));

