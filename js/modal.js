let confirmCallback = null;

function showConfirmModal({
    title = "Confirm Action",
    message = "Are you sure?",
    icon = "fa-triangle-exclamation",
    confirmText = "Confirm",
    confirmClass = "btn-danger",
    onConfirm
}){

    document.getElementById("modalTitle").textContent = title;

    document.getElementById("modalMessage").textContent = message;

    const iconElement =
    document.getElementById("modalIcon");

    iconElement.className =
    `fa-solid ${icon}`;

    const confirmButton =
    document.getElementById("modalConfirm");

    confirmButton.textContent =
    confirmText;

    confirmButton.className =
    `btn ${confirmClass}`;

    confirmCallback = onConfirm;

    document
    .getElementById("confirmModal")
    .classList.add("show");

}

function closeConfirmModal(){

    document
    .getElementById("confirmModal")
    .classList.remove("show");

}

document
.getElementById("modalCancel")
.addEventListener("click", closeConfirmModal);

document
.getElementById("modalConfirm")
.addEventListener("click", ()=>{

    closeConfirmModal();

    if(confirmCallback){

        confirmCallback();

    }

});

document
.getElementById("confirmModal")
.addEventListener("click",(e)=>{

    if(e.target.id==="confirmModal"){

        closeConfirmModal();

    }

});