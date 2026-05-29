'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.describeTable('Configuraciones');
      return;
    } catch (error) {}

    await queryInterface.createTable('Configuraciones', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
        defaultValue: 'negocio'
      },
      nombreNegocio: { type: Sequelize.STRING },
      nit: { type: Sequelize.STRING },
      direccion: { type: Sequelize.STRING },
      telefono: { type: Sequelize.STRING },
      logoUrl: { type: Sequelize.STRING },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },

  async down(queryInterface) {
    try {
      await queryInterface.describeTable('Configuraciones');
    } catch (error) {
      return;
    }

    await queryInterface.dropTable('Configuraciones');
  }
};
