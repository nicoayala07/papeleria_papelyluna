'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.describeTable('Ventas');
      return;
    } catch (error) {}

    await queryInterface.createTable('Ventas', {
      id: { allowNull: false, primaryKey: true, type: Sequelize.STRING },
      fecha: { type: Sequelize.STRING },
      hora: { type: Sequelize.STRING },
      productosJson: { allowNull: false, type: Sequelize.TEXT },
      total: { allowNull: false, type: Sequelize.FLOAT, defaultValue: 0 },
      metodoPago: { allowNull: false, type: Sequelize.STRING, defaultValue: 'Pendiente' },
      pagoCon: { type: Sequelize.FLOAT, defaultValue: 0 },
      clienteId: { type: Sequelize.STRING },
      descuentoNombre: { type: Sequelize.STRING, allowNull: true },
      descuentoValor: { type: Sequelize.FLOAT, allowNull: true },
      descuentoTipo: { type: Sequelize.STRING, allowNull: true },
      estado: { allowNull: false, type: Sequelize.STRING, defaultValue: 'completada' },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },

  async down(queryInterface) {
    try {
      await queryInterface.describeTable('Ventas');
    } catch (error) {
      return;
    }

    await queryInterface.dropTable('Ventas');
  }
};
