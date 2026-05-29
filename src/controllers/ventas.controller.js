//src/controllers/ventas.controller.js
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
    descuentoNombre: venta.descuentoNombre || null,
    descuentoValor: venta.descuentoValor === null || venta.descuentoValor === undefined ? null : Number(venta.descuentoValor),
    descuentoTipo: venta.descuentoTipo || null,
    estado: venta.estado,
    corregida: Boolean(venta.corregida),
    corregidaPor: venta.corregidaPor || null,
    fechaCorreccion: venta.fechaCorreccion || null,
    createdAt: venta.createdAt,
    updatedAt: venta.updatedAt
  };
}

exports.getVentas = async (req, res, next) => {
  try {
    const { metodoPago, clienteId, estado, desde, hasta } = req.query;
    const { Op } = require('sequelize');

    const where = { estado: estado || 'completada' };

    if (metodoPago) where.metodoPago = metodoPago;
    if (clienteId) where.clienteId = clienteId;
    if (desde || hasta) {
      const inicio = desde ? new Date(`${desde}T00:00:00`) : new Date('1970-01-01T00:00:00');
      const fin = hasta ? new Date(`${hasta}T23:59:59.999`) : new Date();
      where.createdAt = { [Op.between]: [inicio, fin] };
    }

    const ventas = await Venta.findAll({
      where,
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
      descuentoNombre: req.body.descuentoNombre || null,
      descuentoValor: req.body.descuentoValor === null || req.body.descuentoValor === undefined ? null : Number(req.body.descuentoValor),
      descuentoTipo: req.body.descuentoTipo || null,
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
    const { Producto } = require('../models');
    const items = parseJsonList(venta.productosJson);
    for (const item of items) {
      const prod = await Producto.findByPk(item.id);
      if (prod && prod.seguimientoInventario === 'si') {
        await prod.update({ stock: prod.stock + item.cantidad });
      }
    }
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
exports.corregirVenta = async (req, res, next) => {
  try {
    const venta = await Venta.findByPk(req.params.id);
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });

    const { Producto } = require('../models');
    const productosAnteriores = parseJsonList(venta.productosJson);
    const productosNuevos = req.body.productos || [];

    // Restaurar stock de productos anteriores
    for (const item of productosAnteriores) {
      const prod = await Producto.findByPk(item.id);
      if (prod && prod.seguimientoInventario === 'si') {
        await prod.update({ stock: prod.stock + item.cantidad });
      }
    }

    // Descontar stock de productos nuevos
    for (const item of productosNuevos) {
      const prod = await Producto.findByPk(item.id);
      if (prod && prod.seguimientoInventario === 'si') {
        await prod.update({ stock: prod.stock - item.cantidad });
      }
    }

    await venta.update({
      productosJson: JSON.stringify(productosNuevos),
      total: req.body.total,
      metodoPago: req.body.metodoPago || venta.metodoPago,
      clienteId: req.body.clienteId || venta.clienteId,
      corregida: true,
      corregidaPor: req.body.corregidaPor || 'usuario',
      fechaCorreccion: new Date()
    });

    res.json(toVentaDto(venta));
  } catch (error) { next(error); }
};

exports.reembolsarVenta = async (req, res, next) => {
  try {
    const venta = await Venta.findByPk(req.params.id);
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });

    const { Producto } = require('../models');
    // items: [{ id, cantidad, retornaInventario }]
    const items = req.body.items || [];

    for (const item of items) {
      if (item.retornaInventario) {
        const prod = await Producto.findByPk(item.id);
        if (prod && prod.seguimientoInventario === 'si') {
          await prod.update({ stock: prod.stock + item.cantidad });
        }
      }
    }

    // Marcar venta como reembolsada
    await venta.update({ estado: 'reembolsada' });

    res.json({ mensaje: 'Reembolso registrado', venta: toVentaDto(venta) });
  } catch (error) { next(error); }
};
