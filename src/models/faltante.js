'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Faltante extends Model {
    static associate(models) {}
  }

  Faltante.init({
    nombreProducto: { type: DataTypes.STRING,  allowNull: false },
    tipo:           { type: DataTypes.ENUM('agotado', 'no_registrado'), allowNull: false },
    cantidad:       { type: DataTypes.INTEGER,  allowNull: true },
    observacion:    { type: DataTypes.TEXT,     allowNull: true },
    estado:         { type: DataTypes.ENUM('pendiente', 'resuelto', 'descartado'), defaultValue: 'pendiente' }
  }, {
    sequelize,
    modelName: 'Faltante',
    tableName: 'Faltantes'
  });

  return Faltante;
};