// src/routes/productos.routes.js
const express = require('express');
const router = express.Router();
const prodCtrl = require('../controllers/productos.controller');
const { createRules, handleValidationErrors } = require('../validators/producto.validator');

// GET - listar productos
router.get('/', prodCtrl.getProductos);

// POST - crear producto (con validación antes del controlador)
router.post('/', createRules, handleValidationErrors, prodCtrl.saveProducto);

// DELETE - eliminar producto
router.delete('/:id', prodCtrl.deleteProducto);

module.exports = router;