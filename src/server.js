require('dotenv').config();
const app = require('./app');
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const productosRoutes   = require('./routes/productos.routes');
const clientesRoutes    = require('./routes/clientes.routes');
const proveedoresRoutes = require('./routes/proveedores.routes');
const categoriasRoutes  = require('./routes/categorias.routes');
const ventasRoutes      = require('./routes/ventas.routes');
const comprasRoutes     = require('./routes/compras.routes');
const requestLogger = require('./middlewares/requestLogger');

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use('/api/productos',   productosRoutes);
app.use('/api/clientes',    clientesRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/categorias',  categoriasRoutes);
app.use('/api/ventas',      ventasRoutes);
app.use('/api/compras',     comprasRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salio mal en el servidor' });
});

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Conexion a MySQL exitosa');
    await sequelize.sync();
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('No se pudo conectar a la BD:', err.message);
    process.exit(1);
  }
}

startServer();
