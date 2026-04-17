const API_URL = "https://script.google.com/macros/s/AKfycbymPuedWchrgu4_ARaKXkNvLxCZYICSj3u6Ha7mTkZSF6U7ICHA3PT8PamqnLRchBP1/exec";

// --- LECTURA ---
async function getData(hoja) {
    try {
        const cacheBuster = `&t=${new Date().getTime()}`;
        const res = await fetch(`${API_URL}?hoja=${hoja}${cacheBuster}`, {
            method: 'GET',
            mode: 'cors',
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

const getClientes = () => getData("clientes");
const getProveedores = () => getData("proveedores");
const getProductos = () => getData("productos");
const getCategorias = () => getData("categorias");

// --- ESCRITURA ---
async function ejecutarAccion(payload) {
    try {
        const res = await fetch(API_URL, {
            method: "POST",
            mode: "no-cors",
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
const postCategoria = (datos) => ejecutarAccion({ hoja: "categorias", datos });

// CORRECCIÓN: Función global para eliminar que el HTML pueda ver
window.confirmarEliminacion = async function (id, hoja) {
    if (confirm("¿Estás seguro de que deseas eliminar este registro?")) {
        const exito = await ejecutarAccion({ accion: "eliminar", hoja, id });
        if (exito) {
            alert("Eliminado correctamente");
            // Recargar la vista actual
            if (hoja === 'clientes') cargarYListarClientes();
            if (hoja === 'proveedores') cargarYListarProveedores();
            if (hoja === 'categorias') cargarYListarCategorias();
        } else {
            alert("Error al intentar eliminar");
        }
    }
};