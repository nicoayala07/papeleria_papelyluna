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
  up: async (queryInterface, Sequelize) => {
    await addColumnIfMissing(queryInterface, 'Ventas', 'corregida',        { type: Sequelize.BOOLEAN, defaultValue: false });
    await addColumnIfMissing(queryInterface, 'Ventas', 'corregidaPor',     { type: Sequelize.STRING,  allowNull: true });
    await addColumnIfMissing(queryInterface, 'Ventas', 'fechaCorreccion',  { type: Sequelize.DATE,    allowNull: true });
  },
  down: async (queryInterface) => {
    await removeColumnIfExists(queryInterface, 'Ventas', 'corregida');
    await removeColumnIfExists(queryInterface, 'Ventas', 'corregidaPor');
    await removeColumnIfExists(queryInterface, 'Ventas', 'fechaCorreccion');
  }
};
