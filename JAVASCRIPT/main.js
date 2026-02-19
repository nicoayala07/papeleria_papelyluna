const productsContainer = document.querySelector("#products-container");

export function renderProducts(productosArray) {
  productsContainer.innerHTML = "";

  productosArray.forEach(producto => {
    const card = document.createElement("div");

    card.innerHTML = `
  <img src="../img/${producto.image}" alt="${producto.nombre}">
  <h3>${producto.nombre}</h3>
  <p>$${producto.precio}</p>
  <button class="btn-add" data-id="${producto.id}">
    Agregar al carrito
  </button>
    `;

    productsContainer.appendChild(card);

    const addButton = card.querySelector(".btn-add");

addButton.addEventListener("click", () => {
  console.log("Producto agregado:", producto.id);
});

  });
}
