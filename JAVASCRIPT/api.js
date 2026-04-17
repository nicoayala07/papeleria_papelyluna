const API_URL = "https://script.google.com/macros/s/AKfycbymPuedWchrgu4_ARaKXkNvLxCZYICSj3u6Ha7mTkZSF6U7ICHA3PT8PamqnLRchBP1/exec";

// --- LECTURA ---
async function getData(hoja) {
    try {
        // Añadimos un timestamp para evitar que el navegador use una respuesta vieja (cache)
        const cacheBuster = `&t=${new Date().getTime()}`;
        const res = await fetch(`${API_URL}?hoja=${hoja}${cacheBuster}`, {
            method: 'GET',
            mode: 'cors', // Forzamos modo cors para evitar el error de la imagen
            redirect: 'follow'
        });

        if (!res.ok) throw new Error("Error en la respuesta de red");

        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error(`Error cargando la hoja ${hoja}:`, error);
        return [];
    }
}

// Funciones de acceso directo
const getClientes = () => getData("clientes");
const getProveedores = () => getData("proveedores");
const getProductos = () => getData("productos");
const getCategorias = () => getData("categorias");

// --- ESCRITURA ---
async function ejecutarAccion(payload) {
    try {
        const res = await fetch(API_URL, {
            method: "POST",
            mode: "no-cors", // Google Scripts requiere no-cors para POST
            body: JSON.stringify(payload)
        });
        return true;
    } catch (error) {
        console.error("Error en la operación:", error);
        return false;
    }
}

const postCliente = (datos) => ejecutarAccion({ hoja: "clientes", datos });
const postProveedor = (datos) => ejecutarAccion({ hoja: "proveedores", datos });
const eliminarEntidad = (id, hoja) => ejecutarAccion({ accion: "eliminar", hoja, id });
