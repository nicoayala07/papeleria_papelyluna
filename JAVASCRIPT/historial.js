const CLAVE_HISTORIAL = "papelyluna_historial";

function cargarHistorial() {
    return JSON.parse(localStorage.getItem(CLAVE_HISTORIAL) || "[]");
}

function guardarHistorial(historial) {
    localStorage.setItem(CLAVE_HISTORIAL, JSON.stringify(historial));
}

// Recibe el objeto venta ya armado desde ventas.js
function registrarVenta(venta) {
    const historial = cargarHistorial();
    const entrada = {
        id:         venta.id,
        numero:     historial.length + 1,
        fecha:      new Date().toLocaleDateString("es-CO", { year:"numeric", month:"long", day:"numeric" }),
        hora:       new Date().toLocaleTimeString("es-CO", { hour:"2-digit", minute:"2-digit" }),
        productos:  venta.productos,
        total:      venta.total,
        metodoPago: venta.metodoPago,
        clienteId:  venta.clienteId || ""
    };
    historial.unshift(entrada);
    guardarHistorial(historial);
}

function eliminarVenta(ventaId) {
    const historial = cargarHistorial();
    const nuevoHistorial = historial.filter(v => v.id !== ventaId);
    guardarHistorial(nuevoHistorial);
    renderHistorial();
    showToast("Venta eliminada del historial.", { type: "info" });
}

function renderHistorial() {
    const contenedor = document.getElementById("historial-lista");
    if (!contenedor) return;

    const historial = cargarHistorial();
    contenedor.innerHTML = "";

    const header = document.createElement("div");
    header.classList.add("historial__topbar");
    header.innerHTML = `
        <p class="historial__count">${historial.length} venta${historial.length !== 1 ? "s" : ""} registrada${historial.length !== 1 ? "s" : ""}</p>
    `;
    contenedor.appendChild(header);

    if (historial.length === 0) {
        contenedor.innerHTML += `
            <div class="historial__empty">
                <i class="fa-solid fa-clock-rotate-left historial__empty-icon"></i>
                <p class="historial__empty-title">Sin ventas registradas</p>
                <p class="historial__empty-sub">Las ventas completadas aparecerán aquí</p>
            </div>
        `;
        return;
    }

    historial.forEach(venta => {
        const card = document.createElement("div");
        card.classList.add("historial__card");

        const badgeMetodo = {
            "Efectivo": "btn--success",
            "Nequi":    "btn--outline",
            "Debe":     "btn--danger"
        }[venta.metodoPago] || "btn--outline";

        card.innerHTML = `
            <div class="historial__card-left">
                <span class="historial__numero">#${String(venta.numero).padStart(3, "0")}</span>
                <div class="historial__info">
                    <p class="historial__fecha">${venta.fecha} · ${venta.hora}</p>
                    <p class="historial__resumen">${venta.productos.length} producto${venta.productos.length !== 1 ? "s" : ""}</p>
                </div>
            </div>
            <div class="historial__card-right">
                <span class="btn btn--sm ${badgeMetodo}" style="pointer-events:none;font-size:0.7rem">${venta.metodoPago}</span>
                <span class="historial__total">$${venta.total.toLocaleString("es-CO")}</span>
                <div class="historial__acciones">
                    <button class="btn btn--outline btn--sm btn-ver-factura" data-id="${venta.id}" title="Ver comprobante">
                        <i class="fa-solid fa-receipt"></i>
                    </button>
                    <button class="btn btn--danger btn--sm btn-eliminar-venta" data-id="${venta.id}" title="Eliminar">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        contenedor.appendChild(card);
    });

    contenedor.querySelectorAll(".btn-ver-factura").forEach(btn => {
        btn.addEventListener("click", () => renderFacturaDesdeHistorial(btn.dataset.id));
    });

    contenedor.querySelectorAll(".btn-eliminar-venta").forEach(btn => {
        btn.addEventListener("click", () => {
            if (confirm("¿Eliminar esta venta del historial?")) eliminarVenta(btn.dataset.id);
        });
    });
}

function renderFacturaDesdeHistorial(ventaId) {
    const historial = cargarHistorial();
    const venta = historial.find(v => v.id === ventaId);
    if (!venta) return;

    const contenedor = document.getElementById("factura-contenido");
    if (!contenedor) return;

    const cambio = venta.metodoPago === "Efectivo" && venta.pagoCon
        ? (venta.pagoCon - venta.total).toLocaleString("es-CO")
        : null;

    contenedor.innerHTML = `
        <div class="factura">
            <div class="factura__header">
                <div class="factura__logo">
                    <img src="../img/Logo.png" alt="Logo" class="factura__logo-img">
                    <span class="factura__logo-nombre">Papel y Luna</span>
                </div>
                <div class="factura__meta">
                    <p class="factura__numero">Venta #${String(venta.numero).padStart(3, "0")}</p>
                    <p class="factura__fecha">${venta.fecha} · ${venta.hora}</p>
                </div>
            </div>
            <table class="factura__tabla">
                <thead>
                    <tr><th>Producto</th><th>Precio u.</th><th>Cant.</th><th>Subtotal</th></tr>
                </thead>
                <tbody>
                    ${venta.productos.map(p => `
                        <tr>
                            <td>${p.nombre}</td>
                            <td>$${p.precio.toLocaleString("es-CO")}</td>
                            <td>${p.cantidad}</td>
                            <td>$${(p.precio * p.cantidad).toLocaleString("es-CO")}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
            <div class="factura__totales">
                <div class="factura__fila factura__fila--total">
                    <span>Total</span>
                    <span>$${venta.total.toLocaleString("es-CO")}</span>
                </div>
                <div class="factura__fila">
                    <span>Método de pago</span>
                    <span>${venta.metodoPago}</span>
                </div>
                ${cambio !== null ? `<div class="factura__fila"><span>Cambio</span><span>$${cambio}</span></div>` : ""}
            </div>
        </div>
    `;
    navegarA("factura");
}
