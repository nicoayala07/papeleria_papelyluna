'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Compra extends Model {
    static associate(models) {}
  }

  Compra.init({
    id: { type: DataTypes.STRING, primaryKey: true },
    fecha: { type: DataTypes.STRING },
    proveedorId: { type: DataTypes.STRING },
    proveedorNombre: { type: DataTypes.STRING },
    metodoPago: { type: DataTypes.STRING, allowNull: false },
    total: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    itemsJson: { type: DataTypes.TEXT, allowNull: false }
  }, {
    sequelize,
    modelName: 'Compra',
    tableName: 'Compras'
  });

  return Compra;
};
