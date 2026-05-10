'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Producto extends Model {
    static associate(models) {}
  }

  Producto.init({
    nombre:                { type: DataTypes.STRING,          allowNull: false },
    precio:                { type: DataTypes.FLOAT,           allowNull: false, defaultValue: 0 },
    costo:                 { type: DataTypes.FLOAT,           defaultValue: 0 },
    stock:                 { type: DataTypes.INTEGER,         defaultValue: 0 },
    categoria:             { type: DataTypes.STRING },
    codigo:                { type: DataTypes.STRING },
    seguimientoInventario: { type: DataTypes.ENUM('si','no'), defaultValue: 'si' }
  }, {
    sequelize,
    modelName: 'Producto',
  });

  return Producto;
};