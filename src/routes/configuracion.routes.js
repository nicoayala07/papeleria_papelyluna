const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/configuracion.controller');

router.get('/', ctrl.getConfiguracion);
router.put('/', ctrl.updateConfiguracion);

module.exports = router;
