// src/controllers/productos.controller.js

// Función para listar (reemplaza parte de ListarProductos)
exports.getProductos = async (req, res, next) => {
    try {
        // Aquí llamarías a tu servicio de Google Sheets
        // const lista = await sheetsService.obtenerTodos('productos');
        // res.json(lista);
        res.json({ mensaje: "Lista de productos desde el controlador" });
    } catch (error) {
        next(error); // El middleware de error lo captura (Ejercicio 3 del taller)
    }
};

// Función para crear/guardar (reemplaza guardarProducto)
exports.saveProducto = async (req, res, next) => {
    try {
        const datos = req.body;
        // La lógica de "aplicarProductoEnCatalogo" se procesa aquí
        console.log("Guardando producto:", datos.nombre);
        res.status(201).json({ mensaje: "Producto procesado por el controlador", data: datos });
    } catch (error) {
        next(error);
    }
};

// Función para eliminar (reemplaza eliminarProducto)
exports.deleteProducto = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Lógica para borrar en Google Sheets
        res.json({ mensaje: `Producto ${id} eliminado` });
    } catch (error) {
        next(error);
    }
};