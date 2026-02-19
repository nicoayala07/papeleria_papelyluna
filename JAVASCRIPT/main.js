import { agregarAlCarrito } from "./carrito.js";

const productsContainer = document.querySelector("#products-container");

export function renderProducts(productosArray) {
  productsContainer.innerHTML = "";

  productosArray.forEach(producto => {
    const card = document.createElement("div");
    card.classList.add("product-card"); // ✅ clase CSS agregada

    card.innerHTML = `
      <img src="../img/${producto.image}" alt="${producto.nombre}">
      <h3>${producto.nombre}</h3>
      <p class="product-card__price">$${producto.precio.toLocaleString("es-CO")}</p>
      <p class="product-card__desc">${producto.descripcion}</p>
      <button class="btn-add" data-id="${producto.id}">
        Agregar al carrito
      </button>
    `;

    productsContainer.appendChild(card); // Agregar el producto al contenedor


    const addButton = card.querySelector(".btn-add"); // Seleccionar el botón de agregar al carrito dentro de la tarjeta del producto

addButton.addEventListener("click", () => {
  console.log("CLICK OK:", producto.nombre);
  agregarAlCarrito(producto);
});


  });
}