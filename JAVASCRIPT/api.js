// api.js - Gestión del catálogo conectada al Backend (Node.js)

let catalogoProductos = [];
const REMOTE_API_BASE_URL = "https://papeleria-papelyluna.onrender.com/api";
const API_BASE_URL = window.PAPEL_API_BASE_URL || (
    window.location.protocol === "file:" || ["localhost", "127.0.0.1"].includes(window.location.hostname)
        ? "http://localhost:3000/api"
        : window.location.hostname.endsWith("github.io")
            ? REMOTE_API_BASE_URL
            : `${window.location.origin}/api`
);
const AUTH_STORAGE_KEY = "papelYLuna.auth";
const POS_DRAFTS_STORAGE_KEY = "papelYLuna.pos.productoDrafts";
let posCategoriaActiva = "";
let posProductoEditandoId = null;
let posEditorDrafts = {};
let posUltimosProductos = [];
let posUltimosDescuentos = [];

function cargarSesionAuth() {
    try {
        return JSON.parse(sessionStorage.getItem(AUTH_STORAGE_KEY) || "null");
    } catch (error) {
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
    }
}

let authSession = cargarSesionAuth();

function haySesionActiva() {
    return Boolean(authSession?.token);
}

function obtenerUsuarioActual() {
    return authSession?.user || null;
}

function guardarSesionAuth(session) {
    authSession = session;
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

function limpiarSesionAuth() {
    authSession = null;
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

async function apiRequest(path, options = {}) {
    const { skipAuth = false, headers = {}, ...fetchOptions } = options;
    const authHeaders = !skipAuth && authSession?.token
        ? { Authorization: `Bearer ${authSession.token}` }
        : {};

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...fetchOptions,
        headers: {
            "Content-Type": "application/json",
            ...authHeaders,
            ...headers
        }
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
        const error = new Error(data?.error || data?.message || "Error en la solicitud");
        error.response = data;
        error.status = response.status;
        if (response.status === 401 && !skipAuth) limpiarSesionAuth();
        throw error;
    }

    return data;
}

async function loginApi(username, password) {
    const data = await apiRequest("/login", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({ username, password })
    });
    guardarSesionAuth(data);
    return data;
}

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
        const datos = await apiRequest("/productos");

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
    const editandoId = typeof getProductoEditandoId === "function" ? getProductoEditandoId() : null;

    if (btn) {
        btn.disabled = true;
        btn.textContent = "Validando...";
    }

    try {
        await apiRequest(editandoId ? `/productos/${editandoId}` : "/productos", {
            method: editandoId ? "PUT" : "POST",
            body: JSON.stringify(datos)
        });

        showToast(editandoId ? "Producto actualizado exitosamente" : "Producto guardado exitosamente", { type: "success" });
        limpiarFormProducto();
        await cargarProductosDesdeAPI();
    } catch (error) {
        const errorMsg = error.response?.errors?.[0]?.msg || error.message || "No se pudo conectar con el servidor";
        showToast(`Error: ${errorMsg}`, { type: "error" });
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = "Guardar";
        }
    }
}

// 3. RENDERIZADO Y BÚSQUEDA POS
async function eliminarProductoApi(id) {
    return apiRequest(`/productos/${encodeURIComponent(id)}`, { method: "DELETE" });
}

async function sincronizarProductosEnMySQL(productosActualizados = []) {
    return Promise.all(productosActualizados.map(producto => {
        const { id, createdAt, updatedAt, ...datos } = producto;
        return apiRequest(`/productos/${encodeURIComponent(id)}`, {
            method: "PUT",
            body: JSON.stringify(datos)
        });
    }));
}

async function getClientes() {
    return apiRequest("/clientes");
}

async function postCliente(cliente) {
    const { id, createdAt, updatedAt, ...datos } = cliente;
    return apiRequest("/clientes", {
        method: "POST",
        body: JSON.stringify(datos)
    });
}

async function putCliente(id, cliente) {
    const { id: _id, createdAt, updatedAt, ...datos } = cliente;
    return apiRequest(`/clientes/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(datos)
    });
}

async function getProveedores() {
    return apiRequest("/proveedores");
}

async function postProveedor(proveedor) {
    const { id, createdAt, updatedAt, ...datos } = proveedor;
    return apiRequest("/proveedores", {
        method: "POST",
        body: JSON.stringify(datos)
    });
}

async function putProveedor(id, proveedor) {
    const { id: _id, createdAt, updatedAt, ...datos } = proveedor;
    return apiRequest(`/proveedores/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(datos)
    });
}

async function getCategorias() {
    return apiRequest("/categorias");
}

async function postCategoria(categoria) {
    const { id, createdAt, updatedAt, ...datos } = categoria;
    return apiRequest("/categorias", {
        method: "POST",
        body: JSON.stringify(datos)
    });
}

async function putCategoria(id, categoria) {
    const { id: _id, createdAt, updatedAt, ...datos } = categoria;
    return apiRequest(`/categorias/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(datos)
    });
}

async function eliminarEntidad(id, hoja) {
    const rutas = {
        clientes: "clientes",
        proveedores: "proveedores",
        categorias: "categorias"
    };
    const ruta = rutas[hoja];
    if (!ruta) throw new Error("Entidad desconocida");

    return apiRequest(`/${ruta}/${encodeURIComponent(id)}`, { method: "DELETE" });
}

async function getVentas() {
    return apiRequest("/ventas");
}

async function postVenta(venta) {
    return apiRequest("/ventas", {
        method: "POST",
        body: JSON.stringify(venta)
    });
}

async function deleteVentaApi(id) {
    return apiRequest(`/ventas/${encodeURIComponent(id)}`, { method: "DELETE" });
}

async function getVentasPendientes() {
    return apiRequest("/ventas/pendientes");
}

async function postVentaPendiente(venta) {
    return apiRequest("/ventas/pendientes", {
        method: "POST",
        body: JSON.stringify(venta)
    });
}

async function deleteVentaPendienteApi(id) {
    return apiRequest(`/ventas/pendientes/${encodeURIComponent(id)}`, { method: "DELETE" });
}

async function getCompras() {
    return apiRequest("/compras");
}

async function postCompra(compra) {
    return apiRequest("/compras", {
        method: "POST",
        body: JSON.stringify(compra)
    });
}

async function deleteCompraApi(id) {
    return apiRequest(`/compras/${encodeURIComponent(id)}`, { method: "DELETE" });
}

async function getFaltantes(query = {}) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") params.set(key, value);
    });
    const qs = params.toString();
    return apiRequest(`/faltantes${qs ? "?" + qs : ""}`);
}

async function postFaltante(faltante) {
    return apiRequest("/faltantes", {
        method: "POST",
        body: JSON.stringify(faltante)
    });
}

async function patchFaltanteEstado(id, estado) {
    return apiRequest(`/faltantes/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ estado })
    });
}

async function deleteFaltanteApi(id) {
    return apiRequest(`/faltantes/${encodeURIComponent(id)}`, { method: "DELETE" });
}

async function getReporteResumen(query = {}) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") params.set(key, value);
    });
    const qs = params.toString();
    return apiRequest(`/reportes/resumen${qs ? "?" + qs : ""}`);
}

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
function normalizarTextoPos(valor) {
    return (valor || "").toString().trim();
}

function formatearMonedaPos(valor) {
    return "$" + (Number(valor) || 0).toLocaleString("es-CO");
}

function obtenerCategoriasCatalogo() {
    return [...new Set(
        (catalogoProductos || [])
            .map(producto => normalizarTextoPos(producto.categoria))
            .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, "es"));
}

function obtenerProductoPos(id) {
    return (catalogoProductos || []).find(producto => String(producto.id) === String(id)) || null;
}

function cargarBorradoresPos() {
    try {
        const raw = sessionStorage.getItem(POS_DRAFTS_STORAGE_KEY);
        posEditorDrafts = raw ? JSON.parse(raw) : {};
    } catch (error) {
        posEditorDrafts = {};
    }
}

function guardarBorradoresPos() {
    sessionStorage.setItem(POS_DRAFTS_STORAGE_KEY, JSON.stringify(posEditorDrafts));
}

function productoADraftPos(producto) {
    return {
        nombre: normalizarTextoPos(producto?.nombre),
        categoria: normalizarTextoPos(producto?.categoria),
        precio: Number(producto?.precio) || 0,
        costo: Number(producto?.costo) || 0,
        codigo: normalizarTextoPos(producto?.codigo),
        seguimientoInventario: producto?.seguimientoInventario || "si",
        stock: Number.parseInt(producto?.stock, 10) || 0
    };
}

function obtenerDraftPos(id) {
    return posEditorDrafts[id] || productoADraftPos(obtenerProductoPos(id));
}

function renderPosCategoriaTiles() {
    const contenedor = document.getElementById("pos-category-tiles");
    if (!contenedor) return;

    const categorias = obtenerCategoriasCatalogo();
    const conteos = catalogoProductos.reduce((acc, producto) => {
        const categoria = normalizarTextoPos(producto.categoria) || "Sin categoria";
        acc[categoria] = (acc[categoria] || 0) + 1;
        return acc;
    }, {});

    contenedor.innerHTML = "";

    const crearTile = ({ valor, nombre, total, icono }) => {
        const button = document.createElement("button");
        button.className = `pos__category-tile${posCategoriaActiva === valor ? " activa" : ""}`;
        button.type = "button";
        button.dataset.categoria = valor;
        button.innerHTML = `
            <i class="fa-solid ${icono}"></i>
            <span class="pos__category-name">${nombre}</span>
            <span class="pos__category-count">${total} producto${total === 1 ? "" : "s"}</span>
        `;
        button.addEventListener("click", () => {
            posCategoriaActiva = valor;
            const select = document.getElementById("pos-category-filter");
            if (select) select.value = valor;
            filtrarYRenderizar();
        });
        contenedor.appendChild(button);
    };

    crearTile({
        valor: "",
        nombre: "Todos",
        total: catalogoProductos.length,
        icono: "fa-border-all"
    });

    categorias.forEach(categoria => {
        crearTile({
            valor: categoria,
            nombre: categoria,
            total: conteos[categoria] || 0,
            icono: "fa-layer-group"
        });
    });
}

function renderPosEditorCategoriaOptions() {
    const datalist = document.getElementById("pos-editor-categorias");
    if (!datalist) return;

    datalist.innerHTML = "";
    obtenerCategoriasCatalogo().forEach(categoria => {
        const option = document.createElement("option");
        option.value = categoria;
        datalist.appendChild(option);
    });
}

function renderPosPausedDrafts() {
    const contenedor = document.getElementById("pos-edit-paused");
    if (!contenedor) return;

    const ids = Object.keys(posEditorDrafts);
    contenedor.hidden = ids.length === 0;
    contenedor.innerHTML = "";

    if (ids.length === 0) return;

    const label = document.createElement("span");
    label.className = "pos__edit-paused-label";
    label.innerHTML = `<i class="fa-solid fa-pause"></i> Ediciones pausadas:`;
    contenedor.appendChild(label);

    ids.forEach(id => {
        const draft = posEditorDrafts[id];
        const producto = obtenerProductoPos(id);
        const chip = document.createElement("button");
        chip.className = "pos__edit-draft-chip";
        chip.type = "button";
        chip.dataset.id = id;
        chip.textContent = draft?.nombre || producto?.nombre || `Producto ${id}`;
        chip.addEventListener("click", () => abrirEditorProductoPos(id));
        contenedor.appendChild(chip);
    });
}

function actualizarEstadoEditorEnTarjetas() {
    document.querySelectorAll(".pos__product-card").forEach(card => {
        const id = card.dataset.id;
        card.classList.toggle("editando", String(id) === String(posProductoEditandoId));
        card.classList.toggle("con-borrador", Boolean(posEditorDrafts[id]));
    });
}

function bindLongPressProducto(elemento, producto, callbackClick) {
    let timer = null;
    let longPress = false;

    elemento.addEventListener("pointerdown", event => {
        if (event.target.closest("button")) return;
        longPress = false;
        timer = window.setTimeout(() => {
            longPress = true;
            abrirEditorProductoPos(producto.id);
        }, 650);
    });

    ["pointerup", "pointerleave", "pointercancel"].forEach(evento => {
        elemento.addEventListener(evento, () => {
            if (timer) window.clearTimeout(timer);
        });
    });

    elemento.addEventListener("click", event => {
        if (longPress) {
            event.preventDefault();
            event.stopPropagation();
            longPress = false;
            return;
        }
        callbackClick();
    });
}

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
        const stockTexto = producto.seguimientoInventario === "si" ? `${producto.stock} en stock` : "Sin control";
        const div = document.createElement("article");
        div.className = `pos__product-card${agotado ? " agotado" : ""}${posEditorDrafts[producto.id] ? " con-borrador" : ""}`;
        div.dataset.id = producto.id;
        div.innerHTML = `
            <div class="pos__product-card-top">
                <span class="pos__product-category">${producto.categoria || "Sin categoria"}</span>
                <button class="pos__product-edit" type="button" data-id="${producto.id}" title="Editar producto">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
            </div>
            <div class="pos__product-card-body">
                <h3 class="pos__product-name">${producto.nombre || "Sin nombre"}</h3>
                <p class="pos__product-code">${producto.codigo || "Sin codigo"}</p>
            </div>
            <div class="pos__product-card-footer">
                <span class="pos__product-price">${formatearMonedaPos(producto.precio)}</span>
                <span class="pos__product-stock${agotado ? " agotado" : ""}">${stockTexto}</span>
            </div>
            <button class="pos__product-add" type="button" data-id="${producto.id}" ${agotado ? "disabled" : ""}>
                <i class="fa-solid fa-plus"></i> Agregar
            </button>
            <span class="pos__product-draft-badge">Edición pausada</span>
        `;

        bindLongPressProducto(div, producto, () => {
            if (!agotado && typeof agregarAlCarrito === "function") agregarAlCarrito(producto);
        });

        div.querySelector(".pos__product-add")?.addEventListener("click", event => {
            event.stopPropagation();
            if (!agotado && typeof agregarAlCarrito === "function") agregarAlCarrito(producto);
        });

        div.querySelector(".pos__product-edit")?.addEventListener("click", event => {
            event.stopPropagation();
            abrirEditorProductoPos(producto.id);
        });

        posResults.appendChild(div);
    });

    actualizarEstadoEditorEnTarjetas();
}

function filtrarYRenderizar() {
    const texto = (document.getElementById("pos-search")?.value || "").toLowerCase().trim();
    const selectCategoria = document.getElementById("pos-category-filter")?.value || "";
    const categoriaFiltro = normalizarTextoPos(posCategoriaActiva || selectCategoria).toLowerCase();
    const posResults = document.getElementById("pos-results");

    const resultados = catalogoProductos.filter(p => {
        const nombre = (p.nombre || "").toLowerCase();
        const codigo = (p.codigo || "").toLowerCase();
        const categoria = (p.categoria || "").toLowerCase();
        const coincideTexto = !texto || nombre.includes(texto) || codigo.includes(texto) || categoria.includes(texto);
        const coincideCat = !categoriaFiltro || categoria === categoriaFiltro;
        return coincideTexto && coincideCat;
    });
    posUltimosProductos = resultados;

    renderPosCategoriaTiles();
    renderPosPausedDrafts();
    renderResultados(resultados);

    if (texto && typeof listaDescuentos !== "undefined" && posResults) {
        const descsFiltrados = listaDescuentos.filter(d =>
            (d.nombre || "").toLowerCase().includes(texto)
        );
        posUltimosDescuentos = descsFiltrados;

        if (descsFiltrados.length > 0 && resultados.length === 0) {
            posResults.innerHTML = "";
        }

        descsFiltrados.forEach(desc => {
            const valorDisplay = desc.tipo === "porcentaje"
                ? `${desc.valor}%`
                : `$${Number(desc.valor).toLocaleString("es-CO")}`;
            const div = document.createElement("article");
            div.className = "pos__product-card pos__discount-card";
            div.dataset.descId = desc.id;
            div.innerHTML = `
                <div class="pos__product-card-top">
                    <span class="pos__product-category">Descuento</span>
                    <i class="fa-solid fa-tag"></i>
                </div>
                <div class="pos__product-card-body">
                    <h3 class="pos__product-name">${desc.nombre}</h3>
                    <p class="pos__product-code">${desc.tipo === "porcentaje" ? "Porcentaje" : "Valor fijo"}</p>
                </div>
                <div class="pos__product-card-footer">
                    <span class="pos__product-price">-${valorDisplay}</span>
                    <span class="pos__product-stock">Una por venta</span>
                </div>
                <button class="pos__product-add" type="button" data-desc-id="${desc.id}">
                    <i class="fa-solid fa-tag"></i> Aplicar
                </button>
            `;

            div.addEventListener("click", () => {
                if (typeof aplicarDescuentoCarrito === "function") aplicarDescuentoCarrito(desc);
            });
            div.querySelector(".pos__product-add")?.addEventListener("click", event => {
                event.stopPropagation();
                if (typeof aplicarDescuentoCarrito === "function") aplicarDescuentoCarrito(desc);
            });
            posResults.appendChild(div);
        });
    } else {
        posUltimosDescuentos = [];
    }
}

function limpiarBusquedaPos() {
    const input = document.getElementById("pos-search");
    if (!input) return;
    input.value = "";
    filtrarYRenderizar();
    input.focus();
}

function agregarResultadoPosRapido() {
    const input = document.getElementById("pos-search");
    const texto = (input?.value || "").toLowerCase().trim();
    if (!texto) return;

    const exacto = posUltimosProductos.find(producto =>
        (producto.codigo || "").toLowerCase() === texto ||
        (producto.nombre || "").toLowerCase() === texto
    );
    const producto = exacto || (posUltimosProductos.length === 1 ? posUltimosProductos[0] : null);

    if (producto) {
        const agotado = producto.seguimientoInventario === "si" && producto.stock <= 0;
        if (agotado) {
            showToast("Ese producto esta sin stock.", { type: "warning" });
            return;
        }
        if (typeof agregarAlCarrito === "function") agregarAlCarrito(producto);
        limpiarBusquedaPos();
        return;
    }

    if (posUltimosDescuentos.length === 1 && typeof aplicarDescuentoCarrito === "function") {
        aplicarDescuentoCarrito(posUltimosDescuentos[0]);
        limpiarBusquedaPos();
        return;
    }

    showToast("Hay varios resultados. Toca el que vas a agregar.", { type: "info" });
}

function setValorInput(id, valor) {
    const input = document.getElementById(id);
    if (input) input.value = valor ?? "";
}

function capturarDraftEditorPos() {
    return {
        nombre: normalizarTextoPos(document.getElementById("pos-edit-nombre")?.value),
        categoria: normalizarTextoPos(document.getElementById("pos-edit-categoria")?.value),
        precio: Number(document.getElementById("pos-edit-precio")?.value) || 0,
        costo: Number(document.getElementById("pos-edit-costo")?.value) || 0,
        codigo: normalizarTextoPos(document.getElementById("pos-edit-codigo")?.value),
        seguimientoInventario: document.getElementById("pos-edit-seguimiento")?.value || "si",
        stock: Number.parseInt(document.getElementById("pos-edit-stock")?.value, 10) || 0
    };
}

function persistirDraftActualPos() {
    if (!posProductoEditandoId) return;
    posEditorDrafts[posProductoEditandoId] = capturarDraftEditorPos();
    guardarBorradoresPos();
    renderPosPausedDrafts();
    actualizarEstadoEditorEnTarjetas();
}

function abrirEditorProductoPos(id) {
    const producto = obtenerProductoPos(id);
    if (!producto) return;

    posProductoEditandoId = producto.id;
    const draft = obtenerDraftPos(producto.id);

    setValorInput("pos-edit-nombre", draft.nombre);
    setValorInput("pos-edit-categoria", draft.categoria);
    setValorInput("pos-edit-precio", draft.precio);
    setValorInput("pos-edit-costo", draft.costo);
    setValorInput("pos-edit-codigo", draft.codigo);
    setValorInput("pos-edit-stock", draft.stock);
    setValorInput("pos-edit-seguimiento", draft.seguimientoInventario || "si");

    const title = document.getElementById("pos-editor-title");
    const subtitle = document.getElementById("pos-editor-subtitle");
    const editor = document.getElementById("pos-editor");

    if (title) title.textContent = producto.nombre || "Editar producto";
    if (subtitle) {
        subtitle.textContent = posEditorDrafts[producto.id]
            ? "Continuando una edición pausada."
            : "Mantén los cambios aquí o pausalos para volver luego.";
    }

    if (editor) {
        editor.classList.remove("pos__editor--hidden");
        editor.setAttribute("aria-hidden", "false");
    }

    actualizarEstadoEditorEnTarjetas();
}

function ocultarEditorProductoPos() {
    const editor = document.getElementById("pos-editor");
    if (editor) {
        editor.classList.add("pos__editor--hidden");
        editor.setAttribute("aria-hidden", "true");
    }
    posProductoEditandoId = null;
    actualizarEstadoEditorEnTarjetas();
}

function pausarEditorProductoPos() {
    if (posProductoEditandoId) persistirDraftActualPos();
    ocultarEditorProductoPos();
}

function descartarEditorProductoPos() {
    if (!posProductoEditandoId) return;
    const id = posProductoEditandoId;
    delete posEditorDrafts[id];
    guardarBorradoresPos();
    ocultarEditorProductoPos();
    renderPosPausedDrafts();
    filtrarYRenderizar();
}

async function guardarEditorProductoPos() {
    if (!posProductoEditandoId) return;

    const id = posProductoEditandoId;
    const datos = capturarDraftEditorPos();
    const btn = document.getElementById("pos-editor-save");

    if (!datos.nombre || !datos.categoria || datos.precio <= 0) {
        showToast("Nombre, categoría y precio mayor a 0 son obligatorios.", { type: "warning" });
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.textContent = "Guardando...";
    }

    try {
        await apiRequest(`/productos/${encodeURIComponent(id)}`, {
            method: "PUT",
            body: JSON.stringify(datos)
        });

        delete posEditorDrafts[id];
        guardarBorradoresPos();
        ocultarEditorProductoPos();
        await cargarProductosDesdeAPI();
        if (typeof renderCarrito === "function") renderCarrito();
        showToast("Producto actualizado desde el POS.", { type: "success" });
    } catch (error) {
        console.error(error);
        showToast(error.message || "No se pudo actualizar el producto.", { type: "error" });
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = "Guardar cambios";
        }
    }
}

function actualizarCatalogo(productos) {
    catalogoProductos = productos;
    poblarSelectCategorias();
    renderPosCategoriaTiles();
    renderPosPausedDrafts();
    renderPosEditorCategoriaOptions();
}

function poblarSelectCategorias() {
    const posCatFilter = document.getElementById("pos-category-filter");
    const prodCatSelect = document.getElementById("prod-categoria");
    const categorias = obtenerCategoriasCatalogo();

    [posCatFilter, prodCatSelect].forEach(sel => {
        if (!sel) return;
        const valorActual = sel.value;
        const opts = sel.querySelectorAll("option:not([value=''])");
        opts.forEach(o => o.remove());
        categorias.forEach(cat => {
            const opt = document.createElement("option");
            opt.value = cat;
            opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
            sel.appendChild(opt);
        });
        if ([...sel.options].some(opt => opt.value === valorActual)) {
            sel.value = valorActual;
        }
    });
}
async function getDescuentos() {
    return apiRequest("/descuentos");
}

async function postDescuento(descuento) {
    const { id, createdAt, updatedAt, ...datos } = descuento;
    return apiRequest("/descuentos", {
        method: "POST",
        body: JSON.stringify(datos)
    });
}

async function putDescuento(id, descuento) {
    const { id: _id, createdAt, updatedAt, ...datos } = descuento;
    return apiRequest(`/descuentos/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(datos)
    });
}

async function deleteDescuento(id) {
    return apiRequest(`/descuentos/${encodeURIComponent(id)}`, { method: "DELETE" });
}

async function getVentasConFiltros(filtros = {}) {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") params.set(key, value);
    });
    const qs = params.toString();
    return apiRequest(`/ventas${qs ? "?" + qs : ""}`);
}

document.addEventListener("DOMContentLoaded", () => {
    cargarBorradoresPos();
    if (haySesionActiva()) {
        mostrarCargaProductos();
        cargarProductosDesdeAPI();
    }

    document.getElementById("pos-search")?.addEventListener("input", filtrarYRenderizar);
    document.getElementById("pos-search")?.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            agregarResultadoPosRapido();
        }
    });
    document.getElementById("pos-search-clear")?.addEventListener("click", limpiarBusquedaPos);
    document.getElementById("pos-category-filter")?.addEventListener("change", event => {
        posCategoriaActiva = event.target.value;
        filtrarYRenderizar();
    });
    document.getElementById("btn-guardar-prod")?.addEventListener("click", guardarProducto);

    [
        "pos-edit-nombre",
        "pos-edit-categoria",
        "pos-edit-precio",
        "pos-edit-costo",
        "pos-edit-codigo",
        "pos-edit-stock",
        "pos-edit-seguimiento"
    ].forEach(id => {
        const campo = document.getElementById(id);
        campo?.addEventListener("input", persistirDraftActualPos);
        campo?.addEventListener("change", persistirDraftActualPos);
    });

    document.getElementById("pos-editor-close")?.addEventListener("click", pausarEditorProductoPos);
    document.getElementById("pos-editor-pause")?.addEventListener("click", pausarEditorProductoPos);
    document.getElementById("pos-editor-discard")?.addEventListener("click", descartarEditorProductoPos);
    document.getElementById("pos-editor-save")?.addEventListener("click", guardarEditorProductoPos);
});
