const express = require('express');

const app = express();

app.set('trust proxy', 1);

app.get('/', (_req, res) => {
  res.status(200).json({ message: 'Hello World' });
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
