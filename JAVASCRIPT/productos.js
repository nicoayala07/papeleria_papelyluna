function ListarProductos () {
const contenedor = document.getElementById("productos-container");
contenedor.innerHTML = "";

productos.forEach(producto => {
    const item =document.createElement("div");
    item.classList.add("producto-item");
    item.innerHTML = `
        <div class="producto__item-info">
            <p class="producto__item-nombre">${producto.nombre}</p>
            <p class="producto__item-precio">$${producto.precio.toLocaleString("es-CO")}</p>
        </div>
        <div class="producto__item-acciones">
            <button class="btn-editar" data-id="${producto.id}">
            <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn-eliminar-prod" data-id="${producto.id}">
            <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;
    contenedor.appendChild(item);
});

 contenedor.querySelectorAll(".btn-eliminar-prod").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = parseInt(btn.dataset.id);
            eliminarProducto(id);
        });
    });
}

let productoEditandoId = null;

function eliminarProducto(id) {
    const confirmar = confirm("¿Estás seguro de eliminar este producto?");
    if (!confirmar) return;

    // filtra el array quitando el producto con ese id
    const index = productos.findIndex(p => p.id === id);
    productos.splice(index, 1);

    ListarProductos();
}
