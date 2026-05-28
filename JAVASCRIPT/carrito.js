let ventaActiva = {
    id: generarId(),
    items: []
};

let ventasGuardadas = [];
let descuentoActivo = null;

function generarId() {
    return "V-" + Date.now().toString().slice(-6);
}


function obtenerProductoCatalogo(productoId) {
    if (typeof catalogoProductos === "undefined" || !Array.isArray(catalogoProductos)) return null;
    return catalogoProductos.find(p => String(p.id) === String(productoId)) || null;
}

function sincronizarItemsConCatalogo(items = []) {
    return items.map(item => {
        const productoActual = obtenerProductoCatalogo(item.id);
        if (!productoActual) return item;

        return {
            ...item,
            nombre: productoActual.nombre,
            precio: Number(productoActual.precio) || 0
        };
    });
}

function sincronizarVentaActivaConCatalogo() {
    ventaActiva.items = sincronizarItemsConCatalogo(ventaActiva.items);
}

function sincronizarVentasGuardadasConCatalogo() {
    ventasGuardadas = ventasGuardadas.map(venta => ({
        ...venta,
        items: sincronizarItemsConCatalogo(venta.items || [])
    }));
}

async function cargarVentasGuardadasDesdeAPI() {
    try {
        const ventas = await getVentasPendientes();
        ventasGuardadas = ventas.map(venta => ({
            id: venta.id,
            items: venta.productos || []
        }));
        renderVentasGuardadas();
    } catch (error) {
        console.error("Error cargando ventas guardadas:", error);
        showToast("No se pudieron cargar las ventas guardadas desde MySQL.", { type: "error" });
    }
}

function agregarAlCarrito(producto) {
    if (producto.seguimientoInventario === "si" && producto.stock <= 0) {
        showToast("Sin stock disponible.", { type: "warning" });
        return;
    }

    const existente = ventaActiva.items.find(i => String(i.id) === String(producto.id));
    if (existente) {
        existente.cantidad += 1;
    } else {
        ventaActiva.items.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: 1
        });
    }
    renderCarrito();
}

function cambiarCantidad(productoId, operacion) {
    const item = ventaActiva.items.find(i => String(i.id) === String(productoId));
    if (!item) return;

    if (operacion === "aumentar") {
        item.cantidad += 1;
    } else if (operacion === "disminuir") {
        if (item.cantidad > 1) {
            item.cantidad -= 1;
        } else {
            eliminarDelCarrito(productoId);
            return;
        }
    }
    renderCarrito();
}

function eliminarDelCarrito(productoId) {
    ventaActiva.items = ventaActiva.items.filter(i => String(i.id) !== String(productoId));
    renderCarrito();
}

function obtenerCarrito() {
    return ventaActiva.items;
}

function calcularTotal() {
    const subtotal = ventaActiva.items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    if (!descuentoActivo) return subtotal;
    if (descuentoActivo.tipo === "porcentaje") {
        return Math.max(0, subtotal - subtotal * descuentoActivo.valor / 100);
    }
    return Math.max(0, subtotal - descuentoActivo.valor);
}

function calcularSubtotalSinDescuento() {
    return ventaActiva.items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
}

function aplicarDescuentoCarrito(descuento) {
    descuentoActivo = descuento;
    renderCarrito();
    showToast(`Descuento "${descuento.nombre}" aplicado.`, { type: "success" });
}

function quitarDescuentoCarrito() {
    descuentoActivo = null;
    renderCarrito();
    showToast("Descuento eliminado de la venta.", { type: "info" });
}

function limpiarDescuentoCarrito() {
    descuentoActivo = null;
}

function obtenerDescuentoActivo() {
    return descuentoActivo;
}

async function guardarVentaActiva() {
    if (ventaActiva.items.length === 0) {
        showToast("La venta no tiene productos para guardar.", { type: "warning" });
        return;
    }

    try {
        await postVentaPendiente({
            id: ventaActiva.id,
            items: JSON.parse(JSON.stringify(ventaActiva.items))
        });
        ventaActiva = { id: generarId(), items: [] };
        renderCarrito();
        await cargarVentasGuardadasDesdeAPI();
        showToast("Venta guardada en espera en MySQL.", { type: "info" });
    } catch (error) {
        console.error(error);
        showToast("No se pudo guardar la venta en espera en MySQL.", { type: "error" });
    }
}

async function retomarVentaGuardada(ventaId) {
    const ventaSeleccionada = ventasGuardadas.find(v => String(v.id) === String(ventaId));
    if (!ventaSeleccionada) return;

    try {
        if (ventaActiva.items.length > 0) {
            await postVentaPendiente({
                id: ventaActiva.id,
                items: JSON.parse(JSON.stringify(ventaActiva.items))
            });
        }

        await deleteVentaPendienteApi(ventaId);
        ventaActiva = {
            id: ventaSeleccionada.id,
            items: sincronizarItemsConCatalogo(ventaSeleccionada.items || [])
        };

        renderCarrito();
        await cargarVentasGuardadasDesdeAPI();
    } catch (error) {
        console.error(error);
        showToast("No se pudo retomar la venta guardada.", { type: "error" });
    }
}

async function nuevaVenta() {
    if (ventaActiva.items.length > 0) {
        const ok = await showConfirmDialog("Se descartara la venta en curso.", {
            title: "Nueva venta",
            confirmText: "Descartar"
        });
        if (!ok) return;
    }

    descuentoActivo = null;
    ventaActiva = { id: generarId(), items: [] };
    renderCarrito();
}

function renderCarrito() {
    const contenedor = document.getElementById("pos-carrito");
    const emptyMsg = document.getElementById("pos-carrito-empty");
    const totalEl = document.getElementById("pos-total");
    const btnCobrar = document.getElementById("btn-cobrar");
    const idDisplay = document.getElementById("venta-id-display");

    if (!contenedor) return;

    sincronizarVentaActivaConCatalogo();

    if (idDisplay) idDisplay.textContent = ventaActiva.id;

    contenedor.querySelectorAll(".pos__item").forEach(el => el.remove());

    const subtotal = calcularSubtotalSinDescuento();
    const total = calcularTotal();

    if (totalEl) totalEl.textContent = "$" + total.toLocaleString("es-CO");
    if (btnCobrar) btnCobrar.disabled = ventaActiva.items.length === 0;

    const descuentoRowId = "pos-descuento-row";
    let descRow = document.getElementById(descuentoRowId);
    if (descuentoActivo) {
        const ahorro = subtotal - total;
        if (!descRow) {
            descRow = document.createElement("div");
            descRow.id = descuentoRowId;
            descRow.style.cssText = "display:flex;justify-content:space-between;align-items:center;padding:4px 0;font-size:0.85rem;color:#16a34a;";
            totalEl?.parentElement?.insertBefore(descRow, totalEl);
        }
        descRow.innerHTML = `
            <span>Descuento: ${descuentoActivo.nombre}</span>
            <span style="display:flex;align-items:center;gap:6px;">
                -$${ahorro.toLocaleString("es-CO")}
                <button onclick="quitarDescuentoCarrito()" style="background:none;border:none;cursor:pointer;color:#dc2626;font-size:0.8rem;" title="Quitar descuento">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </span>
        `;
    } else if (descRow) {
        descRow.remove();
    }

    if (ventaActiva.items.length === 0) {
        if (emptyMsg) emptyMsg.style.display = "flex";
        return;
    }

    if (emptyMsg) emptyMsg.style.display = "none";

    ventaActiva.items.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        const div = document.createElement("div");
        div.classList.add("pos__item");
        div.innerHTML = `
            <div class="pos__item-info">
                <p class="pos__item-nombre">${item.nombre}</p>
                <p class="pos__item-precio">$${item.precio.toLocaleString("es-CO")} c/u</p>
            </div>
            <div class="pos__item-controles">
                <button class="pos__item-btn" data-id="${item.id}" data-op="disminuir">-</button>
                <span class="pos__item-cantidad">${item.cantidad}</span>
                <button class="pos__item-btn" data-id="${item.id}" data-op="aumentar">+</button>
            </div>
            <span class="pos__item-subtotal">$${subtotal.toLocaleString("es-CO")}</span>
            <button class="pos__item-delete" data-id="${item.id}" title="Quitar">x</button>
        `;
        contenedor.appendChild(div);
    });

    contenedor.querySelectorAll(".pos__item-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            cambiarCantidad(btn.dataset.id, btn.dataset.op);
        });
    });

    contenedor.querySelectorAll(".pos__item-delete").forEach(btn => {
        btn.addEventListener("click", () => {
            eliminarDelCarrito(btn.dataset.id);
        });
    });
}

function renderVentasGuardadas() {
    const banda = document.getElementById("pos-ventas-abiertas");
    const lista = document.getElementById("pos-abiertas-lista");
    if (!banda || !lista) return;

    sincronizarVentasGuardadasConCatalogo();

    if (ventasGuardadas.length === 0) {
        banda.style.display = "none";
        return;
    }

    banda.style.display = "flex";
    lista.innerHTML = "";
    ventasGuardadas.forEach(v => {
        const chip = document.createElement("button");
        chip.classList.add("pos__venta-guardada-chip");
        chip.textContent = `${v.id} - ${v.items.length} item(s)`;
        chip.addEventListener("click", () => retomarVentaGuardada(v.id));
        lista.appendChild(chip);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    renderCarrito();
    cargarVentasGuardadasDesdeAPI();

    document.getElementById("btn-nueva-venta")?.addEventListener("click", nuevaVenta);
    document.getElementById("btn-guardar-venta")?.addEventListener("click", guardarVentaActiva);
});

document.getElementById('btn-tile-descuento')?.addEventListener('click', async () => {
    const descuentos = await getDescuentos();

    if (descuentos.length === 0) {
        showToast('No hay descuentos registrados.', { type: 'warning' });
        return;
    }

    mostrarSelectorDescuento(descuentos);
});

document.getElementById('btn-seleccionar-descuento')?.addEventListener('click', async () => {
    const descuentos = await getDescuentos();

    if (descuentos.length === 0) {
        showToast('No hay descuentos registrados.', { type: 'warning' });
        return;
    }

    mostrarSelectorDescuento(descuentos);
});

function mostrarSelectorDescuento(descuentos) {
    document.getElementById('modal-desc-selector')?.remove();

    const modal = document.createElement('div');
    modal.id = 'modal-desc-selector';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999';

    const opciones = descuentos.map(d => {
        const val = d.tipo === 'porcentaje' ? `${d.valor}%` : `$${Number(d.valor).toLocaleString('es-CO')}`;
        return `
            <button class="modal-desc-selector__item" data-id="${d.id}">
                <span>${d.nombre}</span>
                <strong>${val}</strong>
            </button>
        `;
    }).join('');

    modal.innerHTML = `
        <div class="modal-desc-selector">
            <h3>Seleccionar descuento</h3>
            ${opciones}
            <button class="modal-desc-selector__cancelar" id="btn-cerrar-desc-selector">Cancelar</button>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelectorAll('[data-id]').forEach(btn => {
        btn.addEventListener('click', () => {
            const desc = descuentos.find(d => String(d.id) === btn.dataset.id);
            aplicarDescuentoCarrito(desc);
            modal.remove();
        });
    });

    document.getElementById('btn-cerrar-desc-selector')?.addEventListener('click', () => modal.remove());
}