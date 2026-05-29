const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/clientes.controller');

router.get('/',       ctrl.getClientes);
router.post('/',      ctrl.saveCliente);
router.get('/:id/saldo', ctrl.getSaldoCliente);
router.post('/:id/abonar', ctrl.abonarCliente);
router.put('/:id',    ctrl.updateCliente);
router.delete('/:id', ctrl.deleteCliente);

module.exports = router;
