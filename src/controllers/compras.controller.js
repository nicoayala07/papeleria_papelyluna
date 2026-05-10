const { Compra } = require('../models');

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

function stringifyList(value) {
  return JSON.stringify(parseJsonList(value));
}

function toCompraDto(compra) {
  const items = parseJsonList(compra.itemsJson);
  return {
    id: compra.id,
    fecha: compra.fecha,
    proveedorId: compra.proveedorId || '',
    proveedorNombre: compra.proveedorNombre || '',
    metodoPago: compra.metodoPago,
    total: Number(compra.total) || 0,
    items,
    itemsObj: items,
    createdAt: compra.createdAt,
    updatedAt: compra.updatedAt
  };
}

exports.getCompras = async (req, res, next) => {
  try {
    const compras = await Compra.findAll({ order: [['createdAt', 'DESC']] });
    res.json(compras.map(toCompraDto));
  } catch (error) {
    next(error);
  }
};

exports.saveCompra = async (req, res, next) => {
  try {
    const items = req.body.items || req.body.itemsObj || req.body.itemsJson || [];
    const compra = await Compra.create({
      id: req.body.id || `C-${Date.now().toString().slice(-6)}`,
      fecha: req.body.fecha || new Date().toLocaleString('es-CO'),
      proveedorId: req.body.proveedorId || '',
      proveedorNombre: req.body.proveedorNombre || '',
      metodoPago: req.body.metodoPago || 'Efectivo',
      total: Number(req.body.total) || 0,
      itemsJson: stringifyList(items)
    });

    res.status(201).json(toCompraDto(compra));
  } catch (error) {
    next(error);
  }
};

exports.deleteCompra = async (req, res, next) => {
  try {
    const compra = await Compra.findByPk(req.params.id);
    if (!compra) return res.status(404).json({ error: 'Compra no encontrada' });
    await compra.destroy();
    res.json({ mensaje: `Compra ${req.params.id} eliminada` });
  } catch (error) {
    next(error);
  }
};
