'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Configuracion extends Model {
    static associate(models) {}
  }

  Configuracion.init({
    id: { type: DataTypes.STRING, primaryKey: true, defaultValue: 'negocio' },
    nombreNegocio: { type: DataTypes.STRING },
    nit: { type: DataTypes.STRING },
    direccion: { type: DataTypes.STRING },
    telefono: { type: DataTypes.STRING },
    logoUrl: { type: DataTypes.STRING }
  }, {
    sequelize,
    modelName: 'Configuracion',
    tableName: 'Configuraciones'
  });

  return Configuracion;
};
