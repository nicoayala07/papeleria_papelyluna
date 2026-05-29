const { Compra, Producto, Proveedor } = require('../models');
const { Op } = require('sequelize');

function parseJsonList(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

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

exports.getProveedoresByProducto = async (req, res, next) => {
  try {
    const compras = await Compra.findAll();
    const proveedorIds = new Set();

    compras.forEach(compra => {
      const items = parseJsonList(compra.productosJson || compra.itemsJson);
      const surtioProducto = items.some(item => String(item.id) === String(req.params.id));
      if (surtioProducto && compra.proveedorId) proveedorIds.add(compra.proveedorId);
    });

    const ids = [...proveedorIds];
    if (ids.length === 0) return res.json([]);

    const proveedores = await Proveedor.findAll({
      where: { id: { [Op.in]: ids } },
      attributes: ['id', 'nombre', 'nit', 'telefono']
    });

    res.json(proveedores);
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
