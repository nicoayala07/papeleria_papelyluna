let listaCategorias = [];

// --- LISTAR CATEGORÍAS ---
async function cargarYListarCategorias() {
    const contenedor = document.getElementById("categorias-container");
    if (!contenedor) return;

    contenedor.innerHTML = "<p>Cargando categorías...</p>";
    listaCategorias = await getCategorias();
    contenedor.innerHTML = "";

    if (listaCategorias.length === 0) {
        contenedor.innerHTML = "<p>No hay categorías registradas.</p>";
        return;
    }

    listaCategorias.forEach(cat => {
        const div = document.createElement("div");
        div.className = "producto-item";
        // CORRECCIÓN: Aplicar el color guardado al borde
        div.style.borderLeft = `8px solid ${cat.color || '#6d28d9'}`;

        div.innerHTML = `
            <div class="producto__item-info">
                <p class="producto__item-nombre">
                    <span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:${cat.color || '#6d28d9'}; margin-right:8px;"></span>
                    ${cat.nombre}
                </p>
            </div>
            <div class="producto__item-acciones">
                <button class="btn-eliminar" onclick="window.confirmarEliminacion('${cat.id}', 'categorias')">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>`;
        contenedor.appendChild(div);
    });
}

// --- GUARDAR CATEGORÍA ---
document.getElementById("btn-guardar-cat")?.addEventListener("click", async () => {
    const nombre = document.getElementById("cat-nombre").value;
    const color = document.getElementById("cat-color").value; // Captura el valor del input color

    if (!nombre) return alert("El nombre es obligatorio");

    const nuevaCat = {
        id: Date.now().toString(),
        nombre: nombre,
        color: color // CORRECCIÓN: Se envía el color seleccionado
    };

    const btn = document.getElementById("btn-guardar-cat");
    btn.disabled = true;
    btn.innerText = "Guardando...";

    if (await postCategoria(nuevaCat)) {
        alert("Categoría guardada");
        document.getElementById("cat-nombre").value = "";
        // Opcional: resetear color por defecto
        document.getElementById("cat-color").value = "#6d28d9";
        cargarYListarCategorias();
    }

    btn.disabled = false;
    btn.innerText = "Guardar";
});

document.getElementById("btn-cancelar-cat")?.addEventListener("click", () => {
    document.getElementById("categorias-form").style.display = "none";
});