'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Categoria extends Model {
    static associate(models) {}
  }

  Categoria.init({
    nombre: { type: DataTypes.STRING, allowNull: false },
    color:  { type: DataTypes.STRING, defaultValue: '#6d28d9' }
  }, {
    sequelize,
    modelName: 'Categoria',
    tableName: 'Categorias'
  });

  return Categoria;
};
