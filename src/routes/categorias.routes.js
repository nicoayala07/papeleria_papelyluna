const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/categorias.controller');

router.get('/',       ctrl.getCategorias);
router.post('/',      ctrl.saveCategoria);
router.put('/:id',    ctrl.updateCategoria);
router.delete('/:id', ctrl.deleteCategoria);

module.exports = router;