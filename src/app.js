// src/app.js - El corazón de tu servidor (Backend)

const express = require('express');
const cors = require('cors'); // Para permitir que tu frontend hable con el backend
const app = express();

// Importar tus rutas (Paso 1 del taller)
const productosRoutes = require('./routes/productos.routes');

// Middlewares básicos (Ejercicio 3 del taller - preprocesamiento)
app.use(cors());
app.use(express.json()); // Para que el servidor entienda el JSON que envías

// Configuración de rutas
// Ahora todas las rutas de productos empezarán con /api/productos
app.use('/api/productos', productosRoutes);

// Manejo de errores global (Ejercicio 3 - postprocesamiento)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo salió mal en el servidor' });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor de la papelería corriendo en http://localhost:${PORT}`);
});