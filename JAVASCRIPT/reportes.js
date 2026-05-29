function monedaReporte(valor) {
    return "$" + (Number(valor) || 0).toLocaleString("es-CO");
}

function setFechasReportePorDefecto() {
    const hasta = document.getElementById("reporte-hasta");
    const desde = document.getElementById("reporte-desde");
    if (!hasta || !desde || hasta.value || desde.value) return;

    const hoy = new Date();
    const hace30 = new Date();
    hace30.setDate(hoy.getDate() - 30);
    hasta.value = hoy.toISOString().slice(0, 10);
    desde.value = hace30.toISOString().slice(0, 10);
}

function renderMapaReporte(mapa = {}) {
    const entries = Object.entries(mapa);
    if (entries.length === 0) return "<p class='reportes-empty'>Sin datos</p>";
    return entries.map(([nombre, total]) => `
        <div class="reporte-row">
            <span>${nombre}</span>
            <strong>${monedaReporte(total)}</strong>
        </div>
    `).join("");
}

function renderListaSimple(items = [], emptyText) {
    if (items.length === 0) return `<p class="reportes-empty">${emptyText}</p>`;
    return items.map(item => `
        <div class="reporte-row">
            <span>${item.nombre}${item.categoria ? " - " + item.categoria : ""}</span>
            <strong>${item.cantidad !== undefined ? item.cantidad : item.stock}</strong>
        </div>
    `).join("");
}

async function renderReportes() {
    const contenedor = document.getElementById("reportes-contenido");
    if (!contenedor) return;

    setFechasReportePorDefecto();
    contenedor.innerHTML = "<p class='loading'>Calculando reportes...</p>";

    try {
        const data = await getReporteResumen({
            desde: document.getElementById("reporte-desde")?.value,
            hasta: document.getElementById("reporte-hasta")?.value,
            stockMinimo: document.getElementById("reporte-stock-minimo")?.value || 3
        });

        contenedor.innerHTML = `
            <div class="reportes-grid">
                <div class="reporte-card"><span>Ventas</span><strong>${monedaReporte(data.ventas.total)}</strong><small>${data.ventas.cantidad} transacciones</small></div>
                <div class="reporte-card"><span>Compras</span><strong>${monedaReporte(data.compras.total)}</strong><small>${data.compras.cantidad} compras</small></div>
                <div class="reporte-card"><span>Utilidad bruta</span><strong>${monedaReporte(data.utilidadBruta)}</strong><small>Ventas menos compras</small></div>
                <div class="reporte-card"><span>Faltantes pendientes</span><strong>${data.faltantes.pendientes}</strong><small>${data.faltantes.total} registrados</small></div>
            </div>

            <div class="reportes-panels">
                <section class="reporte-panel">
                    <h3>Ventas por metodo</h3>
                    ${renderMapaReporte(data.ventas.porMetodo)}
                </section>
                <section class="reporte-panel">
                    <h3>Compras por metodo</h3>
                    ${renderMapaReporte(data.compras.porMetodo)}
                </section>
                <section class="reporte-panel">
                    <h3>Productos mas vendidos</h3>
                    ${renderListaSimple(data.ventas.productosTop, "Sin ventas en el rango")}
                </section>
                <section class="reporte-panel">
                    <h3>Productos mas solicitados (faltantes)</h3>
                    ${data.faltantes.agrupados?.length
                        ? data.faltantes.agrupados.slice(0, 10).map(f => `
                            <div class="reporte-row">
                                <span>${f.nombre}</span>
                                <strong>${f.veces} ${f.veces === 1 ? "vez" : "veces"}</strong>
                            </div>`).join("")
                        : "<p class='reportes-empty'>Sin faltantes registrados</p>"
                    }
                </section>
                <section class="reporte-panel">
                    <h3>Bajo stock</h3>
                    ${renderListaSimple(data.inventario.bajoStock, "Sin productos bajo el minimo")}
                </section>
            </div>
        `;
    } catch (error) {
        console.error(error);
        contenedor.innerHTML = "<p>Error al conectar con la base de datos.</p>";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    setFechasReportePorDefecto();
    document.getElementById("btn-actualizar-reportes")?.addEventListener("click", renderReportes);
});
