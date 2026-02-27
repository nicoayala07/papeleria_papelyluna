document.addEventListener("DOMContentLoaded", () => {
    // Referencias
    const modalCobro = document.getElementById("modal-cobro");
    const selectMetodo = document.getElementById("metodo-pago");
    const inputEfectivo = document.getElementById("efectivo-recibido");
    const spanCambio = document.getElementById("cambio-valor");
    const spanTotalModal = document.getElementById("modal-total-valor");
    const btnCheckout = document.querySelector("#checkout-btn");

    if (!btnCheckout) return;

    // 1. Abrir Modal
    btnCheckout.addEventListener("click", () => {
        const carritoActual = obtenerCarrito();
        if (carritoActual.length === 0) {
            alert("No se puede cerrar una venta sin productos.");
            return;
        }

        const subtotal = carritoActual.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
        const envio = subtotal > 0 ? 5000 : 0;
        const totalVenta = subtotal + envio;

        spanTotalModal.textContent = `$${totalVenta.toLocaleString("es-CO")}`;
        spanTotalModal.dataset.totalNum = totalVenta;
        
        modalCobro.classList.add("activa");
    });

    // 2. Lógica del Cambio (DINÁMICO)
    if (inputEfectivo) {
        inputEfectivo.addEventListener("input", () => {
            const total = parseFloat(spanTotalModal.dataset.totalNum) || 0;
            const recibido = parseFloat(inputEfectivo.value) || 0;
            const cambio = recibido - total;

            if (spanCambio) {
                if (cambio >= 0) {
                    spanCambio.textContent = `$${cambio.toLocaleString("es-CO")}`;
                    spanCambio.style.color = "var(--verde)";
                } else {
                    spanCambio.textContent = "Monto insuficiente";
                    spanCambio.style.color = "var(--rojo)";
                }
            }
        });
    }

    // 3. Mostrar/Ocultar sección efectivo según método
    if (selectMetodo) {
        selectMetodo.addEventListener("change", () => {
            const seccionEfectivo = document.getElementById("seccion-efectivo");
            if (seccionEfectivo) {
                seccionEfectivo.style.display = selectMetodo.value === "Efectivo" ? "block" : "none";
            }
        });
    }

    // 4. Cancelar Cobro
    const btnCancelar = document.getElementById("btn-cancelar-cobro");
    if (btnCancelar) {
        btnCancelar.addEventListener("click", () => {
            modalCobro.classList.remove("activa");
            if (inputEfectivo) inputEfectivo.value = "";
            if (spanCambio) spanCambio.textContent = "$0";
        });
    }

    // 5. Confirmación final
    const btnConfirmar = document.getElementById("btn-confirmar-venta");
    if (btnConfirmar) {
        btnConfirmar.addEventListener("click", () => {
            const total = parseFloat(spanTotalModal.dataset.totalNum) || 0;
            const metodo = selectMetodo.value;
            const carritoActual = obtenerCarrito();

            if (metodo === "Efectivo") {
                const recibido = parseFloat(inputEfectivo.value) || 0;
                if (recibido < total) {
                    alert("El monto recibido no es suficiente.");
                    return;
                }
            }

            const datosVenta = {
                id: Date.now(),
                fecha: new Date().toLocaleString(),
                productos: [...carritoActual],
                total: total,
                metodoPago: metodo,
                pagoCon: metodo === "Efectivo" ? parseFloat(inputEfectivo.value) : total
            };

            if (typeof registrarVenta === 'function') {
                registrarVenta(carritoActual); 
            }

            modalCobro.classList.remove("activa");
            if (typeof confirmarCompra === 'function') confirmarCompra(); // ← CAMBIADO

            mostrarVistaFactura(datosVenta);
        });
    }
});

// Función de factura
function mostrarVistaFactura(venta) {
    const contenedor = document.getElementById("factura-contenido");
    if (!contenedor) return;
    if (typeof navegarA === 'function') navegarA("factura");

    contenedor.innerHTML = `
        <div class="ticket-container">
            <div class="ticket-header">
                <h2>PAPEL Y LUNA</h2>
                <p>Comprobante de Venta</p>
            </div>
            
            <div class="ticket-info-secundaria">
                <span>F: ${venta.fecha}</span>
                <span>ID: ${venta.id.toString().slice(-6)}</span>
            </div>

            <table class="ticket-tabla">
                <thead>
                    <tr>
                        <th>Cant.</th>
                        <th>Producto</th>
                        <th style="text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${venta.productos.map(p => `
                        <tr>
                            <td>${p.cantidad}</td>
                            <td>${p.nombre}</td>
                            <td style="text-align: right;">$${(p.precio * p.cantidad).toLocaleString("es-CO")}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="ticket-resumen-caja">
                <div class="resumen-fila total-destacado">
                    <span>TOTAL:</span>
                    <span>$${venta.total.toLocaleString("es-CO")}</span>
                </div>
            </div>

            <div style="margin-top: 1rem; font-size: 0.85rem; border-top: 1px dashed #444; padding-top: 1rem;">
                <p>Método: ${venta.metodoPago}</p>
                ${venta.metodoPago === 'Efectivo' ? `<p>Cambio: $${(venta.pagoCon - venta.total).toLocaleString("es-CO")}</p>` : ''}
            </div>
        </div>
        
        <div class="ticket-acciones">
             <button class="btn btn--success" onclick="navegarA('ventas')">
                <i class="fa-solid fa-cart-plus"></i> Iniciar Nueva Venta
             </button>
        </div>
    `;
}


























