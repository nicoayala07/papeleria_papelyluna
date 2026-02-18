let carrito = [];

export function agregarAlCarrito(producto) {
    const productoExistente = carrito.find(item => item.id === producto.id && item.precio === producto.precio);
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

export function actualizarCarrito() {
    const carritocontenedor = document.getElementById("cart-container");
    const mensajevacio = document.getElementById("empty-cart-message");
    const subtotal = document.getElementById("subtotal");
        const envioel = document.getElementById("shipping");
        const totalel = document.getElementById("total");

    if (carrito.length === 0) {
        mensajevacio.style.display = "block";
        carritocontenedor.innerHTML = "";
        subtotal.textContent = "$0.00";
        envioel.textContent = "$0.00";
        totalel.textContent = "$0.00";
    }else {
        mensajevacio.style.display = "none";
        carritocontenedor.innerHTML = carrito.map(item =>
            `<div class="cart-item">
                <img src="../IMAGES/${item.image}" alt="${item.nombre}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4>${item.nombre}</h4>
                    <p>Precio: $${item.precio.toFixed(2)}</p>
                    <p>Cantidad: ${item.cantidad}</p>
                    <button class="remove-button" data-id="${item.id}">Eliminar</button>
                </div>
            </div>`
        ).join("");
        document.querySelectorAll(".remove-button").forEach(button => {
            button.addEventListener("click", () => 
                eliminarDelCarrito(parseInt(button.getAttribute("data-id"))));
        });
    }
}
