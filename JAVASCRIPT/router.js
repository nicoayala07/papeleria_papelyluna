// ── Router SPA ────────────────────────────────────────────────
function navegarA(nombreVista) {
    document.querySelectorAll(".vista").forEach(v => v.classList.remove("activa"));
    const vistaEl = document.getElementById("vista-" + nombreVista);
    if (vistaEl) vistaEl.classList.add("activa");

    document.querySelectorAll(".nav-btn[data-vista]").forEach(b => b.classList.remove("activa"));
    const btnActiva = document.querySelector(`[data-vista="${nombreVista}"]`);
    if (btnActiva) btnActiva.classList.add("activa");

    // Callbacks al entrar a cada vista
    if (nombreVista === "productos" && typeof ListarProductos === "function") ListarProductos();
    if (nombreVista === "historial" && typeof renderHistorial === "function") renderHistorial();
    if (nombreVista === "clientes" && typeof listarClientes === "function") listarClientes();
    if (nombreVista === "proveedores" && typeof listarProveedores === "function") listarProveedores();
    if (nombreVista === "categorias" && typeof listarCategorias === "function") listarCategorias();
    if (nombreVista === "compras" && typeof listarCompras === "function") listarCompras();
}

// Botones de la sidebar
document.querySelectorAll(".nav-btn[data-vista]").forEach(btn => {
    btn.addEventListener("click", () => navegarA(btn.dataset.vista));
});

// Volver desde factura al historial
document.getElementById("btn-volver-historial")?.addEventListener("click", () => navegarA("historial"));
