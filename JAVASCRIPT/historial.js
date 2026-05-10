let historialVentas = [];

function normalizarVenta(venta) {
    const productos = Array.isArray(venta.productos)
        ? venta.productos
        : (() => {
            try {
                const parsed = JSON.parse(venta.productos || venta.productosJson || "[]");
                return Array.isArray(parsed) ? parsed : [];
            } catch (error) {
                return [];
            }
        })();

    return {
        ...venta,
        productos,
        total: Number(venta.total) || 0,
        pagoCon: Number(venta.pagoCon) || 0,
        hora: venta.hora || ""
    };
}

async function eliminarVenta(ventaId) {
    try {
        await deleteVentaApi(ventaId);
        await renderHistorial();
        showToast("Venta eliminada del historial.", { type: "info" });
    } catch (error) {
        console.error(error);
        showToast("No se pudo eliminar la venta en MySQL.", { type: "error" });
    }
}

async function renderHistorial() {
    const contenedor = document.getElementById("historial-lista");
    if (!contenedor) return;

    contenedor.innerHTML = "<p class='loading'>Cargando ventas...</p>";

    try {
        historialVentas = (await getVentas()).map(normalizarVenta);
    } catch (error) {
        console.error(error);
        contenedor.innerHTML = "<p>Error al conectar con la base de datos.</p>";
        return;
    }

    contenedor.innerHTML = "";

    const header = document.createElement("div");
    header.classList.add("historial__topbar");
    header.innerHTML = `
        <p class="historial__count">${historialVentas.length} venta${historialVentas.length !== 1 ? "s" : ""} registrada${historialVentas.length !== 1 ? "s" : ""}</p>
    `;
    contenedor.appendChild(header);

    if (historialVentas.length === 0) {
        contenedor.innerHTML += `
            <div class="historial__empty">
                <i class="fa-solid fa-clock-rotate-left historial__empty-icon"></i>
                <p class="historial__empty-title">Sin ventas registradas</p>
                <p class="historial__empty-sub">Las ventas completadas apareceran aqui</p>
            </div>
        `;
        return;
    }

    historialVentas.forEach(venta => {
        const card = document.createElement("div");
        card.classList.add("historial__card");

        const badgeMetodo = {
            Efectivo: "btn--success",
            Nequi: "btn--outline",
            Debe: "btn--danger"
        }[venta.metodoPago] || "btn--outline";

        const fechaDisplay = `${venta.fecha || ""}${venta.hora ? " - " + venta.hora : ""}`;

        card.innerHTML = `
            <div class="historial__card-left">
                <span class="historial__numero">#${String(venta.numero || "").padStart(3, "0")}</span>
                <div class="historial__info">
                    <p class="historial__fecha">${fechaDisplay}</p>
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
        btn.addEventListener("click", async () => {
            const ok = await showConfirmDialog("Se eliminara esta venta del historial.", {
                title: "Eliminar venta",
                confirmText: "Eliminar"
            });
            if (ok) await eliminarVenta(btn.dataset.id);
        });
    });
}

function renderFacturaDesdeHistorial(ventaId) {
    const venta = historialVentas.find(v => String(v.id) === String(ventaId));
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
                    <img src="Logo.png" alt="Logo" class="factura__logo-img">
                    <span class="factura__logo-nombre">Papel y Luna</span>
                </div>
                <div class="factura__meta">
                    <p class="factura__numero">Venta #${String(venta.numero || "").padStart(3, "0")}</p>
                    <p class="factura__fecha">${venta.fecha || ""}${venta.hora ? " - " + venta.hora : ""}</p>
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
                            <td>$${Number(p.precio).toLocaleString("es-CO")}</td>
                            <td>${p.cantidad}</td>
                            <td>$${((Number(p.precio) || 0) * (Number(p.cantidad) || 0)).toLocaleString("es-CO")}</td>
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
                    <span>Metodo de pago</span>
                    <span>${venta.metodoPago}</span>
                </div>
                ${cambio !== null ? `<div class="factura__fila"><span>Cambio</span><span>$${cambio}</span></div>` : ""}
            </div>
        </div>
    `;
    navegarA("factura");
}
