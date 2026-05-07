// api.js - Gestión del catálogo conectada al Backend (Node.js)

let catalogoProductos = [];

// 1. UTILIDADES DE INTERFAZ
function mostrarCargaProductos() {
    const posResults = document.getElementById("pos-results");
    if (posResults) {
        posResults.innerHTML = `
            <div class="pos__results-empty">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <p>Cargando productos...</p>
            </div>
        `;
    }

    const contenedorProductos = document.getElementById("productos-container");
    if (contenedorProductos) {
        contenedorProductos.innerHTML = `
            <p style="color:var(--texto-suave);padding:1rem">Cargando productos...</p>
        `;
    }
}

// 2. COMUNICACIÓN CON EL SERVIDOR (CAPA DE CONTROLADORES Y VALIDATORS)
async function cargarProductosDesdeAPI() {
    try {
        // Conexión al controlador de tu servidor Node.js
        const response = await fetch('http://localhost:3000/api/productos');

        if (!response.ok) {
            throw new Error("No se pudo obtener la respuesta del servidor");
        }

        const datos = await response.json();

        if (Array.isArray(datos)) {
            catalogoProductos = datos.map(p => ({
                ...p,
                id: p.id || Date.now(),
                precio: parseFloat(p.precio) || 0,
                costo: parseFloat(p.costo) || 0,
                stock: parseInt(p.stock) || 0
            }));
            actualizarCatalogo(catalogoProductos);
            if (typeof ListarProductos === "function") ListarProductos();
            filtrarYRenderizar();
        }
    } catch (err) {
        console.error("Error cargando productos:", err);
        showToast("Error al conectar con el servidor.", { type: "error" });
    }
}

// FUNCIÓN PARA EL EJERCICIO 2: Enviar datos pasando por el Validador
async function guardarProducto() {
    const btn = document.getElementById("btn-guardar-prod");
    // Esta función captura los datos de tus inputs (prod-nombre, prod-precio, etc.)
    const datos = obtenerDatosFormularioProducto();

    if (btn) {
        btn.disabled = true;
        btn.textContent = "Validando...";
    }

    try {
        const response = await fetch('http://localhost:3000/api/productos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const resultado = await response.json();

        if (response.ok) {
            showToast("Producto guardado exitosamente", { type: "success" });
            limpiarFormProducto();
            await cargarProductosDesdeAPI();
        } else {
            // Aquí capturamos los errores que vienen de productos.validators.js
            const errorMsg = resultado.errors ? resultado.errors[0].msg : "Error en los datos";
            showToast(`Error: ${errorMsg}`, { type: "error" });
        }
    } catch (error) {
        showToast("No se pudo conectar con el servidor", { type: "error" });
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = "Guardar";
        }
    }
}

// 3. RENDERIZADO Y BÚSQUEDA POS
function renderResultados(lista) {
    const posResults = document.getElementById("pos-results");
    if (!posResults) return;
    posResults.innerHTML = "";

    if (lista.length === 0) {
        posResults.innerHTML = `
            <div class="pos__results-empty">
                <i class="fa-solid fa-magnifying-glass"></i>
                <p>Sin resultados</p>
            </div>
        `;
        return;
    }

    lista.forEach(producto => {
        const agotado = producto.seguimientoInventario === "si" && producto.stock <= 0;
        const div = document.createElement("div");
        div.classList.add("pos__result-item");
        div.innerHTML = `
            <div class="pos__result-info">
                <p class="pos__result-nombre">${producto.nombre}</p>
                <p class="pos__result-meta">${producto.categoria || ""} ${producto.codigo ? "· " + producto.codigo : ""}</p>
            </div>
            <span class="pos__result-precio">$${producto.precio.toLocaleString("es-CO")}</span>
            <button class="pos__result-add" data-id="${producto.id}" ${agotado ? "disabled" : ""}>
                <i class="fa-solid fa-plus"></i>
            </button>
        `;

        div.addEventListener("click", () => {
            if (!agotado && typeof agregarAlCarrito === "function") agregarAlCarrito(producto);
        });
        posResults.appendChild(div);
    });
}

function filtrarYRenderizar() {
    const texto = (document.getElementById("pos-search")?.value || "").toLowerCase().trim();
    const cat = (document.getElementById("pos-category-filter")?.value || "").toLowerCase();

    const resultados = catalogoProductos.filter(p => {
        const coincideTexto = !texto || p.nombre.toLowerCase().includes(texto) || (p.codigo || "").toLowerCase().includes(texto);
        const coincideCat = !cat || (p.categoria || "").toLowerCase() === cat;
        return coincideTexto && coincideCat;
    });

    renderResultados(resultados);
}

// 4. PERSISTENCIA Y CATEGORÍAS
function actualizarCatalogo(productos) {
    catalogoProductos = productos;
    localStorage.setItem("pos_catalogo", JSON.stringify(productos));
    poblarSelectCategorias();
}

function poblarSelectCategorias() {
    const posCatFilter = document.getElementById("pos-category-filter");
    const prodCatSelect = document.getElementById("prod-categoria");
    const categorias = [...new Set(catalogoProductos.map(p => p.categoria).filter(Boolean))];

    [posCatFilter, prodCatSelect].forEach(sel => {
        if (!sel) return;
        const opts = sel.querySelectorAll("option:not([value=''])");
        opts.forEach(o => o.remove());
        categorias.forEach(cat => {
            const opt = document.createElement("option");
            opt.value = cat;
            opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
            sel.appendChild(opt);
        });
    });
}

// 5. INICIALIZACIÓN
document.addEventListener("DOMContentLoaded", () => {
    mostrarCargaProductos();
    cargarProductosDesdeAPI();

    document.getElementById("pos-search")?.addEventListener("input", filtrarYRenderizar);
    document.getElementById("pos-category-filter")?.addEventListener("change", filtrarYRenderizar);
    document.getElementById("btn-guardar-prod")?.addEventListener("click", guardarProducto);
});