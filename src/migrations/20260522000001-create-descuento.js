'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Descuentos', {
      id:        { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      nombre:    { type: Sequelize.STRING, allowNull: false },
      tipo:      { type: Sequelize.ENUM('porcentaje', 'fijo'), allowNull: false },
      valor:     { type: Sequelize.FLOAT, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('Descuentos');
  }
};