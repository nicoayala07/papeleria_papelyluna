'use strict';

const productosPrueba = require('../data/productosPrueba');
const nombresProductosPrueba = productosPrueba.map((producto) => producto.nombre);

const productosConFechas = () => {
  const fecha = new Date();

  return productosPrueba.map((producto) => ({
    ...producto,
    createdAt: fecha,
    updatedAt: fecha
  }));
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Productos', {
      nombre: { [Sequelize.Op.in]: nombresProductosPrueba }
    }, {});

    await queryInterface.bulkInsert('Productos', productosConFechas(), {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Productos', {
      nombre: { [Sequelize.Op.in]: nombresProductosPrueba }
    }, {});
  }
};
