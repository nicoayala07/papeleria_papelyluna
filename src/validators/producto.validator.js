const { body, validationResult } = require('express-validator');

exports.createRules = [
    body('nombre')
        .exists({ values: 'undefined' }).withMessage('El nombre es obligatorio')
        .bail()
        .isString().withMessage('El nombre debe ser texto')
        .bail()
        .trim()
        .notEmpty().withMessage('El nombre no puede estar vacio'),
    body('precio')
        .exists({ values: 'undefined' }).withMessage('El precio es obligatorio')
        .bail()
        .isFloat({ min: 1 }).withMessage('El precio debe ser un numero mayor a 0')
        .toFloat(),
    body('stock')
        .exists({ values: 'undefined' }).withMessage('El stock es obligatorio')
        .bail()
        .isInt({ min: 0 }).withMessage('El stock debe ser un numero entero mayor o igual a 0')
        .toInt(),
    body('categoria')
        .exists({ values: 'undefined' }).withMessage('La categoria es obligatoria')
        .bail()
        .isString().withMessage('La categoria debe ser texto')
        .bail()
        .trim()
        .notEmpty().withMessage('La categoria no puede estar vacia')
];

exports.updateRules = [
    body('nombre')
        .optional({ values: 'undefined' })
        .isString().withMessage('El nombre debe ser texto')
        .bail()
        .trim()
        .notEmpty().withMessage('El nombre no puede estar vacio'),
    body('precio')
        .optional({ values: 'undefined' })
        .isFloat({ min: 1 }).withMessage('El precio debe ser un numero mayor a 0')
        .toFloat(),
    body('stock')
        .optional({ values: 'undefined' })
        .isInt({ min: 0 }).withMessage('El stock debe ser un numero entero mayor o igual a 0')
        .toInt(),
    body('categoria')
        .optional({ values: 'undefined' })
        .isString().withMessage('La categoria debe ser texto')
        .bail()
        .trim()
        .notEmpty().withMessage('La categoria no puede estar vacia')
];

exports.handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const details = errors.array().map(error => ({
            campo: error.path,
            msg: error.msg,
            mensaje: error.msg
        }));

        return res.status(400).json({
            error: 'Datos invalidos',
            errors: details
        });
    }
    next();
};
