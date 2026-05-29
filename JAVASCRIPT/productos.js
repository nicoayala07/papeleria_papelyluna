let productoEditandoId = null;

function normalizarProductoTexto(valor) {
    return (valor || "").toString().trim();
}

function formatearCOP(valor) {
    return "$" + (Number(valor) || 0).toLocaleString("es-CO");
}

function abrirFormProducto() {
    const form = document.getElementById("productos-form");
    if (form) form.style.display = "flex";
}

function cerrarFormProducto() {
    const form = document.getElementById("productos-form");
    if (form) form.style.display = "none";
}

function renderProveedoresProducto(proveedores = []) {
    const box = document.getElementById("prod-proveedores-box");
    const lista = document.getElementById("prod-proveedores-lista");
    if (!box || !lista) return;

    box.style.display = "block";
    if (!proveedores.length) {
        lista.innerHTML = "Ninguno registrado";
        return;
    }

    lista.innerHTML = proveedores.map(proveedor => `
        <div class="proveedores-producto-item">
            <strong>${proveedor.nombre || "Sin nombre"}</strong>
            <span>${proveedor.nit ? "NIT: " + proveedor.nit : "Sin NIT"}</span>
        </div>
    `).join("");
}

async function cargarProveedoresProducto(id) {
    renderProveedoresProducto([]);
    const lista = document.getElementById("prod-proveedores-lista");
    if (lista) lista.textContent = "Cargando proveedores...";

    try {
        const proveedores = await getProveedoresProducto(id);
        renderProveedoresProducto(proveedores);
    } catch (error) {
        console.error(error);
        if (lista) lista.textContent = "No se pudieron cargar los proveedores.";
    }
}

function getProductoEditandoId() {
    return productoEditandoId;
}

function obtenerDatosFormularioProducto() {
    return {
        nombre: normalizarProductoTexto(document.getElementById("prod-nombre")?.value),
        categoria: normalizarProductoTexto(document.getElementById("prod-categoria")?.value),
        precio: Number(document.getElementById("prod-precio")?.value) || 0,
        costo: Number(document.getElementById("prod-costo")?.value) || 0,
        codigo: normalizarProductoTexto(document.getElementById("prod-codigo")?.value),
        seguimientoInventario: document.getElementById("prod-seguimiento")?.value || "si",
        stock: Number.parseInt(document.getElementById("prod-stock")?.value, 10) || 0
    };
}

function limpiarFormProducto() {
    productoEditandoId = null;

    ["prod-nombre", "prod-precio", "prod-costo", "prod-codigo", "prod-stock"].forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = "";
    });

    const categoria = document.getElementById("prod-categoria");
    const seguimiento = document.getElementById("prod-seguimiento");
    const titulo = document.getElementById("form-title");

    if (categoria) categoria.value = "";
    if (seguimiento) seguimiento.value = "si";
    if (titulo) titulo.textContent = "Nuevo Producto";
    document.getElementById("prod-proveedores-box")?.style.setProperty("display", "none");
    const proveedoresLista = document.getElementById("prod-proveedores-lista");
    if (proveedoresLista) proveedoresLista.textContent = "Ninguno registrado";

    cerrarFormProducto();
}

function editarProducto(id) {
    const producto = catalogoProductos.find(item => String(item.id) === String(id));
    if (!producto) return;

    productoEditandoId = producto.id;

    document.getElementById("prod-nombre").value = producto.nombre || "";
    document.getElementById("prod-precio").value = producto.precio || 0;
    document.getElementById("prod-costo").value = producto.costo || 0;
    document.getElementById("prod-codigo").value = producto.codigo || "";
    document.getElementById("prod-stock").value = producto.stock || 0;

    const categoria = document.getElementById("prod-categoria");
    if (categoria) categoria.value = producto.categoria || "";

    const seguimiento = document.getElementById("prod-seguimiento");
    if (seguimiento) seguimiento.value = producto.seguimientoInventario || "si";

    const titulo = document.getElementById("form-title");
    if (titulo) titulo.textContent = "Editar Producto";

    abrirFormProducto();
    cargarProveedoresProducto(producto.id);
}

async function eliminarProducto(id) {
    const ok = await showConfirmDialog("Se eliminara este producto.", {
        title: "Eliminar producto",
        confirmText: "Eliminar"
    });
    if (!ok) return;

    try {
        await eliminarProductoApi(id);
        showToast("Producto eliminado correctamente.", { type: "success" });
        if (String(productoEditandoId) === String(id)) limpiarFormProducto();
        await cargarProductosDesdeAPI();
    } catch (error) {
        console.error(error);
        showToast("No se pudo eliminar el producto.", { type: "error" });
    }
}

function ListarProductos() {
    const contenedor = document.getElementById("productos-container");
    if (!contenedor) return;

    const texto = normalizarProductoTexto(document.getElementById("prod-search")?.value).toLowerCase();
    const productos = (catalogoProductos || []).filter(producto => {
        const nombre = (producto.nombre || "").toLowerCase();
        const codigo = (producto.codigo || "").toLowerCase();
        const categoria = (producto.categoria || "").toLowerCase();
        return !texto || nombre.includes(texto) || codigo.includes(texto) || categoria.includes(texto);
    });

    contenedor.innerHTML = "";

    if (productos.length === 0) {
        contenedor.innerHTML = `<p>No hay productos para mostrar.</p>`;
        return;
    }

    productos.forEach(producto => {
        const item = document.createElement("div");
        item.className = "producto-item";
        item.innerHTML = `
            <div class="producto__item-info">
                <p class="producto__item-nombre">${producto.nombre || "Sin nombre"}</p>
                <p class="producto__item-codigo">${producto.categoria || "Sin categoria"} ${producto.codigo ? "- " + producto.codigo : ""}</p>
            </div>
            <p class="producto__item-precio">${formatearCOP(producto.precio)}</p>
            <p class="producto__item-codigo">Stock: ${producto.seguimientoInventario === "si" ? producto.stock : "N/A"}</p>
            <div class="producto__item-acciones">
                <button class="btn-editar" type="button" data-id="${producto.id}" title="Editar producto">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn-eliminar-prod" type="button" data-id="${producto.id}" title="Eliminar producto">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        contenedor.appendChild(item);
    });

    contenedor.querySelectorAll(".btn-editar").forEach(btn => {
        btn.addEventListener("click", () => editarProducto(btn.dataset.id));
    });

    contenedor.querySelectorAll(".btn-eliminar-prod").forEach(btn => {
        btn.addEventListener("click", () => eliminarProducto(btn.dataset.id));
    });
}

document.addEventListener("DOMContentLoaded", () => {
    cerrarFormProducto();

    document.getElementById("btn-nuevo-producto")?.addEventListener("click", () => {
        limpiarFormProducto();
        abrirFormProducto();
    });

    document.getElementById("btn-cancelar-prod")?.addEventListener("click", limpiarFormProducto);
    document.getElementById("prod-search")?.addEventListener("input", ListarProductos);
});

window.ListarProductos = ListarProductos;
window.obtenerDatosFormularioProducto = obtenerDatosFormularioProducto;
window.limpiarFormProducto = limpiarFormProducto;
window.getProductoEditandoId = getProductoEditandoId;
