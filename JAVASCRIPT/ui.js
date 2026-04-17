function ensureToastRegion() {
    let region = document.getElementById("toast-region");
    if (region) return region;

    region = document.createElement("div");
    region.id = "toast-region";
    region.className = "toast-region";
    document.body.appendChild(region);
    return region;
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

window.showToast = showToast;
