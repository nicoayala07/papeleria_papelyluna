document.addEventListener("DOMContentLoaded", () => {
    
    // Referencias a los elementos del DOM
    const modalCobro = document.getElementById("modal-cobro");
    const selectMetodo = document.getElementById("metodo-pago");
    const inputEfectivo = document.getElementById("efectivo-recibido");
    const spanCambio = document.getElementById("cambio-valor");
    const spanTotalModal = document.getElementById("modal-total-valor");
    const btnCheckout = document.querySelector("#checkout-btn");

    // Verificación de existencia del botón de checkout
    if (!btnCheckout) return;

    // 1. Mostrar el modal y cargar datos de la venta
    btnCheckout.addEventListener("click", () => {
        const carritoActual = obtenerCarrito();
        
        // RN-01: No se puede cerrar una venta sin al menos un producto
        if (carritoActual.length === 0) {
            alert("No se puede cerrar una venta sin productos.");
            return;
        }

        // Cálculo de totales (RF-14)
        const subtotal = carritoActual.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
        const envio = subtotal > 0 ? 5000 : 0;
        const totalVenta = subtotal + envio;

        // Actualización de la interfaz del modal
        if (spanTotalModal) {
            spanTotalModal.textContent = `$${totalVenta.toLocaleString("es-CO")}`;
            spanTotalModal.dataset.totalNum = totalVenta;
        }
        
        if (modalCobro) modalCobro.classList.add("activa");
    });

    // 2. Cálculo automático de cambio (RNF-03 y RF-22)
    if (inputEfectivo) {
        inputEfectivo.addEventListener("input", () => {
            const total = parseFloat(spanTotalModal.dataset.totalNum) || 0;
            const pago = parseFloat(inputEfectivo.value) || 0;
            const vuelto = pago - total;

            if (spanCambio) {
                if (vuelto >= 0) {
                    spanCambio.textContent = `$${vuelto.toLocaleString("es-CO")}`;
                    spanCambio.style.color = "var(--verde)";
                } else {
                    spanCambio.textContent = "Monto insuficiente";
                    spanCambio.style.color = "var(--rojo)";
                }
            }
        });
    }

    // 3. Gestión de visibilidad según el método de pago seleccionado (RF-21)
    if (selectMetodo) {
        selectMetodo.addEventListener("change", () => {
            const seccion = document.getElementById("seccion-efectivo");
            if (seccion) seccion.style.display = selectMetodo.value === "Efectivo" ? "block" : "none";
        });
    }

    // 4. Lógica para cancelar el proceso de cobro
    const btnCancelar = document.getElementById("btn-cancelar-cobro");
    if (btnCancelar) {
        btnCancelar.addEventListener("click", () => {
            modalCobro.classList.remove("activa");
            if (inputEfectivo) inputEfectivo.value = "";
            if (spanCambio) spanCambio.textContent = "$0";
        });
    }

    // 5. Confirmación final de la venta (RF-24 y RF-26)
    const btnConfirmar = document.getElementById("btn-confirmar-venta");
    if (btnConfirmar) {
        btnConfirmar.addEventListener("click", () => {
            const total = parseFloat(spanTotalModal.dataset.totalNum) || 0;
            const metodo = selectMetodo.value;

            // RNF-04: Validación de efectivo recibido
            if (metodo === "Efectivo") {
                const recibido = parseFloat(inputEfectivo.value) || 0;
                if (recibido < total) {
                    alert("El monto recibido es insuficiente para completar la venta.");
                    return;
                }
            }

            // Notificación de éxito y limpieza del estado
            alert("Venta confirmada exitosamente.");
            modalCobro.classList.remove("activa");
            
            if (typeof vaciarCarrito === 'function') {
                vaciarCarrito();
            }
            
            // Aquí se integrará la visualización de la factura (RF-25)
        });
    }
});