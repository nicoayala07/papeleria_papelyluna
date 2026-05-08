// src/app.js - El corazón de tu servidor (Backend)

const express = require('express');
const cors = require('cors');
const app = express();

// Importar tus rutas
const productosRoutes = require('./routes/productos.routes');

// Importar middlewares
const requestLogger = require('./middlewares/requestLogger');
const sanitizeIds = require('./middlewares/sanitizeIds');

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Ejercicio 3 — Pre-filter: registra cada solicitud
app.use(requestLogger);

// Ejercicio 4 — Post-filter: elimina campos _id de las respuestas
app.use(sanitizeIds);

// Configuración de rutas
app.use('/api/productos', productosRoutes);

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo salió mal en el servidor' });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor de la papelería corriendo en http://localhost:${PORT}`);
});