const CONFIG_CAMPOS = ["nombreNegocio", "nit", "direccion", "telefono", "logoUrl"];
let configuracionFacturaCache = null;

function setConfigInput(campo, valor) {
    const input = document.getElementById(`config-${campo}`);
    if (input) input.value = valor || "";
}

function getConfigInput(campo) {
    return document.getElementById(`config-${campo}`)?.value.trim() || "";
}

function renderLogoConfiguracion(url) {
    const preview = document.getElementById("config-logo-preview");
    if (!preview) return;

    preview.innerHTML = url
        ? `<img src="${url}" alt="Logo del negocio">`
        : "<span>Sin logo configurado</span>";
}

async function cargarConfiguracion() {
    try {
        const config = await getConfiguracionNegocio();
        CONFIG_CAMPOS.forEach(campo => setConfigInput(campo, config?.[campo]));
        renderLogoConfiguracion(config?.logoUrl);
        configuracionFacturaCache = config || null;
    } catch (error) {
        console.error(error);
        showToast("No se pudo cargar la configuracion.", { type: "error" });
    }
}

async function guardarConfiguracion() {
    const btn = document.getElementById("btn-guardar-configuracion");
    const payload = CONFIG_CAMPOS.reduce((acc, campo) => {
        acc[campo] = getConfigInput(campo);
        return acc;
    }, {});

    try {
        if (btn) {
            btn.disabled = true;
            btn.textContent = "Guardando...";
        }
        configuracionFacturaCache = await putConfiguracionNegocio(payload);
        renderLogoConfiguracion(configuracionFacturaCache?.logoUrl);
        showToast("Configuracion guardada correctamente.", { type: "success" });
    } catch (error) {
        console.error(error);
        showToast("No se pudo guardar la configuracion.", { type: "error" });
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar';
        }
    }
}

async function obtenerConfiguracionFactura() {
    if (configuracionFacturaCache) return configuracionFacturaCache;

    try {
        configuracionFacturaCache = await getConfiguracionNegocio();
    } catch (error) {
        configuracionFacturaCache = {};
    }

    return configuracionFacturaCache || {};
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn-guardar-configuracion")?.addEventListener("click", guardarConfiguracion);
    document.getElementById("config-logoUrl")?.addEventListener("input", event => {
        renderLogoConfiguracion(event.target.value.trim());
    });
});

window.cargarConfiguracion = cargarConfiguracion;
window.obtenerConfiguracionFactura = obtenerConfiguracionFactura;
