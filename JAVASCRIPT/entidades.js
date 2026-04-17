let listaClientes = [];
let listaProveedores = [];
let listaCategorias = [];

let clienteEditandoId = null;
let proveedorEditandoId = null;
let categoriaEditandoId = null;

function normalizarTexto(valor) {
    return (valor || "").toString().trim();
}

function abrirFormulario(id) {
    const form = document.getElementById(id);
    if (form) form.style.display = "flex";
}

function cerrarFormulario(id) {
    const form = document.getElementById(id);
    if (form) form.style.display = "none";
}

function actualizarTituloFormulario(id, texto) {
    const el = document.getElementById(id);
    if (el) el.textContent = texto;
}

function limpiarFormularioCliente() {
    const campos = ["cliente-nombre", "cliente-telefono", "cliente-correo"];
    campos.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
}

function limpiarFormularioProveedor() {
    const campos = ["prov-nombre", "prov-nit", "prov-telefono"];
    campos.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
}

function limpiarFormularioCategoria() {
    const nombre = document.getElementById("cat-nombre");
    const color = document.getElementById("cat-color");

    if (nombre) nombre.value = "";
    if (color) color.value = "#6d28d9";
}

function reiniciarEstadoCliente() {
    clienteEditandoId = null;
    limpiarFormularioCliente();
    actualizarTituloFormulario("cliente-form-title", "Nuevo Cliente");
}

function reiniciarEstadoProveedor() {
    proveedorEditandoId = null;
    limpiarFormularioProveedor();
    actualizarTituloFormulario("prov-form-title", "Nuevo Proveedor");
}

function reiniciarEstadoCategoria() {
    categoriaEditandoId = null;
    limpiarFormularioCategoria();
    actualizarTituloFormulario("cat-form-title", "Nueva Categoria");
}

function simplificarFormularioCategoria() {
    const iconoInput = document.getElementById("cat-icono");
    const grupoIcono = iconoInput?.closest(".form__group");
    if (grupoIcono) grupoIcono.remove();
}

function renderListaVacia(contenedorId, mensaje) {
    const contenedor = document.getElementById(contenedorId);
    if (contenedor) {
        contenedor.innerHTML = `<p style="color:var(--texto-suave);padding:1rem">${mensaje}</p>`;
    }
}

function poblarSelectClientesCobro() {
    const select = document.getElementById("cobro-cliente");
    if (!select) return;

    const valorActual = select.value;
    select.innerHTML = `<option value="">Selecciona un cliente</option>`;

    listaClientes.forEach(cliente => {
        const option = document.createElement("option");
        option.value = cliente.id || cliente.nombre;
        option.textContent = cliente.nombre || "Cliente sin nombre";
        select.appendChild(option);
    });

    if ([...select.options].some(opt => opt.value === valorActual)) {
        select.value = valorActual;
    }
}

function obtenerNombresCategorias() {
    const desdeHoja = listaCategorias
        .map(cat => normalizarTexto(cat.nombre))
        .filter(Boolean);

    if (desdeHoja.length > 0) {
        return [...new Set(desdeHoja)].sort((a, b) => a.localeCompare(b, "es"));
    }

    if (typeof catalogoProductos !== "undefined" && Array.isArray(catalogoProductos)) {
        return [...new Set(
            catalogoProductos
                .map(prod => normalizarTexto(prod.categoria))
                .filter(Boolean)
        )].sort((a, b) => a.localeCompare(b, "es"));
    }

    return [];
}

function sincronizarSelectsCategorias() {
    const categorias = obtenerNombresCategorias();
    const selects = [
        document.getElementById("prod-categoria"),
        document.getElementById("pos-category-filter")
    ];

    selects.forEach(select => {
        if (!select) return;

        const valorActual = select.value;
        const placeholder = select.id === "pos-category-filter"
            ? "Todas las categorias"
            : "Selecciona una categoria";

        select.innerHTML = `<option value="">${placeholder}</option>`;

        categorias.forEach(nombre => {
            const option = document.createElement("option");
            option.value = nombre;
            option.textContent = nombre;
            select.appendChild(option);
        });

        if ([...select.options].some(opt => opt.value === valorActual)) {
            select.value = valorActual;
        }
    });
}

function editarCliente(id) {
    const cliente = listaClientes.find(item => String(item.id) === String(id));
    if (!cliente) return;

    clienteEditandoId = cliente.id;
    document.getElementById("cliente-nombre").value = cliente.nombre || "";
    document.getElementById("cliente-telefono").value = cliente.telefono || "";
    document.getElementById("cliente-correo").value = cliente.email || "";
    actualizarTituloFormulario("cliente-form-title", "Editar Cliente");
    abrirFormulario("clientes-form");
}

function editarProveedor(id) {
    const proveedor = listaProveedores.find(item => String(item.id) === String(id));
    if (!proveedor) return;

    proveedorEditandoId = proveedor.id;
    document.getElementById("prov-nombre").value = proveedor.nombre || "";
    document.getElementById("prov-nit").value = proveedor.nit || "";
    document.getElementById("prov-telefono").value = proveedor.telefono || "";
    actualizarTituloFormulario("prov-form-title", "Editar Proveedor");
    abrirFormulario("proveedores-form");
}

function editarCategoria(id) {
    const categoria = listaCategorias.find(item => String(item.id) === String(id));
    if (!categoria) return;

    categoriaEditandoId = categoria.id;
    document.getElementById("cat-nombre").value = categoria.nombre || "";
    document.getElementById("cat-color").value = categoria.color || "#6d28d9";
    actualizarTituloFormulario("cat-form-title", "Editar Categoria");
    abrirFormulario("categorias-form");
}

function bindBotonesEntidad(contenedor, hoja, editarFn) {
    contenedor.querySelectorAll(".btn-editar").forEach(btn => {
        btn.addEventListener("click", () => editarFn(btn.dataset.id));
    });

    contenedor.querySelectorAll(".btn-eliminar").forEach(btn => {
        btn.addEventListener("click", () => confirmarEliminacion(btn.dataset.id, hoja));
    });
}

// --- CLIENTES ---
async function cargarYListarClientes() {
    const contenedor = document.getElementById("clientes-container");
    if (!contenedor) return;

    contenedor.innerHTML = "<p class='loading'>Cargando clientes...</p>";

    try {
        listaClientes = await getClientes();
        contenedor.innerHTML = "";

        if (listaClientes.length === 0) {
            renderListaVacia("clientes-container", "No hay clientes registrados.");
            poblarSelectClientesCobro();
            return;
        }

        listaClientes.forEach(cli => {
            const item = document.createElement("div");
            item.className = "producto-item";
            item.innerHTML = `
                <div class="producto__item-info">
                    <p class="producto__item-nombre">${cli.nombre || "Sin nombre"}</p>
                    <p class="producto__item-codigo">${cli.telefono || "Sin telefono"}</p>
                    <p style="font-size:0.8rem; color:#aaa;">${cli.email || "Sin correo"}</p>
                </div>
                <div class="producto__item-acciones">
                    <button class="btn-editar" type="button" data-id="${cli.id}" title="Editar cliente">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn-eliminar" type="button" data-id="${cli.id}" title="Eliminar cliente">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
            contenedor.appendChild(item);
        });

        bindBotonesEntidad(contenedor, "clientes", editarCliente);
        poblarSelectClientesCobro();
    } catch (error) {
        console.error(error);
        contenedor.innerHTML = "<p>Error al conectar con la base de datos.</p>";
    }
}

// --- PROVEEDORES ---
async function cargarYListarProveedores() {
    const contenedor = document.getElementById("proveedores-container");
    if (!contenedor) return;

    contenedor.innerHTML = "<p class='loading'>Cargando proveedores...</p>";

    try {
        listaProveedores = await getProveedores();
        contenedor.innerHTML = "";

        if (listaProveedores.length === 0) {
            renderListaVacia("proveedores-container", "No hay proveedores registrados.");
            return;
        }

        listaProveedores.forEach(prov => {
            const item = document.createElement("div");
            item.className = "producto-item";
            item.innerHTML = `
                <div class="producto__item-info">
                    <p class="producto__item-nombre">${prov.nombre || "Sin nombre"}</p>
                    <p class="producto__item-codigo">NIT: ${prov.nit || "Sin NIT"}</p>
                    <p style="font-size:0.8rem; color:#aaa;">${prov.telefono || "Sin telefono"}</p>
                </div>
                <div class="producto__item-acciones">
                    <button class="btn-editar" type="button" data-id="${prov.id}" title="Editar proveedor">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn-eliminar" type="button" data-id="${prov.id}" title="Eliminar proveedor">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
            contenedor.appendChild(item);
        });

        bindBotonesEntidad(contenedor, "proveedores", editarProveedor);
    } catch (error) {
        console.error(error);
        contenedor.innerHTML = "<p>Error al conectar con la base de datos.</p>";
    }
}

// --- CATEGORIAS ---
async function listarCategorias() {
    const contenedor = document.getElementById("categorias-container");
    if (!contenedor) return;

    contenedor.innerHTML = "<p class='loading'>Cargando categorias...</p>";

    try {
        listaCategorias = await getCategorias();
        contenedor.innerHTML = "";

        if (listaCategorias.length === 0) {
            renderListaVacia("categorias-container", "No hay categorias registradas.");
            sincronizarSelectsCategorias();
            return;
        }

        listaCategorias.forEach(cat => {
            const item = document.createElement("div");
            item.className = "producto-item";
            item.innerHTML = `
                <div class="producto__item-info" style="display:flex;align-items:center;gap:0.75rem">
                    <span class="cat-dot" style="background:${cat.color || "#6d28d9"}"></span>
                    <div>
                        <p class="producto__item-nombre">${cat.nombre || "Sin nombre"}</p>
                        <p class="producto__item-codigo">ID: ${cat.id || "Sin ID"}</p>
                    </div>
                </div>
                <div class="producto__item-acciones">
                    <button class="btn-editar" type="button" data-id="${cat.id}" title="Editar categoria">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn-eliminar" type="button" data-id="${cat.id}" title="Eliminar categoria">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
            contenedor.appendChild(item);
        });

        bindBotonesEntidad(contenedor, "categorias", editarCategoria);
        sincronizarSelectsCategorias();
    } catch (error) {
        console.error(error);
        contenedor.innerHTML = "<p>Error al conectar con la base de datos.</p>";
    }
}

async function guardarCliente() {
    const btn = document.getElementById("btn-guardar-cliente");
    const editandoId = clienteEditandoId;
    const nuevo = {
        id: editandoId || Date.now().toString(),
        nombre: normalizarTexto(document.getElementById("cliente-nombre")?.value),
        telefono: normalizarTexto(document.getElementById("cliente-telefono")?.value),
        email: normalizarTexto(document.getElementById("cliente-correo")?.value),
        debe: 0
    };

    if (!nuevo.nombre) {
        showToast("El nombre del cliente es obligatorio.", { type: "warning" });
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.textContent = "Guardando...";
    }

    try {
        if (editandoId) {
            await eliminarEntidad(editandoId, "clientes");
        }
        await postCliente(nuevo);
        showToast(editandoId ? "Cliente actualizado correctamente." : "Cliente guardado correctamente.", { type: "success" });
        reiniciarEstadoCliente();
        cerrarFormulario("clientes-form");
        await cargarYListarClientes();
    } catch (error) {
        console.error(error);
        showToast("No se pudo guardar el cliente.", { type: "error" });
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = "Guardar";
        }
    }
}

async function guardarProveedor() {
    const btn = document.getElementById("btn-guardar-prov");
    const editandoId = proveedorEditandoId;
    const nuevo = {
        id: editandoId || Date.now().toString(),
        nombre: normalizarTexto(document.getElementById("prov-nombre")?.value),
        nit: normalizarTexto(document.getElementById("prov-nit")?.value),
        telefono: normalizarTexto(document.getElementById("prov-telefono")?.value)
    };

    if (!nuevo.nombre || !nuevo.nit) {
        showToast("Nombre y NIT del proveedor son obligatorios.", { type: "warning" });
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.textContent = "Guardando...";
    }

    try {
        if (editandoId) {
            await eliminarEntidad(editandoId, "proveedores");
        }
        await postProveedor(nuevo);
        showToast(editandoId ? "Proveedor actualizado correctamente." : "Proveedor guardado correctamente.", { type: "success" });
        reiniciarEstadoProveedor();
        cerrarFormulario("proveedores-form");
        await cargarYListarProveedores();
    } catch (error) {
        console.error(error);
        showToast("No se pudo guardar el proveedor.", { type: "error" });
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = "Guardar";
        }
    }
}

async function guardarCategoria() {
    const btn = document.getElementById("btn-guardar-cat");
    const editandoId = categoriaEditandoId;
    const nueva = {
        id: editandoId || Date.now().toString(),
        nombre: normalizarTexto(document.getElementById("cat-nombre")?.value),
        color: normalizarTexto(document.getElementById("cat-color")?.value) || "#6d28d9"
    };

    if (!nueva.nombre) {
        showToast("El nombre de la categoria es obligatorio.", { type: "warning" });
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.textContent = "Guardando...";
    }

    try {
        if (editandoId) {
            await eliminarEntidad(editandoId, "categorias");
        }
        await postCategoria(nueva);
        showToast(editandoId ? "Categoria actualizada correctamente." : "Categoria guardada correctamente.", { type: "success" });
        reiniciarEstadoCategoria();
        cerrarFormulario("categorias-form");
        await listarCategorias();
    } catch (error) {
        console.error(error);
        showToast("No se pudo guardar la categoria.", { type: "error" });
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = "Guardar";
        }
    }
}

async function confirmarEliminacion(id, hoja) {
    if (!id) return;

    const ok = await showConfirmDialog("Se eliminara este registro.", {
        title: "Eliminar registro",
        confirmText: "Eliminar"
    });
    if (!ok) return;

    try {
        await eliminarEntidad(id, hoja);
        showToast("Registro eliminado correctamente.", { type: "success" });

        if (hoja === "clientes") {
            if (String(clienteEditandoId) === String(id)) reiniciarEstadoCliente();
            await cargarYListarClientes();
            return;
        }

        if (hoja === "proveedores") {
            if (String(proveedorEditandoId) === String(id)) reiniciarEstadoProveedor();
            await cargarYListarProveedores();
            return;
        }

        if (hoja === "categorias") {
            if (String(categoriaEditandoId) === String(id)) reiniciarEstadoCategoria();
            await listarCategorias();
        }
    } catch (error) {
        console.error(error);
        showToast("No se pudo eliminar el registro.", { type: "error" });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    simplificarFormularioCategoria();
    cerrarFormulario("clientes-form");
    cerrarFormulario("proveedores-form");
    cerrarFormulario("categorias-form");

    reiniciarEstadoCliente();
    reiniciarEstadoProveedor();
    reiniciarEstadoCategoria();

    document.getElementById("btn-nuevo-cliente")?.addEventListener("click", () => {
        reiniciarEstadoCliente();
        abrirFormulario("clientes-form");
    });
    document.getElementById("btn-cancelar-cliente")?.addEventListener("click", () => {
        reiniciarEstadoCliente();
        cerrarFormulario("clientes-form");
    });
    document.getElementById("btn-guardar-cliente")?.addEventListener("click", guardarCliente);

    document.getElementById("btn-nuevo-proveedor")?.addEventListener("click", () => {
        reiniciarEstadoProveedor();
        abrirFormulario("proveedores-form");
    });
    document.getElementById("btn-cancelar-prov")?.addEventListener("click", () => {
        reiniciarEstadoProveedor();
        cerrarFormulario("proveedores-form");
    });
    document.getElementById("btn-guardar-prov")?.addEventListener("click", guardarProveedor);

    document.getElementById("btn-nueva-categoria")?.addEventListener("click", () => {
        reiniciarEstadoCategoria();
        abrirFormulario("categorias-form");
    });
    document.getElementById("btn-cancelar-cat")?.addEventListener("click", () => {
        reiniciarEstadoCategoria();
        cerrarFormulario("categorias-form");
    });
    document.getElementById("btn-guardar-cat")?.addEventListener("click", guardarCategoria);

    cargarYListarClientes();
    cargarYListarProveedores();
    listarCategorias();
});

window.confirmarEliminacion = confirmarEliminacion;
window.listarCategorias = listarCategorias;
window.cargarYListarClientes = cargarYListarClientes;
window.cargarYListarProveedores = cargarYListarProveedores;
window.sincronizarSelectsCategorias = sincronizarSelectsCategorias;
