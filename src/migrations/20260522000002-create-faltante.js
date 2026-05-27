'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Faltantes', {
      id:               { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      nombreProducto:   { type: Sequelize.STRING,  allowNull: false },
      tipo:             { type: Sequelize.ENUM('agotado', 'no_registrado'), allowNull: false },
      cantidad:         { type: Sequelize.INTEGER,  allowNull: true },
      observacion:      { type: Sequelize.TEXT,     allowNull: true },
      estado:           { type: Sequelize.ENUM('pendiente', 'resuelto', 'descartado'), defaultValue: 'pendiente' },
      createdAt:        { type: Sequelize.DATE,     allowNull: false },
      updatedAt:        { type: Sequelize.DATE,     allowNull: false }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('Faltantes');
  }
};