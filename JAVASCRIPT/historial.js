// //JAVASCRIPT/historial.js 
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
        descuentoTipo: venta.descuentoTipo || null,
        estado: venta.estado || "activa" // Soporte para estados de Persona 3
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

        // Renderizado del badge de estado dinámico (Activa, Corregida, Reembolsada)
        const estadoVenta = venta.estado ? venta.estado.toLowerCase() : "activa";

        card.innerHTML = `
            <div class="historial__card-left">
                <span class="historial__numero">#${String(venta.numero || "").padStart(3, "0")}</span>
                <div class="historial__info">
                    <span class="factura__estado-badge badge--${estadoVenta}">${estadoVenta}</span>
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
                    <button class="btn btn--outline btn--sm btn-corregir-venta" data-id="${venta.id}" title="Corregir cantidades o precios">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn btn--outline btn--sm btn-reembolsar-venta" data-id="${venta.id}" title="Procesar reembolso / devolución">
                        <i class="fa-solid fa-arrow-rotate-left"></i>
                    </button>
                    <button class="btn btn--danger btn--sm btn-eliminar-venta" data-id="${venta.id}" title="Eliminar del sistema">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        contenedor.appendChild(card);
    });

    // Escuchadores de eventos para acciones estándar
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

    // ASIGNACIÓN DE CLICS PARA TUS MODALES ADMINISTRATIVOS (Persona 3)
    contenedor.querySelectorAll(".btn-corregir-venta").forEach(btn => {
        btn.addEventListener("click", () => abrirModalCorregir(btn.dataset.id));
    });

    contenedor.querySelectorAll(".btn-reembolsar-venta").forEach(btn => {
        btn.addEventListener("click", () => abrirModalReembolso(btn.dataset.id));
    });
}

async function renderFacturaDesdeHistorial(ventaId) {
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
    const config = typeof obtenerConfiguracionFactura === "function"
        ? await obtenerConfiguracionFactura()
        : {};
    const nombreNegocio = config.nombreNegocio || "Papel y Luna";
    const logoUrl = config.logoUrl || "Logo.png";
    const datosNegocio = [
        config.nit ? `NIT: ${config.nit}` : "",
        config.direccion || "",
        config.telefono ? `Tel: ${config.telefono}` : ""
    ].filter(Boolean);

    contenedor.innerHTML = `
        <div class="factura">
            <div class="factura__header">
                <div class="factura__logo">
                    <img src="${logoUrl}" alt="Logo" class="factura__logo-img">
                    <div>
                        <span class="factura__logo-nombre">${nombreNegocio}</span>
                        ${datosNegocio.map(dato => `<p class="factura__fecha">${dato}</p>`).join("")}
                    </div>
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


// ==========================================================================
// OPERACIONES INTERACTIVAS DE LOS MODALES ADMINISTRATIVOS (Persona 3)
// ==========================================================================

/**
 * Abre el modal para corregir precios o cantidades de una venta seleccionada
 */
function abrirModalCorregir(ventaId) {
    const venta = historialVentas.find(v => String(v.id) === String(ventaId));
    if (!venta) return;

    // Crear el overlay del modal dinámicamente
    const modal = document.createElement("div");
    modal.className = "modal-admin modal--activo";
    modal.id = "modal-corregir-dinamico";

    modal.innerHTML = `
        <div class="modal-admin__content">
            <h3 style="margin-top:0; color:var(--texto); font-family:'Playfair Display';">Corregir Venta #${String(venta.numero || "").padStart(3, "0")}</h3>
            <p style="font-size:0.85rem; color:var(--texto-suave); margin-top:-8px;">Modifica los campos necesarios. Se recalcularán los totales automáticamente.</p>
            
            <div style="max-height: 250px; overflow-y: auto;">
                <table class="modal-admin__table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Precio Unitario</th>
                            <th>Cantidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${venta.productos.map((prod, index) => `
                            <tr class="fila-producto-modificar" data-index="${index}">
                                <td><span style="font-weight:500;">${prod.nombre}</span></td>
                                <td>
                                    <input type="number" class="input-admin-sm input-corr-precio" 
                                           value="${prod.precio}" style="width:90px;" min="0">
                                </td>
                                <td>
                                    <input type="number" class="input-admin-sm input-corr-cantidad" 
                                           value="${prod.cantidad}" style="width:70px;" min="1">
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>

            <div style="display:flex; justify-content: flex-end; gap:8px; margin-top:8px;">
                <button class="btn btn--ghost btn--sm" id="btn-cerrar-corr">Cancelar</button>
                <button class="btn btn--success btn--sm" id="btn-guardar-corr">
                    <i class="fa-solid fa-floppy-disk"></i> Guardar Corrección
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Eventos de cierre
    const cerrarModal = () => modal.remove();
    document.getElementById("btn-cerrar-corr").addEventListener("click", cerrarModal);

    // Guardar cambios procesados
    document.getElementById("btn-guardar-corr").addEventListener("click", async () => {
        const filas = modal.querySelectorAll(".fila-producto-modificar");
        let nuevoTotal = 0;
        const productosActualizados = [];

        filas.forEach(filas => {
            const idx = filas.dataset.index;
            const precioInput = Number(filas.querySelector(".input-corr-precio").value) || 0;
            const cantInput = Number(filas.querySelector(".input-corr-cantidad").value) || 0;

            nuevoTotal += (precioInput * cantInput);
            productosActualizados.push({
                ...venta.productos[idx],
                precio: precioInput,
                cantidad: cantInput
            });
        });

        // Aplicar descuento proporcional si existía originalmente
        if (venta.descuentoValor && venta.descuentoTipo === "fijo") {
            nuevoTotal = Math.max(0, nuevoTotal - venta.descuentoValor);
        }

        const payload = {
            productos: productosActualizados,
            total: nuevoTotal,
            corregidaPor: obtenerUsuarioActual()?.username || 'usuario'
        };
        try {
            await corregirVentaApi(venta.id, payload);
            showToast("Venta corregida con éxito. Stocks actualizados.", { type: "success" });
            cerrarModal();
            await renderHistorial();
            showToast("Reembolso ejecutado correctamente.", { type: "success" });
        } catch (error) {
            console.error(error);
            showToast("Error al procesar la corrección en el servidor.", { type: "error" });
        }
    });
}

/**
 * Abre el modal para procesar devoluciones o reembolsos reingresando productos al stock
 */
function abrirModalReembolso(ventaId) {
    const venta = historialVentas.find(v => String(v.id) === String(ventaId));
    if (!venta) return;

    if (venta.estado === "reembolsada") {
        showToast("Esta venta ya ha sido reembolsada en su totalidad.", { type: "warning" });
        return;
    }

    const modal = document.createElement("div");
    modal.className = "modal-admin modal--activo";
    modal.id = "modal-reembolso-dinamico";

    modal.innerHTML = `
        <div class="modal-admin__content">
            <h3 style="margin-top:0; color:var(--texto); font-family:'Playfair Display';">Procesar Reembolso #${String(venta.numero || "").padStart(3, "0")}</h3>
            <p style="font-size:0.85rem; color:var(--texto-suave); margin-top:-8px;">Establece las unidades que devuelve el cliente. Estas regresarán al inventario.</p>
            
            <div style="max-height: 250px; overflow-y: auto;">
                <table class="modal-admin__table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Comprados</th>
                            <th>A Devolver</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${venta.productos.map((prod, index) => `
                            <tr class="fila-producto-reembolso" data-index="${index}">
                                <td><span style="font-weight:500;">${prod.nombre}</span></td>
                                <td style="text-align:center;"><span class="badge" style="background:#EFEFEF; padding:2px 6px; border-radius:4px;">${prod.cantidad} u.</span></td>
                                <td>
                                    <input type="number" class="input-admin-sm input-reemb-cant" 
                                           value="0" min="0" max="${prod.cantidad}" style="width:70px;">
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>

            <div style="display:flex; justify-content: flex-end; gap:8px; margin-top:8px;">
                <button class="btn btn--ghost btn--sm" id="btn-cerrar-reemb">Cancelar</button>
                <button class="btn btn--danger btn--sm" id="btn-ejecutar-reemb">
                    <i class="fa-solid fa-arrow-rotate-left"></i> Aplicar Devolución
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const cerrarModal = () => modal.remove();
    document.getElementById("btn-cerrar-reemb").addEventListener("click", cerrarModal);

    document.getElementById("btn-ejecutar-reemb").addEventListener("click", async () => {
        const filas = modal.querySelectorAll(".fila-producto-reembolso");
        const devoluciones = [];
        let totalItemsDevueltos = 0;
        let totalItemsOriginales = 0;

        filas.forEach(filas => {
            const idx = filas.dataset.index;
            const cantDevolver = Number(filas.querySelector(".input-reemb-cant").value) || 0;
            const prodOriginal = venta.productos[idx];

            totalItemsOriginales += prodOriginal.cantidad;
            totalItemsDevueltos += cantDevolver;

            if (cantDevolver > 0) {
                devoluciones.push({
                    id: prodOriginal.id,
                    cantidad: cantDevolver,
                    retornaInventario: true
                });
            }
        });

        if (devoluciones.length === 0) {
            showToast("Debes ingresar al menos una unidad para procesar la devolución.", { type: "warning" });
            return;
        }

        // Si se devuelven todos los productos vendidos, el estado pasa a ser reembolsada
        const determinarEstado = (totalItemsDevueltos === totalItemsOriginales) ? "reembolsada" : "corregida";

        const payload = {
            items: devoluciones
        };

        try {
            const resultado = await reembolsarVentaApi(venta.id, payload);
            const monto = Number(resultado?.montoReembolsado) || 0;
            showToast(`Reembolso ejecutado por $${monto.toLocaleString("es-CO")}.`, { type: "success" });
            cerrarModal();
            await renderHistorial();
        } catch (error) {
            console.error(error);
            showToast("No se pudo procesar el reembolso en el sistema.", { type: "error" });
        }
    });
}
