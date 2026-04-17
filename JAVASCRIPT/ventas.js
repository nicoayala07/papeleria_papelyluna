document.addEventListener("DOMContentLoaded", () => {
    const modalCobro     = document.getElementById("modal-cobro");
    const selectMetodo   = document.getElementById("metodo-pago");
    const inputEfectivo  = document.getElementById("efectivo-recibido");
    const spanCambio     = document.getElementById("cambio-valor");
    const spanTotal      = document.getElementById("modal-total-valor");
    const secEfectivo    = document.getElementById("seccion-efectivo");
    const secDebe        = document.getElementById("seccion-debe");
    const btnCobrar      = document.getElementById("btn-cobrar");

    // Abrir modal de cobro
    btnCobrar?.addEventListener("click", () => {
        const items = obtenerCarrito();
        if (items.length === 0) return;

        const total = calcularTotal();
        spanTotal.textContent = "$" + total.toLocaleString("es-CO");
        spanTotal.dataset.totalNum = total;

        // Resetear campos
        if (inputEfectivo) inputEfectivo.value = "";
        if (spanCambio) { spanCambio.textContent = "$0"; spanCambio.className = "cambio-valor"; }
        selectMetodo.value = "Efectivo";
        secEfectivo.style.display = "flex";
        secDebe.style.display = "none";

        modalCobro.classList.add("activa");
        if (inputEfectivo) inputEfectivo.focus();
    });

    // Cambio dinámico al escribir efectivo
    inputEfectivo?.addEventListener("input", () => {
        const total    = parseFloat(spanTotal.dataset.totalNum) || 0;
        const recibido = parseFloat(inputEfectivo.value) || 0;
        const cambio   = recibido - total;

        if (cambio >= 0) {
            spanCambio.textContent = "$" + cambio.toLocaleString("es-CO");
            spanCambio.className = "cambio-valor";
        } else {
            spanCambio.textContent = "Monto insuficiente";
            spanCambio.className = "cambio-valor insuficiente";
        }
    });

    // Cambiar sección visible según método de pago
    selectMetodo?.addEventListener("change", () => {
        const metodo = selectMetodo.value;
        secEfectivo.style.display = metodo === "Efectivo" ? "flex" : "none";
        secDebe.style.display     = metodo === "Debe"     ? "flex" : "none";
    });

    // Cancelar cobro
    const cerrarModal = () => {
        modalCobro.classList.remove("activa");
    };
    document.getElementById("btn-cancelar-cobro")?.addEventListener("click", cerrarModal);
    document.getElementById("btn-cancelar-cobro-2")?.addEventListener("click", cerrarModal);

    // Confirmar venta
    document.getElementById("btn-confirmar-venta")?.addEventListener("click", async () => {
        const total   = parseFloat(spanTotal.dataset.totalNum) || 0;
        const metodo  = selectMetodo.value;
        const items   = obtenerCarrito();

        // Validación efectivo
        if (metodo === "Efectivo") {
            const recibido = parseFloat(inputEfectivo.value) || 0;
            if (recibido < total) {
                showToast("El monto recibido no es suficiente.", { type: "warning" });
                return;
            }
        }

        // Validación Debe: debe tener cliente
        if (metodo === "Debe") {
            const clienteSelect = document.getElementById("cobro-cliente");
            if (clienteSelect && !clienteSelect.value) {
                showToast("Selecciona un cliente para registrar la cuenta por cobrar.", { type: "warning" });
                return;
            }
        }

        const productosActualizados = [];
        for (const item of items) {
            const producto = catalogoProductos.find(p => String(p.id) === String(item.id));
            if (!producto || producto.seguimientoInventario !== "si") continue;

            const stockActual = parseInt(producto.stock, 10) || 0;
            if (stockActual < item.cantidad) {
                showToast(`Stock insuficiente para ${producto.nombre}.`, { type: "warning" });
                return;
            }

            productosActualizados.push({
                ...producto,
                stock: stockActual - item.cantidad
            });
        }

        try {
            if (productosActualizados.length > 0) {
                productosActualizados.forEach(actualizado => {
                    const idx = catalogoProductos.findIndex(p => String(p.id) === String(actualizado.id));
                    if (idx !== -1) catalogoProductos[idx] = actualizado;
                });
                actualizarCatalogo(catalogoProductos);
                if (typeof ListarProductos === "function") ListarProductos();
                if (typeof filtrarYRenderizar === "function") filtrarYRenderizar();
                await sincronizarProductosEnSheets(productosActualizados);
            }
        } catch (error) {
            console.error("Error actualizando stock en productos:", error);
            showToast("No se pudo sincronizar el stock en Google Sheets.", { type: "error" });
            await cargarProductosDesdeAPI();
            renderCarrito();
            return;
        }

        const venta = {
            id: ventaActiva.id,
            fecha: new Date().toLocaleString("es-CO"),
            productos: items.map(i => ({ ...i, subtotal: i.precio * i.cantidad })),
            total,
            metodoPago: metodo,
            pagoCon: metodo === "Efectivo" ? parseFloat(inputEfectivo.value) : total,
            clienteId: metodo === "Debe" ? (document.getElementById("cobro-cliente")?.value || "") : ""
        };

        // Registrar en historial (localStorage por ahora — en MVP2 se hace POST)
        if (typeof registrarVenta === "function") registrarVenta(venta);

        // Enviar a Google Sheets
        postVenta({
            id: venta.id,
            fecha: venta.fecha,
            productos: JSON.stringify(venta.productos),
            total: venta.total,
            metodoPago: venta.metodoPago,
            pagoCon: venta.pagoCon,
            clienteId: venta.clienteId
        })
        .then(() => showToast(`Venta ${venta.id} guardada en la nube.`, { type: "success" }))
        .catch(err => {
            console.error("Error guardando venta en Sheets:", err);
            showToast("Venta registrada localmente, pero falló la sincronización con la nube.", { type: "error" });
        });

        cerrarModal();
        // Limpiar la venta activa
        ventaActiva = { id: generarId(), items: [] };
        renderCarrito();
        renderVentasGuardadas();

        // Mostrar factura
        mostrarVistaFactura(venta);

        showToast("Venta registrada con éxito.", { type: "success" });
    });
});

// ── Factura ────────────────────────────────────────────────────
function mostrarVistaFactura(venta) {
    const contenedor = document.getElementById("factura-contenido");
    if (!contenedor) return;
    navegarA("factura");

    const cambio = venta.metodoPago === "Efectivo"
        ? (venta.pagoCon - venta.total).toLocaleString("es-CO")
        : null;

    contenedor.innerHTML = `
        <div class="ticket-container">
            <div class="ticket-header">
                <h2>PAPEL Y LUNA</h2>
                <p>Comprobante de Venta</p>
            </div>
            <div class="ticket-info-secundaria">
                <span>F: ${venta.fecha}</span>
                <span>ID: ${venta.id}</span>
            </div>
            <table class="ticket-tabla">
                <thead>
                    <tr><th>Cant.</th><th>Producto</th><th style="text-align:right">Total</th></tr>
                </thead>
                <tbody>
                    ${venta.productos.map(p => `
                        <tr>
                            <td>${p.cantidad}</td>
                            <td>${p.nombre}</td>
                            <td style="text-align:right">$${(p.precio * p.cantidad).toLocaleString("es-CO")}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
            <div class="ticket-resumen-caja">
                <div class="resumen-fila total-destacado">
                    <span>TOTAL:</span>
                    <span>$${venta.total.toLocaleString("es-CO")}</span>
                </div>
                <div class="resumen-fila">
                    <span>Método:</span>
                    <span>${venta.metodoPago}</span>
                </div>
                ${cambio !== null ? `
                <div class="resumen-fila">
                    <span>Cambio:</span>
                    <span>$${cambio}</span>
                </div>` : ""}
            </div>
        </div>
        <div class="ticket-acciones">
            <button class="btn btn--success" onclick="navegarA('venta')">
                <i class="fa-solid fa-cash-register"></i> Nueva venta
            </button>
            <button class="btn btn--outline" onclick="navegarA('historial')">
                <i class="fa-solid fa-clock-rotate-left"></i> Historial
            </button>
        </div>
    `;
}
