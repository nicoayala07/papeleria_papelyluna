'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.describeTable('Compras');
      return;
    } catch (error) {}

    await queryInterface.createTable('Compras', {
      id: { allowNull: false, primaryKey: true, type: Sequelize.STRING },
      fecha: { type: Sequelize.STRING },
      proveedorId: { type: Sequelize.STRING },
      proveedorNombre: { type: Sequelize.STRING },
      metodoPago: { allowNull: false, type: Sequelize.STRING },
      total: { allowNull: false, type: Sequelize.FLOAT, defaultValue: 0 },
      itemsJson: { allowNull: false, type: Sequelize.TEXT },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },

  async down(queryInterface) {
    try {
      await queryInterface.describeTable('Compras');
    } catch (error) {
      return;
    }

    await queryInterface.dropTable('Compras');
  }
};
