function showToast(message, type = "success") {
    let toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fa-solid ${
            type === "success"
            ? "fa-circle-check"
            : "fa-circle-xmark"
        }"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add("show");
    }, 50);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}
window.showToast = showToast;
