const { Configuracion } = require('../models');

const CONFIG_ID = 'negocio';
const CAMPOS_CONFIG = ['nombreNegocio', 'nit', 'direccion', 'telefono', 'logoUrl'];

function limpiarBody(body = {}) {
  return CAMPOS_CONFIG.reduce((acc, campo) => {
    if (body[campo] !== undefined) acc[campo] = body[campo] || null;
    return acc;
  }, {});
}

exports.getConfiguracion = async (req, res, next) => {
  try {
    const configuracion = await Configuracion.findByPk(CONFIG_ID);
    res.json(configuracion || { id: CONFIG_ID });
  } catch (error) {
    next(error);
  }
};

exports.updateConfiguracion = async (req, res, next) => {
  try {
    const datos = limpiarBody(req.body);
    await Configuracion.upsert({ id: CONFIG_ID, ...datos });

    const configuracion = await Configuracion.findByPk(CONFIG_ID);
    res.json(configuracion);
  } catch (error) {
    next(error);
  }
};
