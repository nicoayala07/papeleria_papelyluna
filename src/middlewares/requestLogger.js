// src/middlewares/requestLogger.js

const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../../request_log.json');

module.exports = (req, res, next) => {
  const entrada = {
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  };

  try {
    let logs = [];
    if (fs.existsSync(logFile)) {
      const contenido = fs.readFileSync(logFile, 'utf-8');
      logs = JSON.parse(contenido);
    }
    logs.push(entrada);
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error('Error guardando log:', err.message);
  }

  next();
};