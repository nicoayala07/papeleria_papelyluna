let listaClientes = [];
let listaProveedores = [];

// --- CLIENTES ---
async function cargarYListarClientes() {
    const contenedor = document.getElementById("clientes-container");
    if (!contenedor) return;
    contenedor.innerHTML = "<p class='loading'>Cargando clientes...</p>";

    try {
        listaClientes = await getClientes();
        contenedor.innerHTML = "";

        if (listaClientes.length === 0) {
            contenedor.innerHTML = "<p>No hay clientes registrados.</p>";
            return;
        }

        listaClientes.forEach(cli => {
            const div = document.createElement("div");
            div.className = "producto-item";
            div.innerHTML = `
                <div class="producto__item-info">
                    <p class="producto__item-nombre">${cli.nombre || 'Sin Nombre'}</p>
                    <p class="producto__item-codigo">${cli.telefono || 'Sin teléfono'}</p>
                    <p style="font-size:0.8rem; color:#aaa;">${cli.email || ''}</p>
                </div>
                <div class="producto__item-acciones">
                    <button class="btn-eliminar" onclick="confirmarEliminacion('${cli.id}', 'clientes')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>`;
            contenedor.appendChild(div);
        });
    } catch (e) {
        contenedor.innerHTML = "<p>Error al conectar con la base de datos.</p>";
        console.error(e);
    }
}

// --- PROVEEDORES (Ya te funcionaba, pero lo unificamos) ---
async function cargarYListarProveedores() {
    const contenedor = document.getElementById("proveedores-container");
    if (!contenedor) return;
    contenedor.innerHTML = "<p class='loading'>Cargando proveedores...</p>";

    try {
        listaProveedores = await getProveedores();
        contenedor.innerHTML = "";

        if (listaProveedores.length === 0) {
            contenedor.innerHTML = "<p>No hay proveedores registrados.</p>";
            return;
        }

        listaProveedores.forEach(prov => {
            const div = document.createElement("div");
            div.className = "producto-item";
            div.innerHTML = `
                <div class="producto__item-info">
                    <p class="producto__item-nombre">${prov.nombre}</p>
                    <p class="producto__item-codigo">${prov.telefono || 'Sin teléfono'}</p>
                    <p style="font-size:0.8rem; color:#aaa;">${prov.email || ''}</p>
                </div>
                <div class="producto__item-acciones">
                    <button class="btn-eliminar" onclick="confirmarEliminacion('${prov.id}', 'proveedores')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>`;
            contenedor.appendChild(div);
        });
    } catch (e) {
        contenedor.innerHTML = "<p>Error al conectar con la base de datos.</p>";
    }
}

// --- EVENTOS DE GUARDADO ---
document.getElementById("btn-guardar-cliente")?.addEventListener("click", async () => {
    const btn = document.getElementById("btn-guardar-cliente");
    const nuevo = {
        id: Date.now().toString(),
        nombre: document.getElementById("cliente-nombre").value,
        telefono: document.getElementById("cliente-telefono").value,
        email: document.getElementById("cliente-correo").value,
        debe: 0
    };

    if (!nuevo.nombre) return alert("El nombre es obligatorio");

    btn.disabled = true;
    btn.innerText = "Guardando...";

    if (await postCliente(nuevo)) {
        alert("Cliente guardado");
        document.getElementById("clientes-form").style.display = "none";
        document.getElementById("cliente-nombre").value = "";
        document.getElementById("cliente-telefono").value = "";
        document.getElementById("cliente-correo").value = "";
        cargarYListarClientes();
    }
    btn.disabled = false;
    btn.innerText = "Guardar";
});

// --- ELIMINACIÓN ---
async function confirmarEliminacion(id, hoja) {
    if (confirm("¿Deseas eliminar este registro?")) {
        if (await eliminarEntidad(id, hoja)) {
            alert("Eliminado con éxito");
            hoja === 'clientes' ? cargarYListarClientes() : cargarYListarProveedores();
        }
    }
}