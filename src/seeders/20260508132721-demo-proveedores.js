'use strict';
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('Proveedores', [
      { nombre: 'Distribuidora Norma S.A.',         nit: '860002964-1', telefono: '6017456789', createdAt: now, updatedAt: now },
      { nombre: 'Faber-Castell Colombia',            nit: '890123456-2', telefono: '6014567890', createdAt: now, updatedAt: now },
      { nombre: 'Papelería El Estudiante Ltda.',     nit: '900234567-3', telefono: '3101234567', createdAt: now, updatedAt: now },
      { nombre: 'BIC Colombia S.A.S.',               nit: '800345678-4', telefono: '6012345678', createdAt: now, updatedAt: now },
      { nombre: 'Comercializadora Pappel',           nit: '900456789-5', telefono: '3209876543', createdAt: now, updatedAt: now },
      { nombre: 'Impresora y Papelería Nacional',    nit: '700567890-6', telefono: '6018765432', createdAt: now, updatedAt: now },
      { nombre: 'Distribuciones Ofitodo',            nit: '900678901-7', telefono: '3154321098', createdAt: now, updatedAt: now },
      { nombre: 'Colbón S.A.',                       nit: '860789012-8', telefono: '6013456789', createdAt: now, updatedAt: now },
    ], {});
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('Proveedores', null, {});
  }
};