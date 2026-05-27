'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Descuento extends Model {
    static associate(models) {}
  }

  Descuento.init({
    nombre: { type: DataTypes.STRING,                        allowNull: false },
    tipo:   { type: DataTypes.ENUM('porcentaje', 'fijo'),   allowNull: false },
    valor:  { type: DataTypes.FLOAT,                         allowNull: false }
  }, {
    sequelize,
    modelName: 'Descuento',
    tableName: 'Descuentos'
  });

  return Descuento;
};