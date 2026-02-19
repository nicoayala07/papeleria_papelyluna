let carrito = [];

export function obtenerCarrito() {
    return carrito;
}

export function vaciarCarrito() {
    carrito = [];
    actualizarCarrito();
}

export function agregarAlCarrito(producto) {
    const productoExistente = carrito.find(item => item.id === producto.id);
    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        carrito.push({...producto, cantidad: 1});
    }
    actualizarCarrito();
}

export function eliminarDelCarrito(productoId) {
    carrito = carrito.filter(item => item.id !== productoId);
    actualizarCarrito();
}

export function cambiarCantidad(productoId, operacion) {
    const producto = carrito.find(item => item.id === productoId);
    if (!producto) return;
    if (operacion === "aumentar") {
        producto.cantidad += 1;
    } else if (operacion === "disminuir") {
        if (producto.cantidad > 1) {
            producto.cantidad -= 1;
        } else {
            eliminarDelCarrito(productoId);
        }
    }
    actualizarCarrito();
}

export function actualizarCarrito() {
    const carritoContenedor = document.getElementById("cart-container");
    const mensajeVacio = document.getElementById("empty-cart-message");
    const subtotalEl = document.getElementById("subtotal");
    const envioEl = document.getElementById("shipping");
    const totalEl = document.getElementById("total");

    // ✅ Solo salir si el contenedor principal no existe
    if (!carritoContenedor) return;

    if (carrito.length === 0) {
        if (mensajeVacio) mensajeVacio.style.display = "block";
        carritoContenedor.innerHTML = "";
        if (subtotalEl) subtotalEl.textContent = "$0.00";
        if (envioEl) envioEl.textContent = "$0.00";
        if (totalEl) totalEl.textContent = "$0.00";
        return;
    }

    if (mensajeVacio) mensajeVacio.style.display = "none";
    carritoContenedor.innerHTML = "";

    carrito.forEach(item => {
        const subtotalItem = item.precio * item.cantidad;

        const divItem = document.createElement("div");
        divItem.classList.add("carrito__item");

        divItem.innerHTML = `
            <div class="carrito__item-info">
                <p class="carrito__item-nombre">${item.nombre}</p>
                <p class="carrito__item-precio-unitario">$${item.precio.toLocaleString("es-CO")} c/u</p>
            </div>
            <div class="carrito__item-controles">
                <button class="btn-cantidad" data-id="${item.id}" data-operacion="disminuir">−</button>
                <span class="carrito__item-cantidad">${item.cantidad}</span>
                <button class="btn-cantidad" data-id="${item.id}" data-operacion="aumentar">+</button>
            </div>
            <div class="carrito__item-subtotal">
                <p>$${subtotalItem.toLocaleString("es-CO")}</p>
                <button class="btn-eliminar" data-id="${item.id}">✕</button>
            </div>
        `;
        carritoContenedor.appendChild(divItem);
    });

    carritoContenedor.querySelectorAll(".btn-cantidad").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = parseInt(btn.getAttribute("data-id"));
            const operacion = btn.getAttribute("data-operacion");
            cambiarCantidad(id, operacion);
        });
    });

    carritoContenedor.querySelectorAll(".btn-eliminar").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = parseInt(btn.getAttribute("data-id"));
            eliminarDelCarrito(id);
        });
    });

    const subtotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    const envio = subtotal > 0 ? 5000 : 0;
    const total = subtotal + envio;

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toLocaleString("es-CO")}`;
    if (envioEl) envioEl.textContent = `$${envio.toLocaleString("es-CO")}`;
    if (totalEl) totalEl.textContent = `$${total.toLocaleString("es-CO")}`;
}