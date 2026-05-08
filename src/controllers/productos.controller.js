const { Producto } = require('../models');

exports.getProductos = async (req, res, next) => {
  try {
    const productos = await Producto.findAll();
    res.json(productos);
  } catch (error) {
    next(error);
  }
};

exports.saveProducto = async (req, res, next) => {
  try {
    const nuevo = await Producto.create(req.body);
    res.status(201).json(nuevo);
  } catch (error) {
    next(error);
  }
};

exports.updateProducto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByPk(id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    await producto.update(req.body);
    res.json(producto);
  } catch (error) {
    next(error);
  }
};

exports.deleteProducto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByPk(id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    await producto.destroy();
    res.json({ mensaje: `Producto ${id} eliminado` });
  } catch (error) {
    next(error);
  }
};
