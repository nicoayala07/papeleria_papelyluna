const SIDEBAR_STORAGE_KEY = "papelYLuna.sidebarOculta";

function aplicarEstadoSidebar(oculta) {
    document.body.classList.toggle("sidebar-oculta", oculta);
    localStorage.setItem(SIDEBAR_STORAGE_KEY, oculta ? "1" : "0");
}

document.addEventListener("DOMContentLoaded", () => {
    const estadoGuardado = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    const ocultarPorDefecto = window.matchMedia("(max-width: 700px)").matches && estadoGuardado === null;
    aplicarEstadoSidebar(estadoGuardado === "1" || ocultarPorDefecto);

    document.getElementById("btn-sidebar-hide")?.addEventListener("click", () => {
        aplicarEstadoSidebar(true);
    });

    document.getElementById("btn-sidebar-show")?.addEventListener("click", () => {
        aplicarEstadoSidebar(false);
    });
});
