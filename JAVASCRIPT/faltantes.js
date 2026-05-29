let faltantesCache = [];

function formatearFechaFaltante(valor) {
    if (!valor) return "";
    return new Date(valor).toLocaleString("es-CO");
}

function getFiltrosFaltantes() {
    return {
        estado: document.getElementById("faltantes-filtro-estado")?.value || "",
        tipo: document.getElementById("faltantes-filtro-tipo")?.value || ""
    };
}

function limpiarFormFaltante() {
    ["faltante-nombre", "faltante-cantidad", "faltante-observacion"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
    const tipo = document.getElementById("faltante-tipo");
    if (tipo) tipo.value = "agotado";
}

async function guardarFaltante() {
    const nombreProducto = document.getElementById("faltante-nombre")?.value.trim();
    const tipo = document.getElementById("faltante-tipo")?.value;
    const cantidad = Number.parseInt(document.getElementById("faltante-cantidad")?.value, 10);
    const observacion = document.getElementById("faltante-observacion")?.value.trim();
    const btn = document.getElementById("btn-guardar-faltante");

    if (!nombreProducto || !tipo) {
        showToast("Nombre del producto y tipo son requeridos.", { type: "warning" });
        return;
    }

    try {
        if (btn) btn.disabled = true;
        await postFaltante({
            nombreProducto,
            tipo,
            cantidad: Number.isFinite(cantidad) && cantidad > 0 ? cantidad : null,
            observacion
        });
        limpiarFormFaltante();
        await renderFaltantes();
        showToast("Faltante registrado.", { type: "success" });
    } catch (error) {
        console.error(error);
        showToast(error.message || "No se pudo registrar el faltante.", { type: "error" });
    } finally {
        if (btn) btn.disabled = false;
    }
}

async function cambiarEstadoFaltante(id, estado) {
    try {
        await patchFaltanteEstado(id, estado);
        await renderFaltantes();
        showToast("Estado actualizado.", { type: "success" });
    } catch (error) {
        console.error(error);
        showToast(error.message || "No se pudo actualizar el faltante.", { type: "error" });
    }
}

async function eliminarFaltante(id) {
    const ok = await showConfirmDialog("Se eliminara este faltante.", {
        title: "Eliminar faltante",
        confirmText: "Eliminar"
    });
    if (!ok) return;

    try {
        await deleteFaltanteApi(id);
        await renderFaltantes();
        showToast("Faltante eliminado.", { type: "info" });
    } catch (error) {
        console.error(error);
        showToast(error.message || "No se pudo eliminar el faltante.", { type: "error" });
    }
}

async function cargarCategoriasFaltanteOptions() {
    try {
        const categorias = await getCategorias();
        return (Array.isArray(categorias) ? categorias : []).map(categoria => {
            const nombre = categoria.nombre || categoria;
            return `<option value="${nombre}">${nombre}</option>`;
        }).join("");
    } catch (error) {
        console.error("Error cargando categorias:", error);
        return "";
    }
}

async function abrirModalCrearProductoFaltante(id) {
    const faltante = faltantesCache.find(item => String(item.id) === String(id));
    if (!faltante) return;

    const categoriasOptions = await cargarCategoriasFaltanteOptions();
    const modal = document.createElement("div");
    modal.className = "modal-admin modal--activo";
    modal.innerHTML = `
        <div class="modal-admin__content">
            <h3 style="margin-top:0;color:var(--texto);">Crear producto</h3>
            <div class="form__group">
                <label>Nombre</label>
                <input type="text" id="faltante-prod-nombre" value="${faltante.nombreProducto || ""}" placeholder="Nombre del producto">
            </div>
            <div class="form__group form__group--row">
                <div>
                    <label>Precio</label>
                    <input type="number" id="faltante-prod-precio" min="1" placeholder="0" required>
                </div>
                <div>
                    <label>Costo</label>
                    <input type="number" id="faltante-prod-costo" min="0" placeholder="0">
                </div>
            </div>
            <div class="form__group">
                <label>Categoria</label>
                <select id="faltante-prod-categoria" class="filter-select">
                    <option value="">Selecciona una categoria</option>
                    ${categoriasOptions}
                </select>
            </div>
            <div class="form__group">
                <label>Seguimiento de inventario</label>
                <select id="faltante-prod-seguimiento" class="filter-select">
                    <option value="si">Si</option>
                    <option value="no">No</option>
                </select>
            </div>
            <div class="form__actions">
                <button class="btn btn--secondary" id="btn-cancelar-prod-faltante" type="button">Cancelar</button>
                <button class="btn btn--success" id="btn-guardar-prod-faltante" type="button">Guardar</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const cerrar = () => modal.remove();
    modal.querySelector("#btn-cancelar-prod-faltante")?.addEventListener("click", cerrar);
    modal.querySelector("#btn-guardar-prod-faltante")?.addEventListener("click", async () => {
        const producto = {
            nombre: modal.querySelector("#faltante-prod-nombre")?.value.trim(),
            precio: Number(modal.querySelector("#faltante-prod-precio")?.value) || 0,
            costo: Number(modal.querySelector("#faltante-prod-costo")?.value) || 0,
            categoria: modal.querySelector("#faltante-prod-categoria")?.value || "",
            seguimientoInventario: modal.querySelector("#faltante-prod-seguimiento")?.value || "si",
            stock: 0
        };

        if (!producto.nombre || producto.precio <= 0) {
            showToast("Nombre y precio mayor a 0 son obligatorios.", { type: "warning" });
            return;
        }

        try {
            await postProducto(producto);
            showToast("Producto creado correctamente.", { type: "success" });
            await patchFaltanteEstado(faltante.id, "resuelto");
            cerrar();
            await cargarProductosDesdeAPI();
            await renderFaltantes();
        } catch (error) {
            console.error(error);
            showToast(error.message || "No se pudo crear el producto.", { type: "error" });
        }
    });
}

function renderResumenFaltantes() {
    const resumen = document.getElementById("faltantes-resumen");
    if (!resumen) return;

    const pendientes = faltantesCache.filter(f => f.estado === "pendiente").length;
    const resueltos = faltantesCache.filter(f => f.estado === "resuelto").length;
    const descartados = faltantesCache.filter(f => f.estado === "descartado").length;

    resumen.innerHTML = `
        <div class="reporte-card"><span>Total</span><strong>${faltantesCache.length}</strong></div>
        <div class="reporte-card"><span>Pendientes</span><strong>${pendientes}</strong></div>
        <div class="reporte-card"><span>Resueltos</span><strong>${resueltos}</strong></div>
        <div class="reporte-card"><span>Descartados</span><strong>${descartados}</strong></div>
    `;
}

async function renderFaltantes() {
    const contenedor = document.getElementById("faltantes-lista");
    if (!contenedor) return;

    contenedor.innerHTML = "<p class='loading'>Cargando faltantes...</p>";

    try {
        faltantesCache = await getFaltantes(getFiltrosFaltantes());
    } catch (error) {
        console.error(error);
        contenedor.innerHTML = "<p>Error al conectar con la base de datos.</p>";
        return;
    }

    renderResumenFaltantes();
    contenedor.innerHTML = "";

    if (faltantesCache.length === 0) {
        contenedor.innerHTML = `
            <div class="historial__empty">
                <i class="fa-solid fa-clipboard-list historial__empty-icon"></i>
                <p class="historial__empty-title">Sin faltantes</p>
                <p class="historial__empty-sub">Los productos agotados o no registrados apareceran aqui</p>
            </div>
        `;
        return;
    }

    faltantesCache.forEach(faltante => {
        const card = document.createElement("div");
        card.className = "faltante-card";
        const puedeCrearProducto = faltante.tipo === "no_registrado" && faltante.estado === "pendiente";
        card.innerHTML = `
            <div class="faltante-card__info">
                <span class="faltante-card__tipo">${faltante.tipo === "agotado" ? "Agotado" : "No registrado"}</span>
                <h3>${faltante.nombreProducto}</h3>
                <p>${faltante.observacion || "Sin observacion"} ${faltante.cantidad ? "- Cant. " + faltante.cantidad : ""}</p>
                <small>${formatearFechaFaltante(faltante.createdAt)}</small>
            </div>
            <div class="faltante-card__acciones">
                <select class="faltante-estado" data-id="${faltante.id}">
                    <option value="pendiente" ${faltante.estado === "pendiente" ? "selected" : ""}>Pendiente</option>
                    <option value="resuelto" ${faltante.estado === "resuelto" ? "selected" : ""}>Resuelto</option>
                    <option value="descartado" ${faltante.estado === "descartado" ? "selected" : ""}>Descartado</option>
                </select>
                ${puedeCrearProducto ? `
                    <button class="btn btn--ghost btn--sm btn-crear-producto-faltante" data-id="${faltante.id}" type="button">
                        + Crear producto
                    </button>
                ` : ""}
                <button class="btn btn--danger btn--sm btn-eliminar-faltante" data-id="${faltante.id}" title="Eliminar">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        contenedor.appendChild(card);
    });

    contenedor.querySelectorAll(".faltante-estado").forEach(select => {
        select.addEventListener("change", () => cambiarEstadoFaltante(select.dataset.id, select.value));
    });
    contenedor.querySelectorAll(".btn-eliminar-faltante").forEach(btn => {
        btn.addEventListener("click", () => eliminarFaltante(btn.dataset.id));
    });
    contenedor.querySelectorAll(".btn-crear-producto-faltante").forEach(btn => {
        btn.addEventListener("click", () => abrirModalCrearProductoFaltante(btn.dataset.id));
    });
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn-guardar-faltante")?.addEventListener("click", guardarFaltante);
    document.getElementById("btn-limpiar-faltante")?.addEventListener("click", limpiarFormFaltante);
    document.getElementById("faltantes-filtro-estado")?.addEventListener("change", renderFaltantes);
    document.getElementById("faltantes-filtro-tipo")?.addEventListener("change", renderFaltantes);
});
