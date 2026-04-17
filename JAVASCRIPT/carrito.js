// Estado de la venta activa
let ventaActiva = {
    id: generarId(),
    items: []
};

// Ventas guardadas (en espera) - se guardan en localStorage hasta migrar a API
let ventasGuardadas = JSON.parse(localStorage.getItem("pos_ventas_guardadas") || "[]");

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

function persistirVentasGuardadas() {
    localStorage.setItem("pos_ventas_guardadas", JSON.stringify(ventasGuardadas));
}

function sincronizarVentaActivaConCatalogo() {
    ventaActiva.items = sincronizarItemsConCatalogo(ventaActiva.items);
}

function sincronizarVentasGuardadasConCatalogo() {
    ventasGuardadas = ventasGuardadas.map(venta => ({
        ...venta,
        items: sincronizarItemsConCatalogo(venta.items || [])
    }));
    persistirVentasGuardadas();
}

function agregarAlCarrito(producto) {
    if (producto.seguimientoInventario === "si" && producto.stock <= 0) {
        showToast("Sin stock disponible.", { type: "warning" });
        return;
    }

    const existente = ventaActiva.items.find(i => i.id === producto.id);
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
    const item = ventaActiva.items.find(i => i.id === productoId);
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
    ventaActiva.items = ventaActiva.items.filter(i => i.id !== productoId);
    renderCarrito();
}

function vaciarCarrito() {
    ventaActiva.items = [];
    renderCarrito();
}

function obtenerCarrito() {
    return ventaActiva.items;
}

function calcularTotal() {
    return ventaActiva.items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
}

function guardarVentaActiva() {
    if (ventaActiva.items.length === 0) {
        showToast("La venta no tiene productos para guardar.", { type: "warning" });
        return;
    }
    const copia = JSON.parse(JSON.stringify(ventaActiva));
    ventasGuardadas.push(copia);
    persistirVentasGuardadas();
    ventaActiva = { id: generarId(), items: [] };
    renderCarrito();
    renderVentasGuardadas();
    showToast("Venta guardada en espera.", { type: "info" });
}

function retomarVentaGuardada(ventaId) {
    const idx = ventasGuardadas.findIndex(v => v.id === ventaId);
    if (idx === -1) return;

    if (ventaActiva.items.length > 0) {
        ventasGuardadas.push(JSON.parse(JSON.stringify(ventaActiva)));
    }

    ventaActiva = ventasGuardadas.splice(idx, 1)[0];
    sincronizarVentaActivaConCatalogo();
    persistirVentasGuardadas();
    renderCarrito();
    renderVentasGuardadas();
}

async function nuevaVenta() {
    if (ventaActiva.items.length > 0) {
        const ok = await showConfirmDialog("Se descartara la venta en curso.", {
            title: "Nueva venta",
            confirmText: "Descartar"
        });
        if (!ok) return;
    }

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

    const total = calcularTotal();
    if (totalEl) totalEl.textContent = "$" + total.toLocaleString("es-CO");
    if (btnCobrar) btnCobrar.disabled = ventaActiva.items.length === 0;

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
            cambiarCantidad(parseInt(btn.dataset.id), btn.dataset.op);
        });
    });

    contenedor.querySelectorAll(".pos__item-delete").forEach(btn => {
        btn.addEventListener("click", () => {
            eliminarDelCarrito(parseInt(btn.dataset.id));
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
        chip.textContent = `${v.id} · ${v.items.length} item(s)`;
        chip.addEventListener("click", () => retomarVentaGuardada(v.id));
        lista.appendChild(chip);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    renderCarrito();
    renderVentasGuardadas();

    document.getElementById("btn-nueva-venta")?.addEventListener("click", nuevaVenta);
    document.getElementById("btn-guardar-venta")?.addEventListener("click", guardarVentaActiva);
});
