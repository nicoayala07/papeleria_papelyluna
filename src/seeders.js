'use strict';

const productosPrueba = require('./data/productosPrueba');
const nombresProductosPrueba = productosPrueba.map((producto) => producto.nombre);

const productosConFechas = () => {
  const fecha = new Date();

  return productosPrueba.map((producto) => ({
    ...producto,
    createdAt: fecha,
    updatedAt: fecha
  }));
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Productos', {
      nombre: { [Sequelize.Op.in]: nombresProductosPrueba }
    }, {});

    await queryInterface.bulkInsert('Productos', productosConFechas(), {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Productos', {
      nombre: { [Sequelize.Op.in]: nombresProductosPrueba }
    }, {});
  }
};
