// productos.js — Gestión del catálogo de productos
// En MVP2: los datos vendrán de API. Por ahora usa localStorage.

let productoEditandoId = null;

function ListarProductos() {
    const contenedor = document.getElementById("productos-container");
    if (!contenedor) return;
    contenedor.innerHTML = "";

    const busqueda = (document.getElementById("prod-search")?.value || "").toLowerCase();
    const lista = catalogoProductos.filter(p =>
        !busqueda || p.nombre.toLowerCase().includes(busqueda) || (p.codigo || "").toLowerCase().includes(busqueda)
    );

    if (lista.length === 0) {
        contenedor.innerHTML = `<p style="color:var(--texto-suave);padding:1rem">No hay productos registrados.</p>`;
        return;
    }

    lista.forEach(producto => {
        const item = document.createElement("div");
        item.classList.add("producto-item");
        item.innerHTML = `
            <div class="producto__item-info">
                <p class="producto__item-nombre">${producto.nombre}</p>
                <p class="producto__item-codigo">${producto.codigo || ""}</p>
            </div>
            <p class="producto__item-precio">$${producto.precio.toLocaleString("es-CO")}</p>
            <p class="producto__item-codigo">${producto.categoria || ""}</p>
            <div class="producto__item-acciones">
                <button class="btn-editar" data-id="${producto.id}" title="Editar">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn-eliminar-prod" data-id="${producto.id}" title="Eliminar">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        contenedor.appendChild(item);
    });

    contenedor.querySelectorAll(".btn-eliminar-prod").forEach(btn => {
        btn.addEventListener("click", () => eliminarProducto(parseInt(btn.dataset.id)));
    });
    contenedor.querySelectorAll(".btn-editar").forEach(btn => {
        btn.addEventListener("click", () => editarProducto(parseInt(btn.dataset.id)));
    });
}

function eliminarProducto(id) {
    if (!confirm("¿Seguro que quieres eliminar este producto?")) return;
    const nuevos = catalogoProductos.filter(p => p.id !== id);
    actualizarCatalogo(nuevos);
    ListarProductos();
}

function editarProducto(id) {
    const producto = catalogoProductos.find(p => p.id === id);
    if (!producto) return;
    productoEditandoId = id;

    document.getElementById("prod-nombre").value      = producto.nombre;
    document.getElementById("prod-precio").value      = producto.precio;
    document.getElementById("prod-costo").value       = producto.costo || "";
    document.getElementById("prod-codigo").value      = producto.codigo || "";
    document.getElementById("prod-stock").value       = producto.stock ?? "";
    document.getElementById("prod-seguimiento").value = producto.seguimientoInventario || "si";

    const catSelect = document.getElementById("prod-categoria");
    if (catSelect) catSelect.value = producto.categoria || "";

    document.getElementById("form-title").textContent = "Editar Producto";
}

function limpiarFormProducto() {
    productoEditandoId = null;
    ["prod-nombre","prod-precio","prod-costo","prod-codigo","prod-stock"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
    document.getElementById("prod-seguimiento").value = "si";
    document.getElementById("prod-categoria").value   = "";
    document.getElementById("form-title").textContent = "Nuevo Producto";
}

document.getElementById("btn-guardar-prod")?.addEventListener("click", () => {
    const nombre      = document.getElementById("prod-nombre").value.trim();
    const precio      = parseFloat(document.getElementById("prod-precio").value);
    const costo       = parseFloat(document.getElementById("prod-costo").value) || 0;
    const codigo      = document.getElementById("prod-codigo").value.trim();
    const categoria   = document.getElementById("prod-categoria").value;
    const stock       = parseInt(document.getElementById("prod-stock").value) || 0;
    const seguimiento = document.getElementById("prod-seguimiento").value;

    if (!nombre || isNaN(precio) || precio <= 0) {
        showToast("Nombre y precio son obligatorios y deben ser válidos.", { type: "warning" });
        return;
    }

    if (productoEditandoId) {
        const idx = catalogoProductos.findIndex(p => p.id === productoEditandoId);
        if (idx !== -1) {
            catalogoProductos[idx] = {
                ...catalogoProductos[idx],
                nombre, precio, costo, codigo, categoria,
                stock, seguimientoInventario: seguimiento
            };
        }
    } else {
        catalogoProductos.push({
            id: Date.now(),
            nombre, precio, costo, codigo, categoria,
            stock, seguimientoInventario: seguimiento
        });
    }

    actualizarCatalogo(catalogoProductos);
    limpiarFormProducto();
    ListarProductos();
});

document.getElementById("btn-cancelar-prod")?.addEventListener("click", limpiarFormProducto);

document.getElementById("btn-nuevo-producto")?.addEventListener("click", limpiarFormProducto);

document.getElementById("prod-search")?.addEventListener("input", ListarProductos);
