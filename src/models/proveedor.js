'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Proveedor extends Model {
    static associate(models) {}
  }
  Proveedor.init({
    nombre:   { type: DataTypes.STRING, allowNull: false },
    nit:      { type: DataTypes.STRING, allowNull: false },
    telefono: { type: DataTypes.STRING }
  }, {
    sequelize,
    modelName: 'Proveedor',
    tableName: 'Proveedores'
  });
  return Proveedor;
};
