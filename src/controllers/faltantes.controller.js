const { Faltante } = require('../models');
const { Op } = require('sequelize');

exports.getFaltantes = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.estado) where.estado = req.query.estado;
    if (req.query.tipo)   where.tipo   = req.query.tipo;
    if (req.query.desde && req.query.hasta) {
      where.createdAt = { [Op.between]: [new Date(req.query.desde), new Date(req.query.hasta)] };
    }

    const faltantes = await Faltante.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(faltantes);
  } catch (error) { next(error); }
};

exports.saveFaltante = async (req, res, next) => {
  try {
    const { nombreProducto, tipo, cantidad, observacion } = req.body;
    if (!nombreProducto || !tipo)
      return res.status(400).json({ error: 'nombreProducto y tipo son requeridos' });

    const faltante = await Faltante.create({
      nombreProducto: nombreProducto.trim().toLowerCase(),
      tipo, cantidad, observacion, estado: 'pendiente'
    });
    res.status(201).json(faltante);
  } catch (error) { next(error); }
};

exports.updateEstado = async (req, res, next) => {
  try {
    const faltante = await Faltante.findByPk(req.params.id);
    if (!faltante) return res.status(404).json({ error: 'Faltante no encontrado' });

    await faltante.update({ estado: req.body.estado });
    res.json(faltante);
  } catch (error) { next(error); }
};

exports.deleteFaltante = async (req, res, next) => {
  try {
    const faltante = await Faltante.findByPk(req.params.id);
    if (!faltante) return res.status(404).json({ error: 'Faltante no encontrado' });
    await faltante.destroy();
    res.json({ mensaje: 'Faltante eliminado' });
  } catch (error) { next(error); }
};