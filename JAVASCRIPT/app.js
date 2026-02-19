import { productos } from "./data.js";
import { renderProducts } from "./main.js";

const searchInput = document.querySelector("#search-input");
const categoryFilter = document.querySelector("#category-filter"); // ✅ conectado

function filtrarProductos() {
  const texto = searchInput.value.toLowerCase();
  const categoria = categoryFilter.value;

  const filtrados = productos.filter(producto => {
    const coincideTexto = producto.nombre.toLowerCase().includes(texto);
    const coincideCategoria = categoria === "" || producto.categoria === categoria;
    return coincideTexto && coincideCategoria; // ✅ ambos filtros funcionan juntos
  });

  renderProducts(filtrados);
}


renderProducts(productos);

searchInput.addEventListener("input", filtrarProductos);
categoryFilter.addEventListener("change", filtrarProductos); // ✅ evento de categoría

console.log("App conectada");