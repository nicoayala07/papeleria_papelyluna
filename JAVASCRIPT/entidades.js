let listaClientes = [];
let listaProveedores = [];

// --- CLIENTES ---
async function cargarYListarClientes() {
    const contenedor = document.getElementById("clientes-container");
    if (!contenedor) return;
    contenedor.innerHTML = "<p>Cargando clientes...</p>";

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
                <p class="producto__item-nombre">${cli.nombre}</p>
                <p class="producto__item-codigo">${cli.telefono || 'Sin teléfono'}</p>
            </div>
            <div class="producto__item-acciones">
                <button class="btn-editar" onclick="prepararEdicion('clientes', '${cli.id}')" style="color: #4db8ff; background:none; border:none; cursor:pointer; margin-right:10px;">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn-eliminar" onclick="window.confirmarEliminacion('${cli.id}', 'clientes')">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>`;
        contenedor.appendChild(div);
    });
}

// --- PROVEEDORES ---
async function cargarYListarProveedores() {
    const contenedor = document.getElementById("proveedores-container");
    if (!contenedor) return;
    contenedor.innerHTML = "<p>Cargando proveedores...</p>";

    listaProveedores = await getProveedores();
    contenedor.innerHTML = "";

    listaProveedores.forEach(prov => {
        const div = document.createElement("div");
        div.className = "producto-item";
        div.innerHTML = `
            <div class="producto__item-info">
                <p class="producto__item-nombre">${prov.nombre}</p>
                <p class="producto__item-codigo">NIT: ${prov.nit || 'N/A'}</p>
            </div>
            <div class="producto__item-acciones">
                <button class="btn-editar" onclick="prepararEdicion('proveedores', '${prov.id}')" style="color: #4db8ff; background:none; border:none; cursor:pointer; margin-right:10px;">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn-eliminar" onclick="window.confirmarEliminacion('${prov.id}', 'proveedores')">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>`;
        contenedor.appendChild(div);
    });
}

// --- LÓGICA DE EDICIÓN ---
function prepararEdicion(entidad, id) {
    const lista = (entidad === 'clientes') ? listaClientes : listaProveedores;
    const item = lista.find(i => i.id == id);

    if (item) {
        if (entidad === 'clientes') {
            document.getElementById("cliente-nombre").value = item.nombre;
            document.getElementById("cliente-telefono").value = item.telefono;
            document.getElementById("cliente-correo").value = item.email || '';
            document.getElementById("cliente-form-title").innerText = "Editar Cliente";
            document.getElementById("btn-guardar-cliente").dataset.editId = id;
            document.getElementById("btn-guardar-cliente").innerText = "Actualizar";
        } else {
            document.getElementById("prov-nombre").value = item.nombre;
            document.getElementById("prov-nit").value = item.nit;
            document.getElementById("prov-telefono").value = item.telefono;
            document.getElementById("prov-form-title").innerText = "Editar Proveedor";
            document.getElementById("btn-guardar-prov").dataset.editId = id;
            document.getElementById("btn-guardar-prov").innerText = "Actualizar";
        }
    }
}

// --- GUARDAR CLIENTE ---
document.getElementById("btn-guardar-cliente")?.addEventListener("click", async () => {
    const btn = document.getElementById("btn-guardar-cliente");
    const editId = btn.dataset.editId;

    const datos = {
        id: editId || Date.now().toString(),
        nombre: document.getElementById("cliente-nombre").value,
        telefono: document.getElementById("cliente-telefono").value,
        email: document.getElementById("cliente-correo").value
    };

    if (await postCliente(datos)) {
        alert(editId ? "Cliente actualizado" : "Cliente guardado");
        resetFormulariosEntidades();
        cargarYListarClientes();
    }
});

function resetFormulariosEntidades() {
    document.getElementById("cliente-nombre").value = "";
    document.getElementById("cliente-telefono").value = "";
    document.getElementById("cliente-correo").value = "";
    document.getElementById("btn-guardar-cliente").innerText = "Guardar";
    delete document.getElementById("btn-guardar-cliente").dataset.editId;

    document.getElementById("prov-nombre").value = "";
    document.getElementById("prov-nit").value = "";
    document.getElementById("prov-telefono").value = "";
    document.getElementById("btn-guardar-prov").innerText = "Guardar";
    delete document.getElementById("btn-guardar-prov").dataset.editId;
}