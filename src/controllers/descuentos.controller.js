const { Descuento } = require('../models');

exports.getDescuentos = async (req, res, next) => {
  try {
    const descuentos = await Descuento.findAll({ order: [['createdAt', 'DESC']] });
    res.json(descuentos);
  } catch (error) { next(error); }
};

exports.saveDescuento = async (req, res, next) => {
  try {
    const { nombre, tipo, valor } = req.body;
    if (!nombre || !tipo || valor === undefined)
      return res.status(400).json({ error: 'nombre, tipo y valor son requeridos' });
    if (!['porcentaje', 'fijo'].includes(tipo))
      return res.status(400).json({ error: 'Tipo de descuento invalido' });
    if (valor < 0)
      return res.status(400).json({ error: 'El valor no puede ser negativo' });
    if (tipo === 'porcentaje' && valor > 100)
      return res.status(400).json({ error: 'El porcentaje no puede ser mayor a 100' });

    const descuento = await Descuento.create({ nombre, tipo, valor });
    res.status(201).json(descuento);
  } catch (error) { next(error); }
};

exports.updateDescuento = async (req, res, next) => {
  try {
    const descuento = await Descuento.findByPk(req.params.id);
    if (!descuento) return res.status(404).json({ error: 'Descuento no encontrado' });

    const { nombre, tipo, valor } = req.body;
    if (tipo !== undefined && !['porcentaje', 'fijo'].includes(tipo))
      return res.status(400).json({ error: 'Tipo de descuento invalido' });
    if (valor !== undefined && valor < 0)
      return res.status(400).json({ error: 'El valor no puede ser negativo' });
    if ((tipo || descuento.tipo) === 'porcentaje' && valor !== undefined && valor > 100)
      return res.status(400).json({ error: 'El porcentaje no puede ser mayor a 100' });

    await descuento.update({ nombre, tipo, valor });
    res.json(descuento);
  } catch (error) { next(error); }
};

exports.deleteDescuento = async (req, res, next) => {
  try {
    const descuento = await Descuento.findByPk(req.params.id);
    if (!descuento) return res.status(404).json({ error: 'Descuento no encontrado' });
    await descuento.destroy();
    res.json({ mensaje: 'Descuento eliminado' });
  } catch (error) { next(error); }
};
