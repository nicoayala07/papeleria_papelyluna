# POS Papel y Luna

Sistema punto de venta para papeleria y miscelanea con frontend en HTML/CSS/JavaScript, backend Node.js + Express y persistencia en base de datos mediante Sequelize.

## Funcionalidades principales

- Login con JWT y roles basicos.
- Ventas, cobro y comprobante.
- Productos e inventario.
- Compras a proveedores.
- Clientes, proveedores, categorias y descuentos.
- Faltantes y reportes basicos.

## Credenciales de demo

```text
Administrador
Usuario: admin
Contrasena: admin123

Cajero
Usuario: vendedor
Contrasena: vendedor123
```

## Ejecutar localmente

1. Instalar dependencias:

```bash
npm install
```

2. Crear `.env` tomando como base `.env.example`.

3. Crear la base de datos MySQL local definida en `DB_NAME`.

4. Ejecutar migraciones:

```bash
npm run db:migrate
```

5. Iniciar el servidor:

```bash
npm start
```

La app queda disponible en:

```text
http://localhost:3000
```

Tambien puede abrirse `index.html` directamente; en ese caso el frontend consume `http://localhost:3000/api`.

## Despliegue

- Frontend: GitHub Pages.
- Backend/API: Render.
- Base de datos: PostgreSQL en Render.

El archivo `render.yaml` configura el servicio web, la base de datos, migraciones y variables necesarias para produccion.

## API

Base local:

```text
http://localhost:3000/api
```

Base produccion:

```text
https://papeleria-papelyluna.onrender.com/api
```
