let posRapidoTipo = null;

function posRapidoValor(id) {
    return (document.getElementById(id)?.value || "").toString().trim();
}

function posRapidoNumero(id) {
    return Number(document.getElementById(id)?.value) || 0;
}

function posRapidoCategoriasOptions() {
    const nombres = typeof obtenerNombresCategorias === "function"
        ? obtenerNombresCategorias()
        : [...new Set((catalogoProductos || []).map(p => p.categoria).filter(Boolean))];

    return nombres.map(nombre => `<option value="${nombre}">${nombre}</option>`).join("");
}

function abrirPosRapido(tipo) {
    posRapidoTipo = tipo;
    const modal = document.getElementById("modal-pos-rapido");
    const title = document.getElementById("pos-rapido-title");
    const body = document.getElementById("pos-rapido-body");
    const busqueda = posRapidoValor("pos-search");

    if (!modal || !title || !body) return;

    const titulos = {
        producto: "Nuevo producto",
        cliente: "Nuevo cliente",
        proveedor: "Nuevo proveedor",
        descuento: "Nuevo descuento",
        categoria: "Nueva categoria",
        faltante: "Registrar faltante"
    };

    title.textContent = titulos[tipo] || "Accion rapida";
    body.innerHTML = renderPosRapidoForm(tipo, busqueda);
    modal.classList.add("activa");

    const primerInput = body.querySelector("input, select, textarea");
    primerInput?.focus();
}

function cerrarPosRapido() {
    document.getElementById("modal-pos-rapido")?.classList.remove("activa");
    document.getElementById("pos-rapido-body").innerHTML = "";
    posRapidoTipo = null;
}

function renderPosRapidoForm(tipo, busqueda) {
    if (tipo === "producto") {
        return `
            <div class="form__group">
                <label>Nombre</label>
                <input type="text" id="qr-prod-nombre" value="${busqueda}" placeholder="Nombre del producto">
            </div>
            <div class="form__group">
                <label>Categoria</label>
                <select id="qr-prod-categoria" class="filter-select">
                    <option value="">Selecciona una categoria</option>
                    ${posRapidoCategoriasOptions()}
                </select>
            </div>
            <div class="form__group form__group--row">
                <div>
                    <label>Precio</label>
                    <input type="number" id="qr-prod-precio" min="1" placeholder="0">
                </div>
                <div>
                    <label>Costo</label>
                    <input type="number" id="qr-prod-costo" min="0" placeholder="0">
                </div>
            </div>
            <div class="form__group form__group--row">
                <div>
                    <label>Codigo</label>
                    <input type="text" id="qr-prod-codigo" placeholder="Codigo interno">
                </div>
                <div>
                    <label>Stock</label>
                    <input type="number" id="qr-prod-stock" min="0" value="1">
                </div>
            </div>
            <div class="form__group">
                <label>Inventario</label>
                <select id="qr-prod-seguimiento" class="filter-select">
                    <option value="si">Con seguimiento</option>
                    <option value="no">Sin seguimiento</option>
                </select>
            </div>
        `;
    }

    if (tipo === "cliente") {
        return `
            <div class="form__group">
                <label>Nombre</label>
                <input type="text" id="qr-cliente-nombre" placeholder="Nombre completo">
            </div>
            <div class="form__group">
                <label>Telefono</label>
                <input type="text" id="qr-cliente-telefono" placeholder="Numero de contacto">
            </div>
            <div class="form__group">
                <label>Correo</label>
                <input type="email" id="qr-cliente-correo" placeholder="correo@ejemplo.com">
            </div>
        `;
    }

    if (tipo === "proveedor") {
        return `
            <div class="form__group">
                <label>Nombre</label>
                <input type="text" id="qr-prov-nombre" placeholder="Nombre del proveedor">
            </div>
            <div class="form__group">
                <label>NIT</label>
                <input type="text" id="qr-prov-nit" placeholder="NIT o documento">
            </div>
            <div class="form__group">
                <label>Telefono</label>
                <input type="text" id="qr-prov-telefono" placeholder="Numero de contacto">
            </div>
        `;
    }

    if (tipo === "descuento") {
        return `
            <div class="form__group">
                <label>Nombre</label>
                <input type="text" id="qr-desc-nombre" value="${busqueda}" placeholder="Ej: Descuento estudiante">
            </div>
            <div class="form__group">
                <label>Tipo</label>
                <select id="qr-desc-tipo" class="filter-select">
                    <option value="porcentaje">Porcentaje (%)</option>
                    <option value="fijo">Valor fijo ($)</option>
                </select>
            </div>
            <div class="form__group">
                <label>Valor</label>
                <input type="number" id="qr-desc-valor" min="0" placeholder="Ej: 10">
            </div>
        `;
    }

    if (tipo === "categoria") {
        return `
            <div class="form__group">
                <label>Nombre</label>
                <input type="text" id="qr-cat-nombre" value="${busqueda}" placeholder="Nombre de la categoria">
            </div>
            <div class="form__group">
                <label>Color</label>
                <input type="color" id="qr-cat-color" value="#6d28d9">
            </div>
        `;
    }

    if (tipo === "faltante") {
        return `
            <div class="form__group">
                <label>Producto</label>
                <input type="text" id="qr-faltante-nombre" value="${busqueda}" placeholder="Producto faltante">
            </div>
            <div class="form__group">
                <label>Tipo</label>
                <select id="qr-faltante-tipo" class="filter-select">
                    <option value="no_registrado">No registrado</option>
                    <option value="agotado">Agotado</option>
                </select>
            </div>
            <div class="form__group">
                <label>Cantidad solicitada</label>
                <input type="number" id="qr-faltante-cantidad" min="0" placeholder="Opcional">
            </div>
            <div class="form__group">
                <label>Observacion</label>
                <textarea id="qr-faltante-observacion" rows="3" placeholder="Detalle opcional"></textarea>
            </div>
        `;
    }

    return "";
}

async function guardarPosRapido() {
    const btn = document.getElementById("pos-rapido-save");
    if (!posRapidoTipo || !btn) return;

    btn.disabled = true;
    btn.textContent = "Guardando...";

    try {
        let guardado = true;
        if (posRapidoTipo === "producto") guardado = await guardarProductoRapido();
        if (posRapidoTipo === "cliente") guardado = await guardarClienteRapido();
        if (posRapidoTipo === "proveedor") guardado = await guardarProveedorRapido();
        if (posRapidoTipo === "descuento") guardado = await guardarDescuentoRapido();
        if (posRapidoTipo === "categoria") guardado = await guardarCategoriaRapida();
        if (posRapidoTipo === "faltante") guardado = await guardarFaltanteRapido();
        if (guardado === false) return;
        cerrarPosRapido();
    } catch (error) {
        console.error(error);
        const mensaje = error.response?.errors?.[0]?.msg || error.message || "No se pudo guardar.";
        showToast(mensaje, { type: "error" });
    } finally {
        btn.disabled = false;
        btn.textContent = "Guardar";
    }
}

async function guardarProductoRapido() {
    const producto = {
        nombre: posRapidoValor("qr-prod-nombre"),
        categoria: posRapidoValor("qr-prod-categoria"),
        precio: posRapidoNumero("qr-prod-precio"),
        costo: posRapidoNumero("qr-prod-costo"),
        codigo: posRapidoValor("qr-prod-codigo"),
        seguimientoInventario: posRapidoValor("qr-prod-seguimiento") || "si",
        stock: Number.parseInt(document.getElementById("qr-prod-stock")?.value, 10) || 0
    };

    if (!producto.nombre || !producto.categoria || producto.precio <= 0) {
        showToast("Nombre, categoria y precio mayor a 0 son obligatorios.", { type: "warning" });
        return false;
    }

    const creado = await apiRequest("/productos", {
        method: "POST",
        body: JSON.stringify(producto)
    });

    await cargarProductosDesdeAPI();
    document.getElementById("pos-search").value = creado?.nombre || producto.nombre;
    if (typeof filtrarYRenderizar === "function") filtrarYRenderizar();
    showToast("Producto creado desde la venta.", { type: "success" });
    return true;
}

async function guardarClienteRapido() {
    const cliente = {
        nombre: posRapidoValor("qr-cliente-nombre"),
        telefono: posRapidoValor("qr-cliente-telefono"),
        email: posRapidoValor("qr-cliente-correo"),
        debe: 0
    };

    if (!cliente.nombre) {
        showToast("El nombre del cliente es obligatorio.", { type: "warning" });
        return false;
    }

    const creado = await postCliente(cliente);
    if (typeof cargarYListarClientes === "function") await cargarYListarClientes();
    const select = document.getElementById("cobro-cliente");
    if (select && creado?.id) select.value = creado.id;
    showToast("Cliente creado.", { type: "success" });
    return true;
}

async function guardarProveedorRapido() {
    const proveedor = {
        nombre: posRapidoValor("qr-prov-nombre"),
        nit: posRapidoValor("qr-prov-nit"),
        telefono: posRapidoValor("qr-prov-telefono")
    };

    if (!proveedor.nombre || !proveedor.nit) {
        showToast("Nombre y NIT del proveedor son obligatorios.", { type: "warning" });
        return false;
    }

    await postProveedor(proveedor);
    if (typeof cargarYListarProveedores === "function") await cargarYListarProveedores();
    showToast("Proveedor creado.", { type: "success" });
    return true;
}

async function guardarDescuentoRapido() {
    const descuento = {
        nombre: posRapidoValor("qr-desc-nombre"),
        tipo: posRapidoValor("qr-desc-tipo") || "porcentaje",
        valor: posRapidoNumero("qr-desc-valor")
    };

    if (!descuento.nombre || descuento.valor < 0 || (descuento.tipo === "porcentaje" && descuento.valor > 100)) {
        showToast("Revisa nombre, tipo y valor del descuento.", { type: "warning" });
        return false;
    }

    const creado = await postDescuento(descuento);
    if (typeof cargarDescuentos === "function") await cargarDescuentos();
    if (typeof aplicarDescuentoCarrito === "function") aplicarDescuentoCarrito(creado);
    return true;
}

async function guardarCategoriaRapida() {
    const categoria = {
        nombre: posRapidoValor("qr-cat-nombre"),
        color: posRapidoValor("qr-cat-color") || "#6d28d9"
    };

    if (!categoria.nombre) {
        showToast("El nombre de la categoria es obligatorio.", { type: "warning" });
        return false;
    }

    const creada = await postCategoria(categoria);
    if (typeof listarCategorias === "function") await listarCategorias();
    if (typeof sincronizarSelectsCategorias === "function") sincronizarSelectsCategorias();
    const filtro = document.getElementById("pos-category-filter");
    if (filtro && creada?.nombre) filtro.value = creada.nombre;
    showToast("Categoria creada.", { type: "success" });
    return true;
}

async function guardarFaltanteRapido() {
    const faltante = {
        nombreProducto: posRapidoValor("qr-faltante-nombre"),
        tipo: posRapidoValor("qr-faltante-tipo") || "no_registrado",
        cantidad: Number.parseInt(document.getElementById("qr-faltante-cantidad")?.value, 10) || null,
        observacion: posRapidoValor("qr-faltante-observacion")
    };

    if (!faltante.nombreProducto) {
        showToast("Indica el producto faltante.", { type: "warning" });
        return false;
    }

    await postFaltante(faltante);
    if (typeof renderFaltantes === "function") renderFaltantes();
    showToast("Faltante registrado.", { type: "success" });
    return true;
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-pos-quick]").forEach(btn => {
        btn.addEventListener("click", () => abrirPosRapido(btn.dataset.posQuick));
    });

    document.getElementById("pos-rapido-close")?.addEventListener("click", cerrarPosRapido);
    document.getElementById("pos-rapido-cancel")?.addEventListener("click", cerrarPosRapido);
    document.getElementById("pos-rapido-save")?.addEventListener("click", guardarPosRapido);
});
