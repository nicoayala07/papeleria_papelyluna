let listaDescuentos = [];
let descuentoEditandoId = null;

// ── CRUD ──────────────────────────────────────────────

async function cargarDescuentos() {
    const contenedor = document.getElementById("descuentos-container");
    if (!contenedor) return;

    contenedor.innerHTML = "<p class='loading'>Cargando descuentos...</p>";

    try {
        listaDescuentos = await getDescuentos();
        renderDescuentos();
    } catch (error) {
        console.error(error);
        contenedor.innerHTML = "<p>Error al conectar con la base de datos.</p>";
    }
}

function renderDescuentos() {
    const contenedor = document.getElementById("descuentos-container");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (listaDescuentos.length === 0) {
        contenedor.innerHTML = "<p style='color:var(--texto-suave);padding:1rem'>No hay descuentos registrados.</p>";
        return;
    }

    listaDescuentos.forEach(desc => {
        const item = document.createElement("div");
        item.className = "producto-item";
        const valorDisplay = desc.tipo === "porcentaje"
            ? `${desc.valor}%`
            : `$${Number(desc.valor).toLocaleString("es-CO")}`;

        item.innerHTML = `
            <div class="producto__item-info">
                <p class="producto__item-nombre">${desc.nombre}</p>
                <p class="producto__item-codigo">${desc.tipo === "porcentaje" ? "Porcentaje" : "Valor fijo"} · ${valorDisplay}</p>
        </div>
            <div class="producto__item-acciones">
                <button class="btn-editar" type="button" data-id="${desc.id}" title="Editar">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn-eliminar-desc" type="button" data-id="${desc.id}" title="Eliminar">
                <i class="fa-solid fa-trash"></i>
                </button>                
            </button>
        </div>
        `;
        contenedor.appendChild(item);
    });

    contenedor.querySelectorAll(".btn-editar").forEach(btn => {
        btn.addEventListener("click", () => editarDescuento(btn.dataset.id));
    });

    contenedor.querySelectorAll(".btn-eliminar-desc").forEach(btn => {
        btn.addEventListener("click", () => eliminarDescuento(btn.dataset.id));
    });
}

function editarDescuento(id) {
    const desc = listaDescuentos.find(d => String(d.id) === String(id));
    if (!desc) return;

    descuentoEditandoId = desc.id;
    document.getElementById("desc-nombre").value = desc.nombre || "";
    document.getElementById("desc-tipo").value = desc.tipo || "porcentaje";
    document.getElementById("desc-valor").value = desc.valor ?? "";

    document.getElementById("desc-form-title").textContent = "Editar Descuento";
    document.getElementById("descuentos-form").style.display = "flex";
}

function reiniciarFormDescuento() {
    descuentoEditandoId = null;
    document.getElementById("desc-nombre").value = "";
    document.getElementById("desc-tipo").value = "porcentaje";
    document.getElementById("desc-valor").value = "";
    document.getElementById("desc-form-title").textContent = "Nuevo Descuento";
}

async function guardarDescuento() {
    const nombre = document.getElementById("desc-nombre").value.trim();
    const tipo = document.getElementById("desc-tipo").value;
    const valor = parseFloat(document.getElementById("desc-valor").value);

    if (!nombre) {
        showToast("El nombre es obligatorio.", { type: "warning" });
        return;
    }
    if (!tipo) {
        showToast("Selecciona un tipo.", { type: "warning" });
        return;
    }
    if (isNaN(valor) || valor < 0) {
        showToast("El valor debe ser un número positivo.", { type: "warning" });
        return;
    }
    if (tipo === "porcentaje" && valor > 100) {
        showToast("El porcentaje no puede ser mayor a 100.", { type: "warning" });
        return;
    }

    const btn = document.getElementById("btn-guardar-desc");
    if (btn) { btn.disabled = true; btn.textContent = "Guardando..."; }

    try {
        if (descuentoEditandoId) {
            await putDescuento(descuentoEditandoId, { nombre, tipo, valor });
            showToast("Descuento actualizado correctamente.", { type: "success" });
        } else {
            await postDescuento({ nombre, tipo, valor });
            showToast("Descuento creado correctamente.", { type: "success" });
        }
        reiniciarFormDescuento();
        document.getElementById("descuentos-form").style.display = "none";
        await cargarDescuentos();
    } catch (error) {
        console.error(error);
        showToast("No se pudo guardar el descuento.", { type: "error" });
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = "Guardar"; }
    }
}

async function eliminarDescuento(id) {
    const ok = await showConfirmDialog("Se eliminará este descuento.", {
        title: "Eliminar descuento",
        confirmText: "Eliminar"
    });
    if (!ok) return;

    try {
        await deleteDescuento(id);
        showToast("Descuento eliminado.", { type: "success" });
        if (String(descuentoEditandoId) === String(id)) reiniciarFormDescuento();
        await cargarDescuentos();
    } catch (error) {
        console.error(error);
        showToast("No se pudo eliminar el descuento.", { type: "error" });
    }
}

// ── INICIALIZACIÓN ────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("descuentos-form").style.display = "none";

    document.getElementById("btn-nuevo-desc")?.addEventListener("click", () => {
        reiniciarFormDescuento();
        document.getElementById("descuentos-form").style.display = "flex";
    });

    document.getElementById("btn-cancelar-desc")?.addEventListener("click", () => {
        reiniciarFormDescuento();
        document.getElementById("descuentos-form").style.display = "none";
    });

    document.getElementById("btn-guardar-desc")?.addEventListener("click", guardarDescuento);
});

window.cargarDescuentos = cargarDescuentos;