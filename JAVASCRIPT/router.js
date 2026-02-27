function navegarA(nombreVista){
    document.querySelectorAll(".vista").forEach(v => v.classList.remove("activa"));

    document.getElementById("vista-" + nombreVista).classList.add("activa");

    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("activa"));
    const btnActiva = document.querySelector(`[data-vista="${nombreVista}"]`);
    if (btnActiva) btnActiva.classList.add("activa");

    if (nombreVista === "productos") ListarProductos();

    if (nombreVista === "ventas" && typeof renderProducts === "function") renderProducts(productos);

    // Refresca el historial cada vez que entras a esa vista
    if (nombreVista === "historial") renderHistorial();
}

document.querySelectorAll(".nav-btn[data-vista]").forEach(btn => {
    btn.addEventListener("click", () => {
        navegarA(btn.dataset.vista);
    });
});

function cerrarBuscador(reiniciar = true) {
    const overlay = document.getElementById("search-overlay");
    const input = document.getElementById("search-input");

    overlay.classList.remove("activa");

    if (reiniciar) {
        input.value = "";
        input.dispatchEvent(new Event("input", { bubbles: true }));
    }
}

document.getElementById("search-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const termino = e.target.value.toLowerCase().trim();
        navegarA("ventas");

        if (termino) {
            const filtrados = productos.filter(p => 
                p.nombre.toLowerCase().includes(termino) || 
                p.categoria.toLowerCase().includes(termino)
            );
            renderProducts(filtrados);
        }

        cerrarBuscador(true);
    } else if (e.key === "Escape") {
        cerrarBuscador(true);
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

document.getElementById("btn-cerrar-buscador").addEventListener("click", ()=> {
    cerrarBuscador(true);
});

document.getElementById("search-overlay").addEventListener("click", (e) => {
    if (e.target.id === "search-overlay") {
        cerrarBuscador(true);
    }
});
