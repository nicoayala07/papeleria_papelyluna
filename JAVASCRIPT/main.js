import { agregarAlCarrito } from "./carrito.js";

const productsContainer = document.querySelector("#products-container"); // Contenedor donde se mostrarán los productos

export function renderProducts(productosArray) {  // Función para renderizar los productos en el DOM
  productsContainer.innerHTML = ""; 

  productosArray.forEach(producto => { 
    const card = document.createElement("div"); // Crear un elemento div para cada producto

    card.innerHTML = `                             
  <img src="../img/${producto.image}" alt="${producto.nombre}">     
  <h3>${producto.nombre}</h3>
  <p>$${producto.precio}</p>
  <p>${producto.descripcion}</p>
  <button class="btn-add" data-id="${producto.id}"> 
    Agregar al carrito
  </button>
    `;

    productsContainer.appendChild(card); // Agregar el producto al contenedor


    const addButton = card.querySelector(".btn-add"); // Seleccionar el botón de agregar al carrito dentro de la tarjeta del producto

addButton.addEventListener("click", () => {
   agregarAlCarrito(producto);
});

  });
}
