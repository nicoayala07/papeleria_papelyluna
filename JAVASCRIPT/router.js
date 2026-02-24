document.querySelectorAll(".nav-btn[data-vista]").forEach(btn => {
    btn.addEventListener("click", () => {
        navegarA(btn.dataset.vista);
    });
});
function navegarA(nombreVista){
    document.querySelectorAll(".vista").forEach(v => v.classList.remove("activa"));

    document.getElementById("vista"+nombreVista).classList.add("activa");

    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("activa"));
    
    const btnActiva= document.querySelector('[data-vista="${nombreVista}"]');
    btnActiva.classList.add("activa");

}