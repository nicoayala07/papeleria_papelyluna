'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Productos', {
      id: {
        allowNull: false, autoIncrement: true, primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre:                { type: Sequelize.STRING,           allowNull: false },
      precio:                { type: Sequelize.FLOAT,            allowNull: false, defaultValue: 0 },
      costo:                 { type: Sequelize.FLOAT,            defaultValue: 0 },
      stock:                 { type: Sequelize.INTEGER,          defaultValue: 0 },
      categoria:             { type: Sequelize.STRING },
      codigo:                { type: Sequelize.STRING },
      seguimientoInventario: { type: Sequelize.ENUM('si', 'no'), defaultValue: 'si' },
      createdAt:             { allowNull: false, type: Sequelize.DATE },
      updatedAt:             { allowNull: false, type: Sequelize.DATE }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('Productos');
  }
};