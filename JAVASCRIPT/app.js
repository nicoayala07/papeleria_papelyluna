import { productos } from "./data.js";
import { actualizarCarrito } from "./carrito.js";
import { cambiarCantidad } from "./carrito.js";
import { eliminarDelCarrito } from "./carrito.js";
import { agregarAlCarrito } from "./carrito.js";
import { renderProducts } from "./main.js";

renderProducts(productos);

console.log("App conectada");
