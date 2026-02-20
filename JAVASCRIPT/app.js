import { productos } from "./data.js";
import { renderProducts } from "./main.js";
import { vaciarCarrito, obtenerCarrito } from "./carrito.js";

const searchInput = document.querySelector("#search-input");

// Render inicial
renderProducts(productos);

function filtrarProductos() {
    const texto = searchInput.value.toLowerCase();
    const categoria = document.querySelector("#category-filter").value.toLowerCase();

    const resultados = productos.filter(producto => {
        const coincideNombre = producto.nombre.toLowerCase().includes(texto);
        const coincideCategoria = categoria === "" || producto.categoria.toLowerCase() === categoria;
        return coincideNombre && coincideCategoria;
    });

    renderProducts(resultados);
}
    searchInput.addEventListener("input", filtrarProductos);
    document.querySelector("#category-filter").addEventListener("change", filtrarProductos);

// Filtro de búsqueda


// Vaciar carrito   
document.querySelector("#vaciar-btn").addEventListener("click", () => {
    vaciarCarrito();
});

// Finalizar compra
document.querySelector("#checkout-btn").addEventListener("click", () => {
    const carrito = obtenerCarrito();
    if (carrito.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }
    alert("¡Pedido confirmado! Gracias por tu compra");
    vaciarCarrito();
});