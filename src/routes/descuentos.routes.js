const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/descuentos.controller');

router.get('/',     ctrl.getDescuentos);
router.post('/',    ctrl.saveDescuento);
router.put('/:id',  ctrl.updateDescuento);
router.delete('/:id', ctrl.deleteDescuento);

module.exports = router;