// ── Estado de la compra en curso ──────────────────────────────
let itemsCompra = [];   // [{ id, nombre, cantidad, costo, seguimientoInventario }]

// ── Utilidad: generar ID de compra ────────────────────────────
function generarIdCompra() {
    return "C-" + Date.now().toString().slice(-6);
}

// ── Calcular y mostrar total de la compra ─────────────────────
function actualizarTotalCompra() {
    const total = itemsCompra.reduce((acc, item) => acc + item.costo * item.cantidad, 0);
    const el = document.getElementById("compra-total");
    if (el) el.textContent = "$" + total.toLocaleString("es-CO");
    return total;
}

// ── Renderizar tabla de ítems de la compra ─────────────────────
function renderItemsCompra() {
    const contenedor = document.getElementById("compra-items");
    if (!contenedor) return;
    contenedor.innerHTML = "";

    if (itemsCompra.length === 0) {
        contenedor.innerHTML = `<p class="compra__items-empty">Agrega productos a la compra</p>`;
        actualizarTotalCompra();
        return;
    }

    itemsCompra.forEach((item, idx) => {
        const fila = document.createElement("div");
        fila.classList.add("compra__item-fila");
        fila.innerHTML = `
            <span class="compra__item-nombre">${item.nombre}</span>
            <div class="compra__item-campos">
                <div class="compra__campo-grupo">
                    <label>Cant.</label>
                    <input
                        type="number"
                        class="compra__input-cant"
                        data-idx="${idx}"
                        value="${item.cantidad}"
                        min="1"
                    >
                </div>
                <div class="compra__campo-grupo">
                    <label>Costo u.</label>
                    <input
                        type="number"
                        class="compra__input-costo"
                        data-idx="${idx}"
                        value="${item.costo}"
                        min="0"
                        placeholder="0"
                    >
                </div>
                <span class="compra__item-subtotal">
                    $${(item.costo * item.cantidad).toLocaleString("es-CO")}
                </span>
                <button class="btn btn--danger btn--sm compra__item-eliminar" data-idx="${idx}" title="Quitar">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        `;
        contenedor.appendChild(fila);
    });

    // Listeners cantidad
    contenedor.querySelectorAll(".compra__input-cant").forEach(input => {
        input.addEventListener("input", () => {
            const idx = parseInt(input.dataset.idx);
            const val = parseInt(input.value) || 1;
            itemsCompra[idx].cantidad = val < 1 ? 1 : val;
            renderItemsCompra();
        });
    });

    // Listeners costo
    contenedor.querySelectorAll(".compra__input-costo").forEach(input => {
        input.addEventListener("input", () => {
            const idx = parseInt(input.dataset.idx);
            itemsCompra[idx].costo = parseFloat(input.value) || 0;
            renderItemsCompra();
        });
    });

    // Listeners eliminar
    contenedor.querySelectorAll(".compra__item-eliminar").forEach(btn => {
        btn.addEventListener("click", () => {
            const idx = parseInt(btn.dataset.idx);
            itemsCompra.splice(idx, 1);
            renderItemsCompra();
        });
    });

    actualizarTotalCompra();
}

// ── Buscador de productos del catálogo para la compra ─────────
function iniciarBuscadorCompra() {
    const inputBuscar   = document.getElementById("compra-prod-search");
    const divResultados = document.getElementById("compra-prod-resultados");

    if (!inputBuscar || !divResultados) return;

    inputBuscar.addEventListener("input", () => {
        const texto = inputBuscar.value.toLowerCase().trim();
        divResultados.innerHTML = "";

        if (!texto) return;

        const coincidencias = catalogoProductos.filter(p =>
            p.nombre.toLowerCase().includes(texto) ||
            (p.codigo || "").toLowerCase().includes(texto)
        );

        if (coincidencias.length === 0) {
            divResultados.innerHTML = `<p class="compra__sin-resultados">Sin resultados</p>`;
            return;
        }

        coincidencias.slice(0, 6).forEach(p => {
            const item = document.createElement("div");
            item.classList.add("compra__prod-item");
            item.innerHTML = `
                <span>${p.nombre}</span>
                <span class="compra__prod-meta">${p.categoria || ""}</span>
            `;
            item.addEventListener("click", () => {
                agregarProductoACompra(p);
                inputBuscar.value = "";
                divResultados.innerHTML = "";
            });
            divResultados.appendChild(item);
        });
    });

    // Cerrar resultados al hacer clic fuera
    document.addEventListener("click", (e) => {
        if (!divResultados.contains(e.target) && e.target !== inputBuscar) {
            divResultados.innerHTML = "";
        }
    });
}

function agregarProductoACompra(producto) {
    const existente = itemsCompra.find(i => i.id === producto.id);
    if (existente) {
        existente.cantidad += 1;
    } else {
        itemsCompra.push({
            id: producto.id,
            nombre: producto.nombre,
            cantidad: 1,
            costo: parseFloat(producto.costo) || 0,
            seguimientoInventario: producto.seguimientoInventario || "no"
        });
    }
    renderItemsCompra();
}

// ── Cargar proveedores en el select ───────────────────────────
async function cargarProveedoresEnSelect() {
    const select = document.getElementById("compra-proveedor");
    if (!select) return;

    select.innerHTML = `<option value="">Selecciona un proveedor</option>`;

    try {
        const proveedores = await getProveedores();
        if (Array.isArray(proveedores)) {
            proveedores.forEach(p => {
                const opt = document.createElement("option");
                opt.value = p.id || p.nombre;
                opt.textContent = p.nombre;
                select.appendChild(opt);
            });
        }
    } catch (err) {
        console.error("Error cargando proveedores:", err);
    }
}

// ── Abrir / cerrar formulario de nueva compra ─────────────────
function abrirFormularioCompra() {
    itemsCompra = [];
    renderItemsCompra();

    const form = document.getElementById("compras-form");
    if (form) form.style.display = "flex";

    cargarProveedoresEnSelect();

    // Resetear campos
    const selectProv  = document.getElementById("compra-proveedor");
    const selectPago  = document.getElementById("compra-metodo-pago");
    const inputSearch = document.getElementById("compra-prod-search");
    if (selectProv)  selectProv.value  = "";
    if (selectPago)  selectPago.value  = "Efectivo";
    if (inputSearch) inputSearch.value = "";
}

function cerrarFormularioCompra() {
    const form = document.getElementById("compras-form");
    if (form) form.style.display = "none";
    itemsCompra = [];
}

// ── Registrar compra: POST + actualizar stock ─────────────────
async function registrarCompra() {
    const selectProv     = document.getElementById("compra-proveedor");
    const proveedorId    = selectProv?.value;
    const proveedorNombre = selectProv?.options[selectProv.selectedIndex]?.text || proveedorId;
    const metodoPago     = document.getElementById("compra-metodo-pago")?.value;

    // Validaciones
    if (!proveedorId) {
        showToast("Selecciona un proveedor.", { type: "warning" });
        return;
    }
    if (!metodoPago) {
        showToast("Selecciona un método de pago.", { type: "warning" });
        return;
    }
    if (itemsCompra.length === 0) {
        showToast("Agrega al menos un producto a la compra.", { type: "warning" });
        return;
    }

    const total = actualizarTotalCompra();

    const compra = {
        id:              generarIdCompra(),
        fecha:           new Date().toLocaleString("es-CO"),
        proveedorId:     proveedorId,
        proveedorNombre: proveedorNombre,
        metodoPago:      metodoPago,
        total:           total,
        itemsJson:       JSON.stringify(itemsCompra)
    };
    // Guardar en localStorage como historial local
    const historialCompras = JSON.parse(localStorage.getItem("pos_compras") || "[]");
    historialCompras.unshift({
        ...compra,
        itemsObj: itemsCompra   // guardamos el objeto para poder renderizarlo
    });
    localStorage.setItem("pos_compras", JSON.stringify(historialCompras));

    // Actualizar stock en catálogo local (solo productos con seguimientoInventario = "si")
    itemsCompra.forEach(itemComprado => {
        const prod = catalogoProductos.find(p => p.id === itemComprado.id);
        if (prod && prod.seguimientoInventario === "si") {
            prod.stock = (parseInt(prod.stock) || 0) + itemComprado.cantidad;
        }
    });
    actualizarCatalogo(catalogoProductos);

    // Enviar a Google Sheets (POST asíncrono — no bloquea el flujo)
    try {
        await postCompra(compra);
    } catch (err) {
        console.error("Error enviando compra a Sheets:", err);
    }

    cerrarFormularioCompra();
    listarCompras();
    showToast(`Compra ${compra.id} registrada correctamente.`, { type: "success" });
}

// ── Historial de compras ──────────────────────────────────────
function listarCompras() {
    const contenedor = document.getElementById("compras-lista");
    if (!contenedor) return;
    contenedor.innerHTML = "";

    const historial = JSON.parse(localStorage.getItem("pos_compras") || "[]");

    if (historial.length === 0) {
        contenedor.innerHTML = `
            <div class="historial__empty">
                <i class="fa-solid fa-truck historial__empty-icon"></i>
                <p class="historial__empty-title">Sin compras registradas</p>
                <p class="historial__empty-sub">Las compras aparecerán aquí</p>
            </div>
        `;
        return;
    }

    const header = document.createElement("div");
    header.classList.add("historial__topbar");
    header.innerHTML = `
        <p class="historial__count">${historial.length} compra${historial.length !== 1 ? "s" : ""} registrada${historial.length !== 1 ? "s" : ""}</p>
    `;
    contenedor.appendChild(header);

    historial.forEach(compra => {
        const items = compra.itemsObj || [];

        const badgeMetodo = {
            "Efectivo":     "btn--success",
            "Nequi":        "btn--outline",
            "Consignación": "btn--danger"
        }[compra.metodoPago] || "btn--outline";

        const card = document.createElement("div");
        card.classList.add("historial__card");
        card.innerHTML = `
            <div class="historial__card-left">
                <span class="historial__numero">
                    <i class="fa-solid fa-truck" style="font-size:0.85rem"></i>
                </span>
                <div class="historial__info">
                    <p class="historial__fecha">${compra.fecha}</p>
                    <p class="historial__resumen">
                        Proveedor: ${compra.proveedorNombre || compra.proveedorId}
                        · ${items.length} producto${items.length !== 1 ? "s" : ""}
                    </p>
                </div>
            </div>
            <div class="historial__card-right">
                <span class="btn btn--sm ${badgeMetodo}" style="pointer-events:none;font-size:0.7rem">
                    ${compra.metodoPago}
                </span>
                <span class="historial__total">$${Number(compra.total).toLocaleString("es-CO")}</span>
            </div>
        `;
        contenedor.appendChild(card);
    });
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    // Botón "Nueva compra"
    document.getElementById("btn-nueva-compra")?.addEventListener("click", abrirFormularioCompra);

    // Botón "Cancelar"
    document.getElementById("btn-cancelar-compra")?.addEventListener("click", cerrarFormularioCompra);

    // Botón "Registrar compra"
    document.getElementById("btn-guardar-compra")?.addEventListener("click", registrarCompra);

    // Buscador de productos dentro del formulario
    iniciarBuscadorCompra();

    // Cargar historial al inicio
    listarCompras();
});
