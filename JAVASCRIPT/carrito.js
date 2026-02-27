const CLAVE_CARRITO = "papelyluna_carrito";
const CLAVE_STOCK   = "papelyluna_stock";


function guardarCarritoEnStorage() {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
}

function cargarCarritoDesdeStorage() {
    const datos = localStorage.getItem(CLAVE_CARRITO);
    return datos ? JSON.parse(datos) : [];
}

function guardarStockEnStorage() {
    const stockData = productos.map(p => ({ id: p.id, stock: p.stock }));
    localStorage.setItem(CLAVE_STOCK, JSON.stringify(stockData));
}

function cargarStockDesdeStorage() {
    const datos = localStorage.getItem(CLAVE_STOCK);
    if (!datos) return;
    const stockGuardado = JSON.parse(datos);
    stockGuardado.forEach(item => {
        const prod = productos.find(p => p.id === item.id);
        if (prod) prod.stock = item.stock;
    });
}



let carrito = cargarCarritoDesdeStorage();

document.addEventListener("DOMContentLoaded", () => {
    cargarStockDesdeStorage();
    actualizarCarrito();
    actualizarStockVisual();
});



function obtenerCarrito() {
    return carrito;
}

function agregarAlCarrito(producto) {
    if (producto.stock <= 0) {
        alert("No hay stock disponible");
        return;
    }

    const productoExistente = carrito.find(item => item.id === producto.id);
    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }

    producto.stock -= 1;

    guardarCarritoEnStorage();
    guardarStockEnStorage();
    actualizarStockVisual();
    actualizarCarrito();
}

function eliminarDelCarrito(productoId) {
    const item = carrito.find(i => i.id === productoId);
    if (item) {
        const prodOriginal = productos.find(p => p.id === productoId);
        if (prodOriginal) prodOriginal.stock += item.cantidad;
    }
    carrito = carrito.filter(item => item.id !== productoId);

    guardarCarritoEnStorage();
    guardarStockEnStorage();
    actualizarStockVisual();
    actualizarCarrito();
}

function cambiarCantidad(productoId, operacion) {
    const productoCarrito  = carrito.find(item => item.id === productoId);
    const productoOriginal = productos.find(p => p.id === productoId);
    if (!productoCarrito || !productoOriginal) return;

    if (operacion === "aumentar") {
        if (productoOriginal.stock > 0) {
            productoCarrito.cantidad += 1;
            productoOriginal.stock -= 1;
        }
    } else if (operacion === "disminuir") {
        if (productoCarrito.cantidad > 1) {
            productoCarrito.cantidad -= 1;
            productoOriginal.stock += 1;
        } else {
            eliminarDelCarrito(productoId);
            return;
        }
    }

    guardarCarritoEnStorage();
    guardarStockEnStorage();
    actualizarStockVisual();
    actualizarCarrito();
}

function vaciarCarrito() {
    carrito.forEach(item => {
        const prodOriginal = productos.find(p => p.id === item.id);
        if (prodOriginal) prodOriginal.stock += item.cantidad;
    });
    carrito = [];

    guardarCarritoEnStorage();
    guardarStockEnStorage();
    actualizarStockVisual();
    actualizarCarrito();
}



function actualizarStockVisual() {
    productos.forEach(producto => {
        const card      = document.querySelector(`[data-id="${producto.id}"]`);
        const stockSpan = card ? card.querySelector(".stock-value") : null;
        if (stockSpan) stockSpan.textContent = producto.stock;
    });
}

function actualizarCarrito() {
    const carritoContenedor = document.getElementById("cart-container");
    const mensajeVacio      = document.getElementById("empty-cart-message");
    const subtotalEl        = document.getElementById("subtotal");
    const envioEl           = document.getElementById("shipping");
    const totalEl           = document.getElementById("total");

    if (!carritoContenedor) return;

    if (carrito.length === 0) {
        if (mensajeVacio) mensajeVacio.style.display = "";
        carritoContenedor.querySelectorAll(".carrito__item").forEach(item => item.remove());
        if (subtotalEl) subtotalEl.textContent = "$0";
        if (envioEl)    envioEl.textContent    = "$0";
        if (totalEl)    totalEl.textContent    = "$0";
        return;
    }

    if (mensajeVacio) mensajeVacio.style.display = "none";
    carritoContenedor.querySelectorAll(".carrito__item").forEach(item => item.remove());

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
            cambiarCantidad(parseInt(btn.dataset.id), btn.dataset.operacion);
        });
    });

    carritoContenedor.querySelectorAll(".btn-eliminar").forEach(btn => {
        btn.addEventListener("click", () => {
            eliminarDelCarrito(parseInt(btn.dataset.id));
        });
    });

    const subtotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    const envio    = subtotal > 0 ? 5000 : 0;
    const total    = subtotal + envio;

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toLocaleString("es-CO")}`;
    if (envioEl)    envioEl.textContent    = `$${envio.toLocaleString("es-CO")}`;
    if (totalEl)    totalEl.textContent    = `$${total.toLocaleString("es-CO")}`;
}