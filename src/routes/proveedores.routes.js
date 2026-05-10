const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/proveedores.controller');

router.get('/',       ctrl.getProveedores);
router.post('/',      ctrl.saveProveedor);
router.put('/:id',    ctrl.updateProveedor);
router.delete('/:id', ctrl.deleteProveedor);

module.exports = router;