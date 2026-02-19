import { productos } from "./data.js";
import { renderProducts } from "./main.js";

const searchInput = document.querySelector("#search-input");

// Render inicial (UNO SOLO)
renderProducts(productos);

// Evento de búsqueda
searchInput.addEventListener("input", () => {
  const texto = searchInput.value.toLowerCase();

  const productosFiltrados = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(texto)
  );

  renderProducts(productosFiltrados);
});

console.log("App conectada");
