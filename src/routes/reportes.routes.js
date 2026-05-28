const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reportes.controller');

router.get('/resumen', ctrl.getResumen);

module.exports = router;
