// src/controllers/productos.controller.js

exports.getProductos = async (req, res, next) => {
    try {
        res.json({ mensaje: "Lista de productos desde el controlador" });
    } catch (error) {
        next(error);
    }
};

exports.saveProducto = async (req, res, next) => {
    try {
        const datos = req.body;
        console.log("Guardando producto:", datos.nombre);
        res.status(201).json({ mensaje: "Producto procesado por el controlador", data: datos });
    } catch (error) {
        next(error);
    }
};

exports.deleteProducto = async (req, res, next) => {
    try {
        const { id } = req.params;
        res.json({ mensaje: `Producto ${id} eliminado` });
    } catch (error) {
        next(error);
    }
};

exports.updateProducto = async (req, res, next) => {
    try {
        const { id } = req.params;
        const datos = req.body;
        res.json({ mensaje: `Producto ${id} actualizado`, data: datos });
    } catch (error) {
        next(error);
    }
};