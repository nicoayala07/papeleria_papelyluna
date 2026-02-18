const productsContainer = document.querySelector("#products-container");

export function renderProducts(productosArray) {
  productsContainer.innerHTML = "";

  productosArray.forEach(producto => {
    const card = document.createElement("div");

    card.innerHTML = `
      <img src="./img/${producto.image}" alt="${producto.nombre}">
      <h3>${producto.nombre}</h3>
      <p>$${producto.precio}</p>
    `;

    productsContainer.appendChild(card);
  });
}
