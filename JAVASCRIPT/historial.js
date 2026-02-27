const CLAVE_HISTORIAL = "papelyluna_historial";



function cargarHistorial() {
    const datos = localStorage.getItem(CLAVE_HISTORIAL);
    return datos ? JSON.parse(datos) : [];
}

function guardarHistorial(historial) {
    localStorage.setItem(CLAVE_HISTORIAL, JSON.stringify(historial));
}



function registrarVenta(carrito) {
    const historial = cargarHistorial();

    const subtotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    const envio    = subtotal > 0 ? 5000 : 0;
    const total    = subtotal + envio;

    const venta = {
        id:        `VTA-${Date.now()}`,
        numero:    historial.length + 1,
        fecha:     new Date().toLocaleDateString("es-CO", { year:"numeric", month:"long", day:"numeric" }),
        hora:      new Date().toLocaleTimeString("es-CO", { hour:"2-digit", minute:"2-digit" }),
        productos: carrito.map(item => ({
            id:       item.id,
            nombre:   item.nombre,
            precio:   item.precio,
            cantidad: item.cantidad,
            subtotal: item.precio * item.cantidad
        })),
        subtotal,
        envio,
        total
    };

    historial.unshift(venta); // más reciente primero
    guardarHistorial(historial);
    return venta;
}



function eliminarVenta(ventaId) {
    const historial = cargarHistorial().filter(v => v.id !== ventaId);
    guardarHistorial(historial);
    renderHistorial();
}

function limpiarHistorial() {
    if (!confirm("¿Seguro que quieres borrar todo el historial?")) return;
    guardarHistorial([]);
    renderHistorial();
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
        ${historial.length > 0 ? `<button class="btn btn--danger btn--sm" id="btn-limpiar-historial">Limpiar todo</button>` : ""}
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
        card.innerHTML = `
            <div class="historial__card-left">
                <span class="historial__numero">#${String(venta.numero).padStart(3, "0")}</span>
                <div class="historial__info">
                    <p class="historial__fecha">${venta.fecha} · ${venta.hora}</p>
                    <p class="historial__resumen">${venta.productos.length} producto${venta.productos.length !== 1 ? "s" : ""}</p>
                </div>
            </div>
            <div class="historial__card-right">
                <span class="historial__total">$${venta.total.toLocaleString("es-CO")}</span>
                <div class="historial__acciones">
                    <button class="btn btn--outline btn--sm btn-ver-factura" data-id="${venta.id}" title="Ver factura">
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
        btn.addEventListener("click", () => renderFactura(btn.dataset.id));
    });

    contenedor.querySelectorAll(".btn-eliminar-venta").forEach(btn => {
        btn.addEventListener("click", () => eliminarVenta(btn.dataset.id));
    });

    const btnLimpiar = document.getElementById("btn-limpiar-historial");
    if (btnLimpiar) btnLimpiar.addEventListener("click", limpiarHistorial);
}



function renderFactura(ventaId) {
    const historial = cargarHistorial();
    const venta     = historial.find(v => v.id === ventaId);
    if (!venta) return;

    const contenedor = document.getElementById("factura-contenido");
    if (!contenedor) return;

    contenedor.innerHTML = `
        <div class="factura">
            <div class="factura__header">
                <div class="factura__logo">
                    <img src="../img/Logo.png" alt="Logo" class="factura__logo-img">
                    <span class="factura__logo-nombre">Papel y Luna</span>
                </div>
                <div class="factura__meta">
                    <p class="factura__numero">Factura #${String(venta.numero).padStart(3, "0")}</p>
                    <p class="factura__fecha">${venta.fecha} · ${venta.hora}</p>
                </div>
            </div>

            <table class="factura__tabla">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Precio u.</th>
                        <th>Cant.</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${venta.productos.map(p => `
                        <tr>
                            <td>${p.nombre}</td>
                            <td>$${p.precio.toLocaleString("es-CO")}</td>
                            <td>${p.cantidad}</td>
                            <td>$${p.subtotal.toLocaleString("es-CO")}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>

            <div class="factura__totales">
                <div class="factura__fila">
                    <span>Subtotal</span>
                    <span>$${venta.subtotal.toLocaleString("es-CO")}</span>
                </div>
                <div class="factura__fila">
                    <span>Envío</span>
                    <span>$${venta.envio.toLocaleString("es-CO")}</span>
                </div>
                <div class="factura__fila factura__fila--total">
                    <span>Total</span>
                    <span>$${venta.total.toLocaleString("es-CO")}</span>
                </div>
            </div>

            <div class="factura__footer">
                <button class="btn btn--outline" onclick="window.print()">
                    <i class="fa-solid fa-print"></i> Imprimir
                </button>
            </div>
        </div>
    `;

    // Navegar a la vista factura
    navegarA("factura");
}