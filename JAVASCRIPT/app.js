const searchInput = document.querySelector("#search-input");

// ─── RENDER INICIAL ────────────────────────────────────────────────────────
renderProducts(productos);   // catálogo en vista ventas
renderFeatured();            // productos destacados en vista inicio

// ─── FILTROS ───────────────────────────────────────────────────────────────
function filtrarProductos() {
    const texto     = searchInput.value.toLowerCase();
    const categoria = document.querySelector("#category-filter").value.toLowerCase();

    const resultados = productos.filter(producto => {
        const coincideNombre    = producto.nombre.toLowerCase().includes(texto);
        const coincideCategoria = categoria === "" || producto.categoria.toLowerCase() === categoria;
        return coincideNombre && coincideCategoria;
    });

    renderProducts(resultados);
}

searchInput.addEventListener("input", filtrarProductos);
document.querySelector("#category-filter").addEventListener("change", filtrarProductos);

// ─── CARRITO ───────────────────────────────────────────────────────────────
document.querySelector("#vaciar-btn").addEventListener("click", () => {
    vaciarCarrito();
});


// ─── BOTONES HERO ──────────────────────────────────────────────────────────
document.querySelector("#btn-ver-catalogo")?.addEventListener("click", () => {
    document.querySelector('[data-vista="ventas"]').click();
});

document.querySelector("#btn-ver-historial")?.addEventListener("click", () => {
    document.querySelector('[data-vista="historial"]').click();
});

document.querySelector("#btn-ver-todo")?.addEventListener("click", () => {
    document.querySelector('[data-vista="ventas"]').click();
});
