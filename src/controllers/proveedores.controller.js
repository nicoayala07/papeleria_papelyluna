const { Proveedor } = require('../models');

exports.getProveedores = async (req, res, next) => {
  try {
    const proveedores = await Proveedor.findAll();
    res.json(proveedores);
  } catch (error) { next(error); }
};

exports.saveProveedor = async (req, res, next) => {
  try {
    const nuevo = await Proveedor.create(req.body);
    res.status(201).json(nuevo);
  } catch (error) { next(error); }
};

exports.updateProveedor = async (req, res, next) => {
  try {
    const proveedor = await Proveedor.findByPk(req.params.id);
    if (!proveedor) return res.status(404).json({ error: 'Proveedor no encontrado' });
    await proveedor.update(req.body);
    res.json(proveedor);
  } catch (error) { next(error); }
};

exports.deleteProveedor = async (req, res, next) => {
  try {
    const proveedor = await Proveedor.findByPk(req.params.id);
    if (!proveedor) return res.status(404).json({ error: 'Proveedor no encontrado' });
    await proveedor.destroy();
    res.json({ mensaje: `Proveedor ${req.params.id} eliminado` });
  } catch (error) { next(error); }
};