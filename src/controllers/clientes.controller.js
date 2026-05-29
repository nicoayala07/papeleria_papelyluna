const { Cliente } = require('../models');

exports.getClientes = async (req, res, next) => {
  try {
    const clientes = await Cliente.findAll();
    res.json(clientes);
  } catch (error) { next(error); }
};

exports.saveCliente = async (req, res, next) => {
  try {
    const nuevo = await Cliente.create(req.body);
    res.status(201).json(nuevo);
  } catch (error) { next(error); }
};

exports.updateCliente = async (req, res, next) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    await cliente.update(req.body);
    res.json(cliente);
  } catch (error) { next(error); }
};

exports.getSaldoCliente = async (req, res, next) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

    res.json({
      clienteId: cliente.id,
      nombre: cliente.nombre,
      debe: Number(cliente.debe) || 0
    });
  } catch (error) { next(error); }
};

exports.abonarCliente = async (req, res, next) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

    const monto = Number(req.body.monto) || 0;
    if (monto <= 0) return res.status(400).json({ error: 'El monto del abono debe ser mayor a 0' });

    const debeActual = Number(cliente.debe) || 0;
    const nuevoDebe = Math.max(0, debeActual - monto);
    await cliente.update({ debe: nuevoDebe });
    console.log(`Abono registrado para cliente ${cliente.id}: ${monto}`);

    res.json({
      clienteId: cliente.id,
      nombre: cliente.nombre,
      montoAbonado: monto,
      debe: nuevoDebe
    });
  } catch (error) { next(error); }
};

exports.deleteCliente = async (req, res, next) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    await cliente.destroy();
    res.json({ mensaje: `Cliente ${req.params.id} eliminado` });
  } catch (error) { next(error); }
};
