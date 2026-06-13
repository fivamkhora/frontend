const express = require('express');
const path = require('node:path');

const app = express();

app.set('trust proxy', 1);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/request-info', (req, res) => {
  res.status(200).json({
    protocol: req.protocol,
    secure: req.secure,
    ip: req.ip,
  });
});

module.exports = app;
