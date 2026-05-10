'use strict';
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('Clientes', [
      { nombre: 'María Fernanda López',    telefono: '3101234567', email: 'mflopez@gmail.com',      debe: 0, createdAt: now, updatedAt: now },
      { nombre: 'Carlos Andrés Martínez',  telefono: '3209876543', email: 'camartinez@hotmail.com', debe: 0, createdAt: now, updatedAt: now },
      { nombre: 'Luisa Valentina Torres',  telefono: '3154567890', email: 'lvtorres@gmail.com',     debe: 0, createdAt: now, updatedAt: now },
      { nombre: 'Jorge Iván Ramírez',      telefono: '3002345678', email: 'jiramirez@yahoo.com',    debe: 0, createdAt: now, updatedAt: now },
      { nombre: 'Ana Sofía Herrera',       telefono: '3118765432', email: 'asherrera@gmail.com',    debe: 0, createdAt: now, updatedAt: now },
      { nombre: 'Diego Alejandro Mora',    telefono: '3187654321', email: 'damora@gmail.com',       debe: 0, createdAt: now, updatedAt: now },
      { nombre: 'Daniela Ríos Castillo',   telefono: '3053456789', email: 'drios@hotmail.com',      debe: 0, createdAt: now, updatedAt: now },
      { nombre: 'Sebastián Vargas',        telefono: '3142345678', email: 'svargas@gmail.com',      debe: 0, createdAt: now, updatedAt: now },
      { nombre: 'Camila Ospina Duarte',    telefono: '3219874321', email: 'cospina@gmail.com',      debe: 0, createdAt: now, updatedAt: now },
      { nombre: 'Andrés Felipe Gómez',     telefono: '3165678901', email: 'afgomez@yahoo.com',      debe: 0, createdAt: now, updatedAt: now },
      { nombre: 'Valentina Suárez',        telefono: '3104321098', email: 'vsuarez@gmail.com',      debe: 0, createdAt: now, updatedAt: now },
      { nombre: 'Juan Pablo Rojas',        telefono: '3008765678', email: 'jprojas@hotmail.com',    debe: 0, createdAt: now, updatedAt: now },
      { nombre: 'Isabella Mendoza',        telefono: '3177654432', email: 'imendoza@gmail.com',     debe: 0, createdAt: now, updatedAt: now },
      { nombre: 'Nicolás Castro Peña',     telefono: '3123456789', email: 'ncastro@gmail.com',      debe: 0, createdAt: now, updatedAt: now },
      { nombre: 'Laura Cristina Muñoz',    telefono: '3056789012', email: 'lcmunoz@yahoo.com',      debe: 0, createdAt: now, updatedAt: now },
    ], {});
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('Clientes', null, {});
  }
};