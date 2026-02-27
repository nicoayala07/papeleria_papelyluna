const searchInput    = document.querySelector("#search-input");
const categoryFilter = document.querySelector("#category-filter");

renderProducts(productos);

function filtrarProductos() {
    const texto     = searchInput.value.toLowerCase();
    const categoria = categoryFilter ? categoryFilter.value.toLowerCase() : "";

    const resultados = productos.filter(producto => {
        const coincideNombre    = producto.nombre.toLowerCase().includes(texto);
        const coincideCategoria = categoria === "" || producto.categoria.toLowerCase() === categoria;
        return coincideNombre && coincideCategoria;
    });

    renderProducts(resultados);
}

searchInput.addEventListener("input", filtrarProductos);
if (categoryFilter) categoryFilter.addEventListener("change", filtrarProductos);

document.querySelector("#vaciar-btn").addEventListener("click", () => {
    vaciarCarrito();
});

