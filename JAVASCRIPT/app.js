// ── Estado global de productos (temporal hasta API) ───────────
// En MVP2 esto vendrá de Google Sheets. Por ahora se inicializa vacío
// y se puede poblar desde productos.js cuando se creen productos.
let catalogoProductos = JSON.parse(localStorage.getItem("pos_catalogo") || "[]");

// ── Búsqueda POS en tiempo real ───────────────────────────────
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
        // Clic en la fila también agrega
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
        posResults.innerHTML = `
            <div class="pos__results-empty">
                <i class="fa-solid fa-magnifying-glass"></i>
                <p>Busca un producto para agregarlo a la venta</p>
            </div>
        `;
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

poblarSelectCategorias();

// ── Guardar catálogo en localStorage cuando cambie (temporal) ──
function actualizarCatalogo(productos) {
    catalogoProductos = productos;
    localStorage.setItem("pos_catalogo", JSON.stringify(productos));
    poblarSelectCategorias();
}
