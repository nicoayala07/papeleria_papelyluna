const { Categoria } = require('../models');

exports.getCategorias = async (req, res, next) => {
  try {
    const categorias = await Categoria.findAll();
    res.json(categorias);
  } catch (error) { next(error); }
};

exports.saveCategoria = async (req, res, next) => {
  try {
    const nueva = await Categoria.create(req.body);
    res.status(201).json(nueva);
  } catch (error) { next(error); }
};

exports.updateCategoria = async (req, res, next) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id);
    if (!categoria) return res.status(404).json({ error: 'Categoria no encontrada' });
    await categoria.update(req.body);
    res.json(categoria);
  } catch (error) { next(error); }
};

exports.deleteCategoria = async (req, res, next) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id);
    if (!categoria) return res.status(404).json({ error: 'Categoria no encontrada' });
    await categoria.destroy();
    res.json({ mensaje: `Categoria ${req.params.id} eliminada` });
  } catch (error) { next(error); }
};