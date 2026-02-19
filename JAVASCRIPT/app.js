import { productos } from "./data.js";
import { agregarAlCarrito } from "./carrito.js";
import { renderProducts } from "./main.js";

renderProducts(productos);

console.log("App conectada");

export const carrito = [];

