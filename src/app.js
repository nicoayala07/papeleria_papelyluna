const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models/index');
const app = express();

const productosRoutes = require('./routes/productos.routes');
const requestLogger = require('./middlewares/requestLogger');
const sanitizeIds = require('./middlewares/sanitizeIds');

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(sanitizeIds);
app.use('/api/productos', productosRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal en el servidor' });
});

const PORT = 3000;

sequelize.authenticate()
  .then(() => {
    console.log('Conexión a SQLite exitosa');
    return sequelize.sync();
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('No se pudo conectar a la BD:', err.message);
  });