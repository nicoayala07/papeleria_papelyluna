'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Cliente extends Model {
    static associate(models) {}
  }
  Cliente.init({
    nombre:   { type: DataTypes.STRING, allowNull: false },
    telefono: { type: DataTypes.STRING },
    email:    { type: DataTypes.STRING },
    debe:     { type: DataTypes.FLOAT, defaultValue: 0 }
  }, {
    sequelize,
    modelName: 'Cliente',
  });
  return Cliente;
};