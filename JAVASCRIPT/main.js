const productsContainer = document.querySelector("#products-container");

function renderProducts(productosArray) {
    productsContainer.innerHTML = "";

    if (productosArray.length === 0) {
        productsContainer.innerHTML = `
            <p class="products-empty">No se encontraron productos :(</p>
        `;
        return;
    }

    productosArray.forEach(producto => {
        const card = document.createElement("div");
        card.classList.add("product-card");
        card.setAttribute("data-id", producto.id);

        card.innerHTML = `
            <img src="../img/${producto.image}" alt="${producto.nombre}">
            <h3>${producto.nombre}</h3>
            <p class="product-card__price">$${producto.precio.toLocaleString("es-CO")}</p>
            <p class="product-card__desc">${producto.descripcion}</p>
            <p class="product-card__stock">Stock: <span class="stock-value">${producto.stock}</span></p>
            <button class="btn-add" data-id="${producto.id}">Agregar al carrito</button>
        `;

        productsContainer.appendChild(card);

        const addButton = card.querySelector(".btn-add");
        addButton.addEventListener("click", () => {
            agregarAlCarrito(producto);
            const prodActual = productos.find(p => p.id === producto.id);
            const stockSpan = card.querySelector(".stock-value");
            if (stockSpan) stockSpan.textContent = prodActual.stock;
        });
    });
}
