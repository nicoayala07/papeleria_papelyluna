'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Ventas', 'corregida',        { type: Sequelize.BOOLEAN, defaultValue: false });
    await queryInterface.addColumn('Ventas', 'corregidaPor',     { type: Sequelize.STRING,  allowNull: true });
    await queryInterface.addColumn('Ventas', 'fechaCorreccion',  { type: Sequelize.DATE,    allowNull: true });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('Ventas', 'corregida');
    await queryInterface.removeColumn('Ventas', 'corregidaPor');
    await queryInterface.removeColumn('Ventas', 'fechaCorreccion');
  }
};