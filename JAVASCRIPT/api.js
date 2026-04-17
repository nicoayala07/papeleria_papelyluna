const API_URL = "https://script.google.com/macros/s/AKfycbyN1CGGOQd6srGtQl-aLawrZoLe5-BKkDvSHCTkvKG8zkPFOHqloh1pVsbq0PAz6UBG/exec";

// ──  Funciones GET
async function getProductos() {
    const res = await fetch(`${API_URL}?hoja=productos`);
    const data = await res.json();
    return data;
}

async function getClientes() {
    const res = await fetch(`${API_URL}?hoja=clientes`);
    const data = await res.json();
    return data;
}

async function getCategorias() {
    const res = await fetch(`${API_URL}?hoja=categorias`);
    const data = await res.json();
    return data;
}

async function getProveedores() {
    const res = await fetch(`${API_URL}?hoja=proveedores`);
    const data = await res.json();
    return data;
}

// ──  Funciones POST
async function postVenta(venta) {
    const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ hoja: "ventas", datos: venta })
    });
    const data = await res.json();
    return data;
}

async function postCompra(compra) {
    const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ hoja: "compras", datos: compra })
    });
    const data = await res.json();
    return data;
}

async function postProducto(producto) {
    const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ hoja: "productos", datos: producto })
    });
    const data = await res.json();
    return data;
}

async function postCliente(cliente) {
    const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ hoja: "clientes", datos: cliente })
    });
    const data = await res.json();
    return data;
}