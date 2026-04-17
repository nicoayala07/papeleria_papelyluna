function ensureToastRegion() {
    let region = document.getElementById("toast-region");
    if (region) return region;

    region = document.createElement("div");
    region.id = "toast-region";
    region.className = "toast-region";
    document.body.appendChild(region);
    return region;
}

function ensureConfirmDialog() {
    let overlay = document.getElementById("confirm-overlay");
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.id = "confirm-overlay";
    overlay.className = "confirm-overlay";
    overlay.innerHTML = `
        <div class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
            <div class="confirm-dialog__icon">
                <i class="fa-solid fa-triangle-exclamation"></i>
            </div>
            <div class="confirm-dialog__body">
                <h3 id="confirm-title" class="confirm-dialog__title">Confirmar accion</h3>
                <p class="confirm-dialog__message"></p>
            </div>
            <div class="confirm-dialog__actions">
                <button type="button" class="btn btn--secondary confirm-dialog__cancel">Cancelar</button>
                <button type="button" class="btn btn--danger confirm-dialog__accept">Confirmar</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    return overlay;
}

function showToast(message, options = {}) {
    const region = ensureToastRegion();
    const type = options.type || "info";
    const duration = options.duration ?? 2800;
    const icon = {
        success: "fa-circle-check",
        warning: "fa-triangle-exclamation",
        error: "fa-circle-xmark",
        info: "fa-circle-info"
    }[type] || "fa-circle-info";

    const toast = document.createElement("div");
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;

    region.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("activa"));

    const removeToast = () => {
        toast.classList.remove("activa");
        setTimeout(() => toast.remove(), 180);
    };

    setTimeout(removeToast, duration);
    toast.addEventListener("click", removeToast);
}

function showConfirmDialog(message, options = {}) {
    const overlay = ensureConfirmDialog();
    const titleEl = overlay.querySelector(".confirm-dialog__title");
    const messageEl = overlay.querySelector(".confirm-dialog__message");
    const acceptBtn = overlay.querySelector(".confirm-dialog__accept");
    const cancelBtn = overlay.querySelector(".confirm-dialog__cancel");

    titleEl.textContent = options.title || "Confirmar accion";
    messageEl.textContent = message;
    acceptBtn.textContent = options.confirmText || "Confirmar";
    cancelBtn.textContent = options.cancelText || "Cancelar";

    return new Promise(resolve => {
        const close = (result) => {
            overlay.classList.remove("activa");
            overlay.removeEventListener("click", handleOverlayClick);
            acceptBtn.removeEventListener("click", handleAccept);
            cancelBtn.removeEventListener("click", handleCancel);
            document.removeEventListener("keydown", handleKeydown);
            resolve(result);
        };

        const handleAccept = () => close(true);
        const handleCancel = () => close(false);
        const handleOverlayClick = (event) => {
            if (event.target === overlay) close(false);
        };
        const handleKeydown = (event) => {
            if (event.key === "Escape") close(false);
        };

        acceptBtn.addEventListener("click", handleAccept);
        cancelBtn.addEventListener("click", handleCancel);
        overlay.addEventListener("click", handleOverlayClick);
        document.addEventListener("keydown", handleKeydown);
        overlay.classList.add("activa");
        cancelBtn.focus();
    });
}

window.showToast = showToast;
window.showConfirmDialog = showConfirmDialog;
