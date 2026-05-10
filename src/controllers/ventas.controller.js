const { Venta } = require('../models');

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

function splitFechaHora(fechaCompleta) {
  const valor = fechaCompleta || new Date().toLocaleString('es-CO');
  const partes = valor.split(',');
  return {
    fecha: partes[0]?.trim() || valor,
    hora: partes.slice(1).join(',').trim()
  };
}

function toVentaDto(venta, numero = null) {
  return {
    id: venta.id,
    numero,
    fecha: venta.fecha,
    hora: venta.hora || '',
    productos: parseJsonList(venta.productosJson),
    total: Number(venta.total) || 0,
    metodoPago: venta.metodoPago,
    pagoCon: Number(venta.pagoCon) || 0,
    clienteId: venta.clienteId || '',
    estado: venta.estado,
    createdAt: venta.createdAt,
    updatedAt: venta.updatedAt
  };
}

exports.getVentas = async (req, res, next) => {
  try {
    const ventas = await Venta.findAll({
      where: { estado: 'completada' },
      order: [['createdAt', 'DESC']]
    });

    res.json(ventas.map((venta, index) => toVentaDto(venta, ventas.length - index)));
  } catch (error) {
    next(error);
  }
};

exports.getVenta = async (req, res, next) => {
  try {
    const venta = await Venta.findByPk(req.params.id);
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
    res.json(toVentaDto(venta));
  } catch (error) {
    next(error);
  }
};

exports.saveVenta = async (req, res, next) => {
  try {
    const fechaHora = splitFechaHora(req.body.fecha);
    const id = req.body.id || `V-${Date.now().toString().slice(-6)}`;
    const productos = req.body.productos || req.body.productosJson || [];

    const venta = await Venta.create({
      id,
      fecha: req.body.fechaSolo || fechaHora.fecha,
      hora: req.body.hora || fechaHora.hora,
      productosJson: stringifyList(productos),
      total: Number(req.body.total) || 0,
      metodoPago: req.body.metodoPago || 'Efectivo',
      pagoCon: Number(req.body.pagoCon) || Number(req.body.total) || 0,
      clienteId: req.body.clienteId || '',
      estado: 'completada'
    });

    res.status(201).json(toVentaDto(venta));
  } catch (error) {
    next(error);
  }
};

exports.deleteVenta = async (req, res, next) => {
  try {
    const venta = await Venta.findByPk(req.params.id);
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
    await venta.destroy();
    res.json({ mensaje: `Venta ${req.params.id} eliminada` });
  } catch (error) {
    next(error);
  }
};

exports.getVentasPendientes = async (req, res, next) => {
  try {
    const ventas = await Venta.findAll({
      where: { estado: 'pendiente' },
      order: [['createdAt', 'ASC']]
    });

    res.json(ventas.map(venta => toVentaDto(venta)));
  } catch (error) {
    next(error);
  }
};

exports.saveVentaPendiente = async (req, res, next) => {
  try {
    const id = req.body.id || `V-${Date.now().toString().slice(-6)}`;
    const items = req.body.items || req.body.productos || req.body.productosJson || [];
    const total = parseJsonList(items).reduce((acc, item) => {
      return acc + (Number(item.precio) || 0) * (Number(item.cantidad) || 0);
    }, 0);

    await Venta.upsert({
      id,
      fecha: req.body.fecha || new Date().toLocaleString('es-CO'),
      hora: req.body.hora || '',
      productosJson: stringifyList(items),
      total,
      metodoPago: 'Pendiente',
      pagoCon: 0,
      clienteId: '',
      estado: 'pendiente'
    });

    const venta = await Venta.findByPk(id);
    res.status(201).json(toVentaDto(venta));
  } catch (error) {
    next(error);
  }
};

exports.deleteVentaPendiente = async (req, res, next) => {
  try {
    const venta = await Venta.findOne({
      where: { id: req.params.id, estado: 'pendiente' }
    });
    if (!venta) return res.status(404).json({ error: 'Venta pendiente no encontrada' });
    await venta.destroy();
    res.json({ mensaje: `Venta pendiente ${req.params.id} eliminada` });
  } catch (error) {
    next(error);
  }
};
