function ListarProductos () {
const contenedor = document.getElementById("productos-container");
contenedor.innerHTML = "";

productos.forEach(producto => {
    const item =document.createElement("div");
    item.classList.add("producto-item");
   item.innerHTML = `
    <div class="producto__item-info">
        <p class="producto__item-nombre">${producto.nombre}</p>
        <p class="producto__item-codigo">${producto.codigo || ""}</p>
    </div>
    <p class="producto__item-precio">$${producto.precio.toLocaleString("es-CO")}</p>
    <p class="producto__item-codigo">${producto.categoria}</p>
    <div class="producto__item-acciones">
        <button class="btn-editar" data-id="${producto.id}">
            <i class="fa-solid fa-pen-to-square"></i>
        </button>
        <button class="btn-eliminar-prod" data-id="${producto.id}">
            <i class="fa-solid fa-trash"></i>
        </button>
    </div>
`;
        contenedor.appendChild(item);
    });

 contenedor.querySelectorAll(".btn-eliminar-prod").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = parseInt(btn.dataset.id);
            eliminarProducto(id);
        });
    });

    contenedor.querySelectorAll(".btn-editar").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = parseInt(btn.dataset.id);
            editarProducto(id);
        });
    });
}

let productoEditandoId = null;

function eliminarProducto(id) {
    const confirmar = confirm("¿Estás seguro de eliminar este producto?");
    if (!confirmar) return;

    // filtra el array quitando el producto con ese id
    const index = productos.findIndex(p => p.id === id);
    productos.splice(index, 1);

    ListarProductos();
}

function editarProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;

    productoEditandoId = id;
    document.getElementById("prod-nombre").value = producto.nombre;
    document.getElementById("prod-precio").value = producto.precio;
    document.getElementById("prod-costo").value = producto.costo;
    document.getElementById("prod-codigo").value = producto.codigo;
    document.getElementById("prod-categoria").value = producto.categoria;
    document.getElementById("prod-stock").value = producto.stock;
    document.getElementById("prod-seguimiento").value = producto.seguimiento || "si";
    document.getElementById("form-title").textContent = "Editar Producto";
}

function eliminarProducto(id) {
    const confirmar = confirm("¿Estás seguro de eliminar este producto?");
    if (!confirmar) return;

    const index = productos.findIndex(p => p.id === id);
    productos.splice(index, 1);
    ListarProductos();
}

document.getElementById("btn-guardar-prod").addEventListener("click", () => {
    const nombre = document.getElementById("prod-nombre").value.trim();
    const precio = parseFloat(document.getElementById("prod-precio").value);
    const costo = parseFloat(document.getElementById("prod-costo").value);
    const codigo = document.getElementById("prod-codigo").value.trim();
    const categoria = document.getElementById("prod-categoria").value;
    const stock = parseInt(document.getElementById("prod-stock").value);
    const seguimiento = document.getElementById("prod-seguimiento").value;

    if (!nombre || !codigo || !categoria || isNaN(precio) || isNaN(costo) || isNaN(stock)) {
        alert("Por favor completa todos los campos obligatorios.");
        return;
    }

    if (precio <= 0 || costo <= 0 || stock < 0) {
        alert("Los valores numéricos deben ser positivos.");
        return;
    }

    if (productoEditandoId) {
        const index = productos.findIndex(p => p.id === productoEditandoId);
        if (index !== -1) {
            productos[index] = {
                ...productos[index],
                nombre, precio, costo, codigo, categoria, stock, seguimiento
            };
            productoEditandoId = null;
        }
    } else {
        const nuevoProducto = {
            id: Date.now(),
            nombre, precio, costo, codigo, categoria, stock, seguimiento,
            descripcion: "",
            image: ""
        };
        productos.push(nuevoProducto);
    }

    ListarProductos();
});

document.getElementById("btn-cancelar-prod").addEventListener("click", () => {
    productoEditandoId = null;
    document.getElementById("form-title").textContent = "Agregar Producto";
    document.getElementById("prod-nombre").value = "";
    document.getElementById("prod-precio").value = "";
    document.getElementById("prod-costo").value = "";
    document.getElementById("prod-codigo").value = "";
    document.getElementById("prod-categoria").value = "";
    document.getElementById("prod-stock").value = "";
    document.getElementById("prod-seguimiento").value = "si";
    document.getElementById("form-title").textContent = "Nuevo Producto";
});
