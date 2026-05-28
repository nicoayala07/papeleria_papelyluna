'use strict';

async function addColumnIfMissing(queryInterface, table, column, definition) {
  const description = await queryInterface.describeTable(table);
  if (!description[column]) {
    await queryInterface.addColumn(table, column, definition);
  }
}

async function removeColumnIfExists(queryInterface, table, column) {
  const description = await queryInterface.describeTable(table);
  if (description[column]) {
    await queryInterface.removeColumn(table, column);
  }
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await addColumnIfMissing(queryInterface, 'Ventas', 'descuentoNombre', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await addColumnIfMissing(queryInterface, 'Ventas', 'descuentoValor', {
      type: Sequelize.FLOAT,
      allowNull: true
    });
    await addColumnIfMissing(queryInterface, 'Ventas', 'descuentoTipo', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface) {
    await removeColumnIfExists(queryInterface, 'Ventas', 'descuentoTipo');
    await removeColumnIfExists(queryInterface, 'Ventas', 'descuentoValor');
    await removeColumnIfExists(queryInterface, 'Ventas', 'descuentoNombre');
  }
};
