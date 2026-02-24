function navegarA(nombreVista){
    document.querySelectorAll(".vista").forEach(v => v.classList.remove("activa"));

    document.getElementById("vista"+nombreVista).classList.add("activa");

    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("activa"));
    
    const btnActiva= document.querySelector('[data-vista="${nombreVista}"]');
    btnActiva.classList.add("activa");
}
document.querySelectorAll(".nav-btn[data-vista]").forEach(btn => {
    btn.addEventListener("click", () => {
        navegarA(btn.dataset.vista);
    });
});

document.getElementById("btn-ver-catalogo").addEventListener("click", () => {
    navegarA("ventas");})
document,getElementById("btn-ver-historial").addEventListener("click", () => {
    navegarA("carrito");})
document.getElementById("btn-ver-todo").addEventListener("click", () => {
    navegarA("contacto");})
document.getElementById("btn-volver-historial").addEventListener("click", () => {
    navegarA("contacto");})

document.getElementById("btn-cerrar-buscardor").addEventListener("click", () => {
    navegarA("ventas