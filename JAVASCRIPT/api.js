const API_URL = "https://script.google.com/macros/s/AKfycbymPuedWchrgu4_ARaKXkNvLxCZYICSj3u6Ha7mTkZSF6U7ICHA3PT8PamqnLRchBP1/exec";

function construirUrl(hoja) {
    const url = new URL(API_URL);
    url.searchParams.set("hoja", hoja);
    url.searchParams.set("t", Date.now().toString());
    return url.toString();
}

// --- LECTURA ---
async function getData(hoja) {
    try {
        const res = await fetch(construirUrl(hoja), {
            method: "GET",
            mode: "cors",
            redirect: "follow"
        });

        if (!res.ok) {
            throw new Error(`Error HTTP ${res.status}`);
        }

        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error(`Error cargando la hoja ${hoja}:`, error);
        return [];
    }
}

const getClientes = () => getData("clientes");
const getProveedores = () => getData("proveedores");
const getProductos = () => getData("productos");
const getCategorias = () => getData("categorias");

// --- ESCRITURA ---
async function ejecutarAccion(payload) {
    try {
        const res = await fetch(API_URL, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            throw new Error(`Error HTTP ${res.status}`);
        }

        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            return await res.json();
        }

        return await res.text();
    } catch (error) {
        console.error("Error en la operación:", error);
        throw error;
    }
}

const postCliente = (datos) => ejecutarAccion({ hoja: "clientes", datos });
const postProveedor = (datos) => ejecutarAccion({ hoja: "proveedores", datos });
const postCategoria = (datos) => ejecutarAccion({ hoja: "categorias", datos });
const postProducto = (datos) => ejecutarAccion({ hoja: "productos", datos });
const postVenta = (datos) => ejecutarAccion({ hoja: "ventas", datos });
const postCompra = (datos) => ejecutarAccion({ hoja: "compras", datos });
const eliminarEntidad = (id, hoja) => ejecutarAccion({ accion: "eliminar", hoja, id });

function serializarProductoParaSheets(producto) {
    return {
        id: String(producto.id),
        nombre: producto.nombre || "",
        precio: Number(producto.precio) || 0,
        costo: Number(producto.costo) || 0,
        codigo: producto.codigo || "",
        categoria: producto.categoria || "",
        stock: parseInt(producto.stock, 10) || 0,
        seguimientoInventario: producto.seguimientoInventario || "no"
    };
}

async function sincronizarProductoEnSheets(producto) {
    const payload = serializarProductoParaSheets(producto);
    await eliminarEntidad(String(payload.id), "productos").catch(() => null);
    return postProducto(payload);
}

async function sincronizarProductosEnSheets(productos) {
    for (const producto of productos) {
        await sincronizarProductoEnSheets(producto);
    }
}
