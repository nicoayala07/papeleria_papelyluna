'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Clientes', {
      id:        { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      nombre:    { type: Sequelize.STRING, allowNull: false },
      telefono:  { type: Sequelize.STRING },
      email:     { type: Sequelize.STRING },
      debe:      { type: Sequelize.FLOAT, defaultValue: 0 },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Clientes');
  }
};
