'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('Usuarios', [
      {
        username: 'admin',
        password: await bcrypt.hash('admin123', 10),
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'vendedor',
        password: await bcrypt.hash('vendedor123', 10),
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Usuarios', null, {});
  }
};