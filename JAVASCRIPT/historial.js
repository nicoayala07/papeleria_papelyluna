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
        hora: venta.hora || "",
        descuentoNombre: venta.descuentoNombre || null,
        descuentoValor: Number(venta.descuentoValor) || 0,
        descuentoTipo: venta.descuentoTipo || null
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

    const filtros = {
        metodoPago: document.getElementById("hist-filtro-metodo")?.value || "",
        desde: document.getElementById("hist-filtro-desde")?.value || "",
        hasta: document.getElementById("hist-filtro-hasta")?.value || ""
    };

    try {
        historialVentas = (await getVentasConFiltros(filtros)).map(normalizarVenta);
    } catch (error) {
        console.error(error);
        contenedor.innerHTML = "<p>Error al conectar con la base de datos.</p>";
        return;
    }

    contenedor.innerHTML = "";

    // Barra de filtros
    const filtrosHtml = document.createElement("div");
    filtrosHtml.className = "historial__filtros";
    filtrosHtml.style.cssText = "display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;";
    filtrosHtml.innerHTML = `
        <input type="date" id="hist-filtro-desde" class="filter-input" placeholder="Desde" value="${filtros.desde}" style="flex:1;min-width:120px;">
        <input type="date" id="hist-filtro-hasta" class="filter-input" placeholder="Hasta" value="${filtros.hasta}" style="flex:1;min-width:120px;">
        <select id="hist-filtro-metodo" class="filter-select" style="flex:1;min-width:120px;">
            <option value="">Todos los métodos</option>
            <option value="Efectivo" ${filtros.metodoPago === "Efectivo" ? "selected" : ""}>Efectivo</option>
            <option value="Nequi" ${filtros.metodoPago === "Nequi" ? "selected" : ""}>Nequi</option>
            <option value="Debe" ${filtros.metodoPago === "Debe" ? "selected" : ""}>Debe</option>
        </select>
        <button class="btn btn--success btn--sm" id="btn-aplicar-filtros-hist">
            <i class="fa-solid fa-magnifying-glass"></i> Filtrar
        </button>
        <button class="btn btn--ghost btn--sm" id="btn-limpiar-filtros-hist">
            Limpiar
        </button>
    `;
    contenedor.appendChild(filtrosHtml);

    document.getElementById("btn-aplicar-filtros-hist")?.addEventListener("click", renderHistorial);
    document.getElementById("btn-limpiar-filtros-hist")?.addEventListener("click", () => {
        document.getElementById("hist-filtro-desde").value = "";
        document.getElementById("hist-filtro-hasta").value = "";
        document.getElementById("hist-filtro-metodo").value = "";
        renderHistorial();
    });

    // Contador
    const header = document.createElement("div");
    header.classList.add("historial__topbar");
    header.innerHTML = `<p class="historial__count">${historialVentas.length} venta${historialVentas.length !== 1 ? "s" : ""} registrada${historialVentas.length !== 1 ? "s" : ""}</p>`;
    contenedor.appendChild(header);

    if (historialVentas.length === 0) {
        contenedor.innerHTML += `
            <div class="historial__empty">
                <i class="fa-solid fa-clock-rotate-left historial__empty-icon"></i>
                <p class="historial__empty-title">Sin ventas para los filtros aplicados</p>
                <p class="historial__empty-sub">Intenta cambiar el rango de fechas o el método de pago</p>
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
        const corregidaBadge = venta.corregida
            ? `<span style="font-size:0.7rem;color:#d97706;margin-left:4px;"><i class="fa-solid fa-pen"></i> Corregida</span>`
            : "";

        card.innerHTML = `
            <div class="historial__card-left">
                <span class="historial__numero">#${String(venta.numero || "").padStart(3, "0")}</span>
                <div class="historial__info">
                    <p class="historial__fecha">${fechaDisplay} ${corregidaBadge}</p>
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
            const ok = await showConfirmDialog("Se eliminará esta venta del historial.", {
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
    const subtotal = venta.productos.reduce((acc, p) => {
        return acc + (Number(p.precio) || 0) * (Number(p.cantidad) || 0);
    }, 0);
    const descuentoMonto = Math.max(0, subtotal - venta.total);

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
                ${venta.descuentoNombre ? `
                <div class="factura__fila">
                    <span>Subtotal</span>
                    <span>$${subtotal.toLocaleString("es-CO")}</span>
                </div>
                <div class="factura__fila">
                    <span>Descuento (${venta.descuentoNombre})</span>
                    <span>-$${descuentoMonto.toLocaleString("es-CO")}</span>
                </div>` : ""}
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
