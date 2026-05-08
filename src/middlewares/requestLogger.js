const { RequestLog } = require('../models/requestlog');

module.exports = async (req, res, next) => {
  try {
    await RequestLog.create({
      method: req.method,
      path: req.originalUrl,
      ip: req.ip,
    });
  } catch (err) {
    console.error('Error guardando log:', err.message);
  }
  next();
};