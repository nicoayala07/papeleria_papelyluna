function navegarA(nombreVista) {
    console.log("Intentando navegar a:", nombreVista);
    document.querySelectorAll(".vista").forEach(v => v.classList.remove("activa"));
    const vistaEl = document.getElementById("vista-" + nombreVista);
    if (vistaEl) vistaEl.classList.add("activa");

    document.querySelectorAll(".nav-btn[data-vista]").forEach(b => b.classList.remove("activa"));
    const btnActiva = document.querySelector(`[data-vista="${nombreVista}"]`);
    if (btnActiva) btnActiva.classList.add("activa");

    if (nombreVista === "productos" && typeof ListarProductos === "function") ListarProductos();
    if (nombreVista === "historial" && typeof renderHistorial === "function") renderHistorial();
    if (nombreVista === "clientes" && typeof cargarYListarClientes === "function") {
        cargarYListarClientes();
    }

    if (nombreVista === "proveedores" && typeof cargarYListarProveedores === "function") {
        cargarYListarProveedores();
    }
    if (nombreVista === "categorias" && typeof listarCategorias === "function") listarCategorias();
    if (nombreVista === "compras" && typeof listarCompras === "function") listarCompras();
    if (nombreVista === "faltantes" && typeof renderFaltantes === "function") renderFaltantes();
    if (nombreVista === "reportes" && typeof renderReportes === "function") renderReportes();
    if (nombreVista === "descuentos" && typeof cargarDescuentos === "function") cargarDescuentos();
}

function entrarAlPos() {
    const login = document.getElementById("vista-login");
    if (login) login.classList.add("oculto");
    navegarA("venta");
    document.getElementById("pos-search")?.focus();
    if (typeof cargarDescuentos === "function") cargarDescuentos();
}

function salirDelPos() {
    if (typeof limpiarSesionAuth === "function") limpiarSesionAuth();
    document.getElementById("vista-login")?.classList.remove("oculto");
    document.querySelectorAll(".vista").forEach(v => v.classList.remove("activa"));
    const passwordInput = document.getElementById("login-password");
    if (passwordInput) passwordInput.value = "";
    document.getElementById("login-username")?.focus();
}

function mostrarErrorLogin(message) {
    const errorEl = document.getElementById("login-error");
    const usernameInput = document.getElementById("login-username");
    const passwordInput = document.getElementById("login-password");

    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add("visible");
    }
    usernameInput?.classList.add("login--error-input");
    passwordInput?.classList.add("login--error-input");
}

function limpiarErrorLogin() {
    document.getElementById("login-error")?.classList.remove("visible");
    document.getElementById("login-username")?.classList.remove("login--error-input");
    document.getElementById("login-password")?.classList.remove("login--error-input");
}

document.querySelectorAll(".nav-btn[data-vista]").forEach(btn => {
    btn.addEventListener("click", () => navegarA(btn.dataset.vista));
});

document.getElementById("btn-logout")?.addEventListener("click", salirDelPos);

document.getElementById("btn-volver-historial")?.addEventListener("click", () => navegarA("historial"));

document.getElementById("login-form")?.addEventListener("submit", async event => {
    event.preventDefault();
    limpiarErrorLogin();

    const username = document.getElementById("login-username")?.value.trim();
    const password = document.getElementById("login-password")?.value;
    const btn = document.getElementById("btn-entrar-pos");

    if (!username || !password) {
        mostrarErrorLogin("Usuario y contrasena son requeridos.");
        return;
    }

    try {
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Entrando';
        }
        await loginApi(username, password);
        entrarAlPos();
        mostrarCargaProductos();
        await cargarProductosDesdeAPI();
    } catch (error) {
        mostrarErrorLogin(error.message || "No se pudo iniciar sesion.");
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-cash-register"></i> Entrar al POS';
        }
    }
});

if (typeof haySesionActiva === "function" && haySesionActiva()) {
    entrarAlPos();
} else {
    document.getElementById("login-username")?.focus();
}
