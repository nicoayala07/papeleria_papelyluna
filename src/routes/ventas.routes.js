const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/ventas.controller');

router.get('/', ctrl.getVentas);
router.post('/', ctrl.saveVenta);
router.get('/pendientes', ctrl.getVentasPendientes);
router.post('/pendientes', ctrl.saveVentaPendiente);
router.delete('/pendientes/:id', ctrl.deleteVentaPendiente);
router.get('/:id', ctrl.getVenta);
router.delete('/:id', ctrl.deleteVenta);
router.put('/:id',            ctrl.corregirVenta);
router.post('/:id/reembolso', ctrl.reembolsarVenta);

module.exports = router;
