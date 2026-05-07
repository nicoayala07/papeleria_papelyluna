const express = require('express');
const router = express.Router();
const prodCtrl = require('../controllers/productos.controller');

// Definición de rutas limpias
router.get('/', prodCtrl.getProductos);
router.post('/', prodCtrl.saveProducto);
router.delete('/:id', prodCtrl.deleteProducto);

module.exports = router;

const express = require('express');
const router = express.Router();
const prodCtrl = require('../controllers/productos.controller');
// Importamos las reglas
const { createRules, handleValidationErrors } = require('../validators/producto.validator');[cite, 358]

// Aplicamos: Primero las reglas, luego el manejador de errores, al final el controlador
router.post('/', createRules, handleValidationErrors, prodCtrl.saveProducto);[cite, 359, 360]

module.exports = router;