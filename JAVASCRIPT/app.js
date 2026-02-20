import { productos } from "./data.js";
import { renderProducts } from "./main.js";
import { vaciarCarrito, obtenerCarrito } from "./carrito.js";

const searchInput = document.querySelector("#search-input");

// Render inicial
renderProducts(productos);

// Filtro de búsqueda
searchInput.addEventListener("input", () => {
  const texto = searchInput.value.toLowerCase();
  const productosFiltrados = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(texto)
  );
  renderProducts(productosFiltrados);
});

// Vaciar carrito
document.querySelector("#vaciar-btn").addEventListener("click", () => {
    vaciarCarrito();
});

// Finalizar compra - abrir modal
document.querySelector("#checkout-btn").addEventListener("click", () => {
    const carrito = obtenerCarrito();

    if (carrito.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }

    // Llenar items del modal
    const modalItems = document.querySelector("#modal-items");
    modalItems.innerHTML = "";
    carrito.forEach(item => {
        const fila = document.createElement("div");
        fila.innerHTML = `
            <span>${item.nombre} x${item.cantidad}</span>
            <span>$${(item.precio * item.cantidad).toLocaleString("es-CO")}</span>
        `;
        modalItems.appendChild(fila);
    });

    // Llenar totales
    const subtotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    const envio = 5000;
    const total = subtotal + envio;

    document.querySelector("#modal-subtotal").textContent = `$${subtotal.toLocaleString("es-CO")}`;
    document.querySelector("#modal-envio").textContent = `$${envio.toLocaleString("es-CO")}`;
    document.querySelector("#modal-total").textContent = `$${total.toLocaleString("es-CO")}`;

    // Mostrar modal
    document.querySelector("#modal-overlay").style.display = "flex";
});

// Cancelar modal
    document.querySelector("#modal-cancelar").addEventListener("click", () => {
    document.querySelector("#modal-overlay").style.display = "none";
});

// Confirmar pedido
document.querySelector("#modal-confirmar").addEventListener("click", () => {
    document.querySelector("#modal-overlay").style.display = "none";
    vaciarCarrito();
    alert("¡Pedido confirmado! Gracias por tu compra 🎉");
});

console.log("App conectada");