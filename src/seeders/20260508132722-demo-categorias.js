'use strict';
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('Categorias', [
      { nombre: 'Cuadernos',    color: '#3b82f6', createdAt: now, updatedAt: now },
      { nombre: 'Escritura',    color: '#8b5cf6', createdAt: now, updatedAt: now },
      { nombre: 'Papel',        color: '#f59e0b', createdAt: now, updatedAt: now },
      { nombre: 'Organización', color: '#10b981', createdAt: now, updatedAt: now },
      { nombre: 'Arte',         color: '#ef4444', createdAt: now, updatedAt: now },
      { nombre: 'Oficina',      color: '#6d28d9', createdAt: now, updatedAt: now },
    ], {});
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('Categorias', null, {});
  }
};