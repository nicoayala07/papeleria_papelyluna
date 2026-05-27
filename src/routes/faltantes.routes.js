const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/faltantes.controller');

router.get('/',          ctrl.getFaltantes);
router.post('/',         ctrl.saveFaltante);
router.patch('/:id',     ctrl.updateEstado);
router.delete('/:id',    ctrl.deleteFaltante);

module.exports = router;