document.addEventListener("DOMContentLoaded", () => {
    const modalCobro = document.getElementById("modal-cobro");
    const selectMetodo = document.getElementById("metodo-pago");
    const inputEfectivo = document.getElementById("efectivo-recibido");
    const spanCambio = document.getElementById("cambio-valor");
    const spanTotal = document.getElementById("modal-total-valor");
    const secEfectivo = document.getElementById("seccion-efectivo");
    const secDebe = document.getElementById("seccion-debe");
    const btnCobrar = document.getElementById("btn-cobrar");

    btnCobrar?.addEventListener("click", () => {
        const items = obtenerCarrito();
        if (items.length === 0) return;

        const total = calcularTotal();
        spanTotal.textContent = "$" + total.toLocaleString("es-CO");
        spanTotal.dataset.totalNum = total;

        if (inputEfectivo) inputEfectivo.value = "";
        if (spanCambio) {
            spanCambio.textContent = "$0";
            spanCambio.className = "cambio-valor";
        }
        selectMetodo.value = "Efectivo";
        secEfectivo.style.display = "flex";
        secDebe.style.display = "none";

        modalCobro.classList.add("activa");
        if (inputEfectivo) inputEfectivo.focus();
    });

    inputEfectivo?.addEventListener("input", () => {
        const total = parseFloat(spanTotal.dataset.totalNum) || 0;
        const recibido = parseFloat(inputEfectivo.value) || 0;
        const cambio = recibido - total;

        if (cambio >= 0) {
            spanCambio.textContent = "$" + cambio.toLocaleString("es-CO");
            spanCambio.className = "cambio-valor";
        } else {
            spanCambio.textContent = "Monto insuficiente";
            spanCambio.className = "cambio-valor insuficiente";
        }
    });

    selectMetodo?.addEventListener("change", () => {
        const metodo = selectMetodo.value;
        secEfectivo.style.display = metodo === "Efectivo" ? "flex" : "none";
        secDebe.style.display = metodo === "Debe" ? "flex" : "none";
    });

    const cerrarModal = () => {
        modalCobro.classList.remove("activa");
    };
    document.getElementById("btn-cancelar-cobro")?.addEventListener("click", cerrarModal);
    document.getElementById("btn-cancelar-cobro-2")?.addEventListener("click", cerrarModal);

    document.getElementById("btn-confirmar-venta")?.addEventListener("click", async () => {
        const total = parseFloat(spanTotal.dataset.totalNum) || 0;
        const metodo = selectMetodo.value;
        const items = obtenerCarrito();

        if (metodo === "Efectivo") {
            const recibido = parseFloat(inputEfectivo.value) || 0;
            if (recibido < total) {
                showToast("El monto recibido no es suficiente.", { type: "warning" });
                return;
            }
        }

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
                await sincronizarProductosEnMySQL(productosActualizados);
            }
        } catch (error) {
            console.error("Error actualizando stock en productos:", error);
            showToast("No se pudo sincronizar el stock en MySQL.", { type: "error" });
            await cargarProductosDesdeAPI();
            renderCarrito();
            return;
        }

        const descuento = obtenerDescuentoActivo();
        const venta = {
            id: ventaActiva.id,
            fecha: new Date().toLocaleString("es-CO"),
            productos: items.map(i => ({ ...i, subtotal: i.precio * i.cantidad })),
            total,
            metodoPago: metodo,
            pagoCon: metodo === "Efectivo" ? parseFloat(inputEfectivo.value) : total,
            clienteId: document.getElementById("cobro-cliente")?.value || "",
            descuentoNombre: descuento ? descuento.nombre : null,
            descuentoValor: descuento ? descuento.valor : null,
            descuentoTipo: descuento ? descuento.tipo : null
            
        };

        try {
            await postVenta(venta);
            showToast(`Venta ${venta.id} guardada en MySQL.`, { type: "success" });
        } catch (err) {
            console.error("Error guardando venta en MySQL:", err);
            showToast("No se pudo guardar la venta en MySQL.", { type: "error" });
            return;
        }

        cerrarModal();
        if (typeof limpiarDescuentoCarrito === "function") limpiarDescuentoCarrito();
        ventaActiva = { id: generarId(), items: [] };
        renderCarrito();
        renderVentasGuardadas();
        mostrarVistaFactura(venta);
    });
});

function mostrarVistaFactura(venta) {
    const contenedor = document.getElementById("factura-contenido");
    if (!contenedor) return;
    navegarA("factura");

    const cambio = venta.metodoPago === "Efectivo"
        ? (venta.pagoCon - venta.total).toLocaleString("es-CO")
        : null;
    const subtotal = venta.productos.reduce((acc, p) => {
        return acc + (Number(p.precio) || 0) * (Number(p.cantidad) || 0);
    }, 0);
    const descuentoMonto = Math.max(0, subtotal - venta.total);

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
                ${venta.descuentoNombre ? `
                <div class="resumen-fila">
                    <span>Subtotal:</span>
                    <span>$${subtotal.toLocaleString("es-CO")}</span>
                </div>
                <div class="resumen-fila">
                    <span>Descuento:</span>
                    <span>-$${descuentoMonto.toLocaleString("es-CO")}</span>
                </div>` : ""}
                <div class="resumen-fila total-destacado">
                    <span>TOTAL:</span>
                    <span>$${venta.total.toLocaleString("es-CO")}</span>
                </div>
                <div class="resumen-fila">
                    <span>Metodo:</span>
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
