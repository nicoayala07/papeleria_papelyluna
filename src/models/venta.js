'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Venta extends Model {
    static associate(models) {}
  }

  Venta.init({
    id: { type: DataTypes.STRING, primaryKey: true },
    fecha: { type: DataTypes.STRING },
    hora: { type: DataTypes.STRING },
    productosJson: { type: DataTypes.TEXT, allowNull: false },
    total: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    metodoPago: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Pendiente' },
    pagoCon: { type: DataTypes.FLOAT, defaultValue: 0 },
    clienteId: { type: DataTypes.STRING },
    estado: { type: DataTypes.STRING, allowNull: false, defaultValue: 'completada' },
    corregida:       { type: DataTypes.BOOLEAN, defaultValue: false },
    corregidaPor:    { type: DataTypes.STRING,  allowNull: true },
    fechaCorreccion: { type: DataTypes.DATE,    allowNull: true }
  }, {
    sequelize,
    modelName: 'Venta',
    tableName: 'Ventas'
  });

  return Venta;
};
