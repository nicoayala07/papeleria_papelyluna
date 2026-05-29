# POS Papel y Luna

Sistema punto de venta para papelería y miscelánea con frontend en HTML/CSS/JavaScript, backend Node.js + Express y persistencia en base de datos mediante Sequelize.

## Funcionalidades principales

- Login con JWT y roles (administrador / cajero).
- Ventas, cobro y comprobante.
- Productos e inventario reactivo.
- Compras a proveedores.
- Clientes, proveedores, categorías y descuentos.
- Corrección y reembolso de ventas.
- Faltantes y reportes básicos.

## Credenciales de demo

```text
Administrador
Usuario: admin
Contraseña: admin123

Cajero
Usuario: vendedor
Contraseña: vendedor123
```

## Ejecutar localmente

1. Instalar dependencias:

```bash
npm install
```

2. Crear `.env` tomando como base `.env.example`.

3. Crear la base de datos **MySQL** local con el nombre definido en `DB_NAME`.

4. Ejecutar migraciones y seeders:

```bash
npm run db:migrate
npm run db:seed
```

5. Iniciar el servidor:

```bash
npm start
```

El servidor queda disponible en `http://localhost:3000`.  
El frontend puede abrirse directamente desde `index.html` y consumirá `http://localhost:3000/api`.

## Despliegue

- **Frontend:** GitHub Pages
- **Backend/API:** Render
- **Base de datos:** PostgreSQL en Render

El archivo `render.yaml` configura automáticamente el servicio, la base de datos, las migraciones y las variables de entorno para producción.

## URLs

- Frontend: `https://nicoayala07.github.io/papeleria_papelyluna`
- API: `https://papeleria-papelyluna.onrender.com/api`

## Equipo

- Tomas Poveda Salguero
- Nicolas Gabriel Ayala Nino
- Cristian Samuel Cifuentes 