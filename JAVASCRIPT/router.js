function navegarA(nombreVista) {
    document.querySelectorAll(".vista").forEach(v => v.classList.remove("activa"));
    document.getElementById("vista-" + nombreVista).classList.add("activa");

    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("activa"));
    const btnActiva = document.querySelector(`[data-vista="${nombreVista}"]`);
    if (btnActiva) btnActiva.classList.add("activa");

    // Refresca el historial cada vez que entras a esa vista
    if (nombreVista === "historial") renderHistorial();
}

document.querySelectorAll(".nav-btn[data-vista]").forEach(btn => {
    btn.addEventListener("click", () => {
        navegarA(btn.dataset.vista);
    });
});

document.getElementById("search-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === "Escape") {
        navegarA("ventas");
        document.getElementById("search-overlay").classList.remove("activa");
    }
});

document.getElementById("btn-ver-catalogo").addEventListener("click", () => navegarA("ventas"));
document.getElementById("btn-ver-historial").addEventListener("click", () => navegarA("historial"));
document.getElementById("btn-ver-todo").addEventListener("click", () => navegarA("ventas"));
document.getElementById("btn-volver-historial").addEventListener("click", () => navegarA("historial"));

document.getElementById("btn-buscador").addEventListener("click", () => {
    const overlay = document.getElementById("search-overlay");
    overlay.classList.toggle("activa");
    if (overlay.classList.contains("activa")) {
        document.getElementById("search-input").focus();
    }
});

document.getElementById("btn-cerrar-buscador").addEventListener("click", () => {
    document.getElementById("search-overlay").classList.remove("activa");
});