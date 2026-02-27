const productsContainer = document.querySelector("#products-container");
const featuredContainer = document.querySelector("#featured-container");

// ─── CATÁLOGO (vista ventas) ───────────────────────────────────────────────
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

        card.querySelector(".btn-add").addEventListener("click", () => {
            agregarAlCarrito(producto);
            const prodActual = productos.find(p => p.id === producto.id);
            const stockSpan = card.querySelector(".stock-value");
            if (stockSpan) stockSpan.textContent = prodActual.stock;
        });
    });
}

// ─── PRODUCTOS DESTACADOS (vista inicio) ──────────────────────────────────
// Toma los primeros N productos (uno por categoría para variedad)
function renderFeatured() {
    if (!featuredContainer) return;

    // Una muestra representativa: el primer producto de cada categoría
    const categorias = [...new Set(productos.map(p => p.categoria))];
    const destacados = categorias.map(cat =>
        productos.find(p => p.categoria === cat)
    ).slice(0, 8); // máximo 8 tarjetas

    featuredContainer.innerHTML = "";

    destacados.forEach(producto => {
        const card = document.createElement("div");
        card.classList.add("featured__card");

        card.innerHTML = `
            <div class="featured__card-img">
                <img src="../img/${producto.image}" alt="${producto.nombre}">
            </div>
            <div class="featured__card-info">
                <p class="featured__card-categoria">${producto.categoria}</p>
                <p class="featured__card-nombre">${producto.nombre}</p>
                <p class="featured__card-precio">$${producto.precio.toLocaleString("es-CO")}</p>
            </div>
        `;

        // Al hacer clic navega al catálogo
        card.addEventListener("click", () => {
            document.querySelector('[data-vista="ventas"]').click();
        });

        featuredContainer.appendChild(card);
    });
}