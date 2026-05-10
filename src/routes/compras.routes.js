const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/compras.controller');

router.get('/', ctrl.getCompras);
router.post('/', ctrl.saveCompra);
router.delete('/:id', ctrl.deleteCompra);

module.exports = router;
