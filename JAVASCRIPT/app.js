let catalogoProductos = [];

async function cargarProductosDesdeAPI() {
    try {
        const datos = await getProductos();
        if (Array.isArray(datos)) {
            catalogoProductos = datos.map(p => ({
                ...p,
                id: p.id || Date.now(),
                precio: parseFloat(p.precio) || 0,
                costo: parseFloat(p.costo) || 0,
                stock: parseInt(p.stock) || 0
            }));
            actualizarCatalogo(catalogoProductos);
            ListarProductos();
            filtrarYRenderizar();
        }
    } catch (err) {
        console.error("Error cargando productos:", err);
        catalogoProductos = JSON.parse(localStorage.getItem("pos_catalogo") || "[]");
    }
}

// ── Búsqueda POS 
const posSearch    = document.getElementById("pos-search");
const posCatFilter = document.getElementById("pos-category-filter");
const posResults   = document.getElementById("pos-results");
const posClearBtn  = document.getElementById("pos-search-clear");

function renderResultados(lista) {
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
            ${producto.seguimientoInventario === "si"
                ? `<span class="pos__result-stock ${agotado ? "agotado" : ""}">Stock: ${producto.stock}</span>`
                : ""}
            <button class="pos__result-add" data-id="${producto.id}" ${agotado ? "disabled title='Sin stock'" : ""}>
                <i class="fa-solid fa-plus"></i>
            </button>
        `;
        div.querySelector(".pos__result-add")?.addEventListener("click", (e) => {
            e.stopPropagation();
            agregarAlCarrito(producto);
        });
        div.addEventListener("click", () => {
            if (!agotado) agregarAlCarrito(producto);
        });
        posResults.appendChild(div);
    });
}

function filtrarYRenderizar() {
    const texto = (posSearch?.value || "").toLowerCase().trim();
    const cat   = (posCatFilter?.value || "").toLowerCase();

    if (!texto && !cat) {
        renderResultados(catalogoProductos);
        return;
    }

    const resultados = catalogoProductos.filter(p => {
        const coincideTexto = !texto ||
            p.nombre.toLowerCase().includes(texto) ||
            (p.codigo || "").toLowerCase().includes(texto);
        const coincideCat = !cat || (p.categoria || "").toLowerCase() === cat;
        return coincideTexto && coincideCat;
    });

    renderResultados(resultados);
}

posSearch?.addEventListener("input", filtrarYRenderizar);
posCatFilter?.addEventListener("change", filtrarYRenderizar);

posClearBtn?.addEventListener("click", () => {
    if (posSearch) posSearch.value = "";
    filtrarYRenderizar();
    posSearch?.focus();
});

// ── Poblar select de categorías ───────────────────────────────
function poblarSelectCategorias() {
    const categorias = [...new Set(catalogoProductos.map(p => p.categoria).filter(Boolean))];
    [posCatFilter, document.getElementById("prod-categoria")].forEach(sel => {
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

// ── Guardar catálogo en localStorage como un posible respaldo
function actualizarCatalogo(productos) {
    catalogoProductos = productos;
    localStorage.setItem("pos_catalogo", JSON.stringify(productos));
    poblarSelectCategorias();
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    cargarProductosDesdeAPI();
});
