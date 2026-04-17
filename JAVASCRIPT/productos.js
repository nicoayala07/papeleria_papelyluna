// productos.js - Gestion del catalogo de productos

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
        btn.addEventListener("click", () => eliminarProducto(btn.dataset.id));
    });
    contenedor.querySelectorAll(".btn-editar").forEach(btn => {
        btn.addEventListener("click", () => editarProducto(btn.dataset.id));
    });
}

function obtenerDatosFormularioProducto() {
    return {
        nombre: document.getElementById("prod-nombre").value.trim(),
        precio: parseFloat(document.getElementById("prod-precio").value),
        costo: parseFloat(document.getElementById("prod-costo").value) || 0,
        codigo: document.getElementById("prod-codigo").value.trim(),
        categoria: document.getElementById("prod-categoria").value,
        stock: parseInt(document.getElementById("prod-stock").value) || 0,
        seguimientoInventario: document.getElementById("prod-seguimiento").value
    };
}

function aplicarProductoEnCatalogo(producto) {
    const idx = catalogoProductos.findIndex(p => String(p.id) === String(producto.id));
    if (idx !== -1) {
        catalogoProductos[idx] = { ...catalogoProductos[idx], ...producto };
    } else {
        catalogoProductos.push(producto);
    }
    actualizarCatalogo(catalogoProductos);
}

async function recargarProductosDesdeSheets() {
    await cargarProductosDesdeAPI();
    ListarProductos();
}

async function eliminarProducto(id) {
    const ok = await showConfirmDialog("Se eliminara este producto de Google Sheets y del catalogo local.", {
        title: "Eliminar producto",
        confirmText: "Eliminar"
    });
    if (!ok) return;

    try {
        await eliminarEntidad(String(id), "productos");
        catalogoProductos = catalogoProductos.filter(p => String(p.id) !== String(id));
        actualizarCatalogo(catalogoProductos);
        ListarProductos();
        showToast("Producto eliminado correctamente.", { type: "success" });
        await recargarProductosDesdeSheets();
    } catch (error) {
        console.error(error);
        showToast("No se pudo eliminar el producto.", { type: "error" });
    }
}

function editarProducto(id) {
    const producto = catalogoProductos.find(p => String(p.id) === String(id));
    if (!producto) return;
    productoEditandoId = String(id);

    document.getElementById("prod-nombre").value = producto.nombre;
    document.getElementById("prod-precio").value = producto.precio;
    document.getElementById("prod-costo").value = producto.costo || "";
    document.getElementById("prod-codigo").value = producto.codigo || "";
    document.getElementById("prod-stock").value = producto.stock ?? "";
    document.getElementById("prod-seguimiento").value = producto.seguimientoInventario || "si";

    const catSelect = document.getElementById("prod-categoria");
    if (catSelect) catSelect.value = producto.categoria || "";

    document.getElementById("form-title").textContent = "Editar Producto";
}

function limpiarFormProducto() {
    productoEditandoId = null;
    ["prod-nombre", "prod-precio", "prod-costo", "prod-codigo", "prod-stock"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
    document.getElementById("prod-seguimiento").value = "si";
    document.getElementById("prod-categoria").value = "";
    document.getElementById("form-title").textContent = "Nuevo Producto";
}

async function guardarProducto() {
    const btn = document.getElementById("btn-guardar-prod");
    const editandoId = productoEditandoId;
    const datos = obtenerDatosFormularioProducto();

    if (!datos.nombre || isNaN(datos.precio) || datos.precio <= 0) {
        showToast("Nombre y precio son obligatorios y deben ser validos.", { type: "warning" });
        return;
    }

    const payload = {
        id: String(editandoId || Date.now()),
        ...datos
    };

    if (btn) {
        btn.disabled = true;
        btn.textContent = "Guardando...";
    }

    try {
        aplicarProductoEnCatalogo(payload);
        ListarProductos();

        if (editandoId) {
            await eliminarEntidad(String(editandoId), "productos");
        }

        await postProducto(payload);
        showToast(editandoId ? "Producto actualizado en Google Sheets." : "Producto guardado en Google Sheets.", {
            type: "success"
        });
        limpiarFormProducto();
        await recargarProductosDesdeSheets();
        if (typeof renderCarrito === "function") renderCarrito();
        if (typeof renderVentasGuardadas === "function") renderVentasGuardadas();
    } catch (error) {
        console.error(error);
        showToast("No se pudo sincronizar el producto con Google Sheets.", { type: "error" });
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = "Guardar";
        }
    }
}

document.getElementById("btn-guardar-prod")?.addEventListener("click", guardarProducto);
document.getElementById("btn-cancelar-prod")?.addEventListener("click", limpiarFormProducto);
document.getElementById("btn-nuevo-producto")?.addEventListener("click", limpiarFormProducto);
document.getElementById("prod-search")?.addEventListener("input", ListarProductos);
