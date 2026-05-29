let itemsCompra = [];

function generarIdCompra() {
    return "C-" + Date.now().toString().slice(-6);
}

function actualizarTotalCompra() {
    const total = itemsCompra.reduce((acc, item) => acc + item.costo * item.cantidad, 0);
    const el = document.getElementById("compra-total");
    if (el) el.textContent = "$" + total.toLocaleString("es-CO");
    return total;
}

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
                    <input type="number" class="compra__input-cant" data-idx="${idx}" value="${item.cantidad}" min="1">
                </div>
                <div class="compra__campo-grupo">
                    <label>Costo u.</label>
                    <input type="number" class="compra__input-costo" data-idx="${idx}" value="${item.costo}" min="0" placeholder="0">
                </div>
                <span class="compra__item-subtotal">$${(item.costo * item.cantidad).toLocaleString("es-CO")}</span>
                <button class="btn btn--danger btn--sm compra__item-eliminar" data-idx="${idx}" title="Quitar">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        `;
        contenedor.appendChild(fila);
    });

    contenedor.querySelectorAll(".compra__input-cant").forEach(input => {
        input.addEventListener("input", () => {
            const idx = parseInt(input.dataset.idx, 10);
            const val = parseInt(input.value, 10) || 1;
            itemsCompra[idx].cantidad = val < 1 ? 1 : val;
            renderItemsCompra();
        });
    });

    contenedor.querySelectorAll(".compra__input-costo").forEach(input => {
        input.addEventListener("input", () => {
            const idx = parseInt(input.dataset.idx, 10);
            itemsCompra[idx].costo = parseFloat(input.value) || 0;
            renderItemsCompra();
        });
    });

    contenedor.querySelectorAll(".compra__item-eliminar").forEach(btn => {
        btn.addEventListener("click", () => {
            const idx = parseInt(btn.dataset.idx, 10);
            itemsCompra.splice(idx, 1);
            renderItemsCompra();
        });
    });

    actualizarTotalCompra();
}

function iniciarBuscadorCompra() {
    const inputBuscar = document.getElementById("compra-prod-search");
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

    document.addEventListener("click", (e) => {
        if (!divResultados.contains(e.target) && e.target !== inputBuscar) {
            divResultados.innerHTML = "";
        }
    });
}

function agregarProductoACompra(producto) {
    const existente = itemsCompra.find(i => String(i.id) === String(producto.id));
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

async function cargarProveedores(seleccionarId = "") {
    await cargarProveedoresEnSelect();
    const select = document.getElementById("compra-proveedor");
    if (select && seleccionarId) select.value = String(seleccionarId);
}

function asegurarBotonProveedorRapido() {
    const select = document.getElementById("compra-proveedor");
    if (!select || document.getElementById("btn-nuevo-proveedor-compra")) return;

    const wrapper = document.createElement("div");
    wrapper.style.cssText = "display:flex;gap:8px;align-items:center;";
    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);
    select.style.flex = "1";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "btn-nuevo-proveedor-compra";
    btn.className = "btn btn--ghost btn--sm";
    btn.textContent = "+ Nuevo";
    btn.addEventListener("click", abrirModalProveedorCompra);
    wrapper.appendChild(btn);
}

function abrirModalProveedorCompra() {
    const modal = document.createElement("div");
    modal.className = "modal-admin modal--activo";
    modal.innerHTML = `
        <div class="modal-admin__content">
            <h3 style="margin-top:0;color:var(--texto);">Nuevo proveedor</h3>
            <div class="form__group">
                <label>Nombre</label>
                <input type="text" id="compra-prov-nombre" placeholder="Nombre del proveedor" required>
            </div>
            <div class="form__group">
                <label>NIT</label>
                <input type="text" id="compra-prov-nit" placeholder="NIT o documento">
            </div>
            <div class="form__group">
                <label>Telefono</label>
                <input type="text" id="compra-prov-telefono" placeholder="Numero de contacto">
            </div>
            <div class="form__actions">
                <button class="btn btn--secondary" id="btn-cancelar-prov-compra" type="button">Cancelar</button>
                <button class="btn btn--success" id="btn-guardar-prov-compra" type="button">Guardar</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const cerrar = () => modal.remove();
    modal.querySelector("#btn-cancelar-prov-compra")?.addEventListener("click", cerrar);
    modal.querySelector("#btn-guardar-prov-compra")?.addEventListener("click", async () => {
        const proveedor = {
            nombre: modal.querySelector("#compra-prov-nombre")?.value.trim(),
            nit: modal.querySelector("#compra-prov-nit")?.value.trim(),
            telefono: modal.querySelector("#compra-prov-telefono")?.value.trim()
        };

        if (!proveedor.nombre) {
            showToast("El nombre del proveedor es obligatorio.", { type: "warning" });
            return;
        }

        try {
            const creado = await postProveedor(proveedor);
            await cargarProveedores(creado?.id || creado?.nombre);
            cerrar();
            showToast("Proveedor creado correctamente.", { type: "success" });
        } catch (error) {
            console.error(error);
            showToast(error.message || "No se pudo crear el proveedor.", { type: "error" });
        }
    });
}

function abrirFormularioCompra() {
    itemsCompra = [];
    renderItemsCompra();

    const form = document.getElementById("compras-form");
    if (form) form.style.display = "flex";

    asegurarBotonProveedorRapido();
    cargarProveedores();

    const selectProv = document.getElementById("compra-proveedor");
    const selectPago = document.getElementById("compra-metodo-pago");
    const inputSearch = document.getElementById("compra-prod-search");
    if (selectProv) selectProv.value = "";
    if (selectPago) selectPago.value = "Efectivo";
    if (inputSearch) inputSearch.value = "";
}

function cerrarFormularioCompra() {
    const form = document.getElementById("compras-form");
    if (form) form.style.display = "none";
    itemsCompra = [];
}

async function registrarCompra() {
    const selectProv = document.getElementById("compra-proveedor");
    const proveedorId = selectProv?.value;
    const proveedorNombre = selectProv?.options[selectProv.selectedIndex]?.text || proveedorId;
    const metodoPago = document.getElementById("compra-metodo-pago")?.value;

    if (!proveedorId) {
        showToast("Selecciona un proveedor.", { type: "warning" });
        return;
    }
    if (!metodoPago) {
        showToast("Selecciona un metodo de pago.", { type: "warning" });
        return;
    }
    if (itemsCompra.length === 0) {
        showToast("Agrega al menos un producto a la compra.", { type: "warning" });
        return;
    }

    const total = actualizarTotalCompra();
    const compra = {
        id: generarIdCompra(),
        fecha: new Date().toLocaleString("es-CO"),
        proveedorId,
        proveedorNombre,
        metodoPago,
        total,
        itemsJson: JSON.stringify(itemsCompra)
    };

    try {
        await postCompra({
            ...compra,
            items: itemsCompra
        });
        await cargarProductosDesdeAPI();
    } catch (err) {
        console.error("Error guardando compra en MySQL:", err);
        showToast("No se pudo guardar la compra en MySQL.", { type: "error" });
        await cargarProductosDesdeAPI();
        return;
    }

    cerrarFormularioCompra();
    listarCompras();
    showToast(`Compra ${compra.id} registrada correctamente.`, { type: "success" });
}

async function listarCompras() {
    const contenedor = document.getElementById("compras-lista");
    if (!contenedor) return;
    contenedor.innerHTML = "<p class='loading'>Cargando compras...</p>";

    let historial = [];
    try {
        historial = await getCompras();
    } catch (error) {
        console.error(error);
        contenedor.innerHTML = "<p>Error al conectar con la base de datos.</p>";
        return;
    }

    contenedor.innerHTML = "";

    if (historial.length === 0) {
        contenedor.innerHTML = `
            <div class="historial__empty">
                <i class="fa-solid fa-truck historial__empty-icon"></i>
                <p class="historial__empty-title">Sin compras registradas</p>
                <p class="historial__empty-sub">Las compras apareceran aqui</p>
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
        const items = compra.itemsObj || compra.items || [];
        const badgeMetodo = {
            Efectivo: "btn--success",
            Nequi: "btn--outline",
            Consignacion: "btn--danger",
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

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn-nueva-compra")?.addEventListener("click", abrirFormularioCompra);
    document.getElementById("btn-cancelar-compra")?.addEventListener("click", cerrarFormularioCompra);
    document.getElementById("btn-guardar-compra")?.addEventListener("click", registrarCompra);
    iniciarBuscadorCompra();
    listarCompras();
});
