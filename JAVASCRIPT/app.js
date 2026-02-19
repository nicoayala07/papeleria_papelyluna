import { productos } from "./data.js"; // Importar el array de productos desde el archivo data.js
import { renderProducts } from "./main.js"; 

renderProducts(productos); 

console.log("App conectada"); 
const searchInput = document.querySelector("#search-input");

// Render inicial
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


