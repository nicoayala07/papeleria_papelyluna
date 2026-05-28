require('dotenv').config();
const app = require('./app');
const path = require('path');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { sequelize, Usuario } = require('./models');
const productosRoutes   = require('./routes/productos.routes');
const clientesRoutes    = require('./routes/clientes.routes');
const proveedoresRoutes = require('./routes/proveedores.routes');
const categoriasRoutes  = require('./routes/categorias.routes');
const ventasRoutes      = require('./routes/ventas.routes');
const comprasRoutes     = require('./routes/compras.routes');
const descuentosRoutes  = require('./routes/descuentos.routes');
const faltantesRoutes   = require('./routes/faltantes.routes');
const reportesRoutes    = require('./routes/reportes.routes');
const requestLogger = require('./middlewares/requestLogger');
const sanitizeIds = require('./middlewares/sanitizeIds');
const authRoutes   = require('./routes/auth.routes');
const authJwt      = require('./middlewares/authJwt');
const requireRole  = require('./middlewares/requireRole');


const PORT = process.env.PORT || 3000;
const DEFAULT_USERS = [
  { username: 'admin', password: 'admin123', role: 'ADMIN' },
  { username: 'vendedor', password: 'vendedor123', role: 'USER' }
];

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(sanitizeIds);
app.use(express.static(path.join(__dirname, '..')));


app.get('/authors', (req, res) => {
  res.json([
    { nombre: 'Cristian Cifuentes (el chifu)', codigo: '349918' },
    { nombre: 'Tomas Poveda (Tom Tom)' ,                  codigo: '350571' },
    { nombre: 'Nicolas ayala (el que se apellida como mi ex)',             codigo: '354774' }
  ]);
});

app.use('/api',             authRoutes);
app.use('/api/productos',   authJwt, productosRoutes);
app.use('/api/clientes',    authJwt, clientesRoutes);
app.use('/api/proveedores', authJwt, requireRole('ADMIN'), proveedoresRoutes);
app.use('/api/categorias',  authJwt, categoriasRoutes);
app.use('/api/ventas',      authJwt, ventasRoutes);
app.use('/api/compras',     authJwt, comprasRoutes);
app.use('/api/descuentos', authJwt, descuentosRoutes);
app.use('/api/faltantes',  authJwt, faltantesRoutes); 
app.use('/api/reportes',   authJwt, reportesRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salio mal en el servidor' });
});

async function ensureDefaultUsers() {
  for (const user of DEFAULT_USERS) {
    const password = await bcrypt.hash(user.password, 10);
    const existentes = await Usuario.findAll({ where: { username: user.username } });

    if (existentes.length > 0) {
      await Usuario.update(
        { password, role: user.role },
        { where: { username: user.username } }
      );
      console.log(`Usuario por defecto actualizado: ${user.username}`);
      continue;
    }

    await Usuario.create({
      username: user.username,
      password,
      role: user.role
    });
    console.log(`Usuario por defecto creado: ${user.username}`);
  }
}

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Conexion a BD exitosa');
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync();
    }
    await ensureDefaultUsers();
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('No se pudo conectar a la BD:', err.message);
    process.exit(1);
  }
}

startServer();
