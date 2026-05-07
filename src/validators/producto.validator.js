const { body, validationResult } = require('express-validator');

exports.createRules = [
    // Reglas basadas en tu formulario de productos
    body('nombre').isString().notEmpty().withMessage('El nombre es obligatorio'),
    body('precio').isFloat({ min: 1 }).withMessage('El precio debe ser mayor a 0'),
    body('stock').isInt({ min: 0 }).withMessage('El stock no puede ser negativo'),
    body('categoria').notEmpty().withMessage('Debes seleccionar una categoría')
];

// Este middleware revisa si hubo errores en las reglas de arriba
exports.handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};