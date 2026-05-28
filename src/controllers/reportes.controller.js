const { Compra, Faltante, Producto, Venta } = require('../models');
const { Op } = require('sequelize');

function parseJsonList(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function getRangoFechas(query) {
  const hasta = query.hasta ? new Date(query.hasta) : new Date();
  const desde = query.desde ? new Date(query.desde) : new Date(hasta);

  if (!query.desde) desde.setDate(desde.getDate() - 30);
  desde.setHours(0, 0, 0, 0);
  hasta.setHours(23, 59, 59, 999);

  return { desde, hasta };
}

function sumarPorMetodo(registros) {
  return registros.reduce((acc, registro) => {
    const metodo = registro.metodoPago || 'Sin metodo';
    acc[metodo] = (acc[metodo] || 0) + (Number(registro.total) || 0);
    return acc;
  }, {});
}

function sumarProductosVendidos(ventas) {
  const mapa = new Map();

  ventas.forEach(venta => {
    parseJsonList(venta.productosJson).forEach(item => {
      const key = String(item.id || item.nombre || 'sin-id');
      const actual = mapa.get(key) || {
        id: item.id || '',
        nombre: item.nombre || 'Producto sin nombre',
        cantidad: 0,
        total: 0
      };
      const cantidad = Number(item.cantidad) || 0;
      const precio = Number(item.precio) || 0;
      actual.cantidad += cantidad;
      actual.total += precio * cantidad;
      mapa.set(key, actual);
    });
  });

  return [...mapa.values()]
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 10);
}

exports.getResumen = async (req, res, next) => {
  try {
    const { desde, hasta } = getRangoFechas(req.query);
    const filtroRango = { createdAt: { [Op.between]: [desde, hasta] } };

    const [ventas, compras, faltantes, productosBajoStock] = await Promise.all([
      Venta.findAll({
        where: { ...filtroRango, estado: 'completada' },
        order: [['createdAt', 'DESC']]
      }),
      Compra.findAll({
        where: filtroRango,
        order: [['createdAt', 'DESC']]
      }),
      Faltante.findAll({
        where: filtroRango,
        order: [['createdAt', 'DESC']]
      }),
      Producto.findAll({
        where: {
          seguimientoInventario: 'si',
          stock: { [Op.lte]: Number(req.query.stockMinimo) || 3 }
        },
        order: [['stock', 'ASC'], ['nombre', 'ASC']]
      })
    ]);

    const totalVentas = ventas.reduce((acc, venta) => acc + (Number(venta.total) || 0), 0);
    const totalCompras = compras.reduce((acc, compra) => acc + (Number(compra.total) || 0), 0);

    res.json({
      rango: {
        desde: desde.toISOString(),
        hasta: hasta.toISOString()
      },
      ventas: {
        cantidad: ventas.length,
        total: totalVentas,
        promedio: ventas.length ? totalVentas / ventas.length : 0,
        porMetodo: sumarPorMetodo(ventas),
        productosTop: sumarProductosVendidos(ventas)
      },
      compras: {
        cantidad: compras.length,
        total: totalCompras,
        porMetodo: sumarPorMetodo(compras)
      },
      utilidadBruta: totalVentas - totalCompras,
      faltantes: {
        total: faltantes.length,
        pendientes: faltantes.filter(f => f.estado === 'pendiente').length,
        resueltos: faltantes.filter(f => f.estado === 'resuelto').length,
        descartados: faltantes.filter(f => f.estado === 'descartado').length,
        recientes: faltantes.slice(0, 8)
      },
      inventario: {
        bajoStock: productosBajoStock.map(producto => ({
          id: producto.id,
          nombre: producto.nombre,
          categoria: producto.categoria || '',
          codigo: producto.codigo || '',
          stock: Number(producto.stock) || 0
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};
