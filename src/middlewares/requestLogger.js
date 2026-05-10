const { RequestLog } = require('../models');

module.exports = (req, res, next) => {
  const start = Date.now();

  res.on('finish', async () => {
    try {
      await RequestLog.create({
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration: Date.now() - start
      });
    } catch (err) {
      console.error('Error guardando log:', err.message);
    }
  });

  next();
};
