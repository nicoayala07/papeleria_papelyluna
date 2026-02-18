let carrito = [];

export function agregarAlCarrito(producto) {
    const productoExistente = carrito.find(item => item.id === producto.id && item.precio === producto.precio);
    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        carrito.push({...producto, cantidad: 1});
    }

    actualizarCarrito();
    console.log(carrito);
}

export function actualizarCarrito() {
    const carritocontenedor = Document.getElementById("carrito-contenedor");
    const mensajevacio = Document.getElementById("mensaje-vacio");
    const subtotal = Document.getElementById("subtotal");
    cont 

}
