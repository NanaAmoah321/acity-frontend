let confirmCallback = null;

function showConfirmModal({
    title = "Confirm Action",
    message = "Are you sure?",
    icon = "fa-triangle-exclamation",
    confirmText = "Confirm",
    confirmClass = "btn-danger",
    onConfirm
}){

    const modal = document.getElementById("confirmModal");

    if(!modal) return;

    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalMessage").textContent = message;

    const iconElement = document.getElementById("modalIcon");
    iconElement.className = `fa-solid ${icon}`;

    const confirmButton = document.getElementById("modalConfirm");
    confirmButton.textContent = confirmText;
    confirmButton.className = `btn ${confirmClass}`;

    confirmCallback = onConfirm;

    modal.classList.add("show");
}

function closeConfirmModal(){

    const modal = document.getElementById("confirmModal");

    if(modal){

        modal.classList.remove("show");

    }

}

const modalCancel = document.getElementById("modalCancel");

if(modalCancel){

    modalCancel.addEventListener("click", closeConfirmModal);

}

const modalConfirm = document.getElementById("modalConfirm");

if(modalConfirm){

    modalConfirm.addEventListener("click", ()=>{

        closeConfirmModal();

        if(confirmCallback){

            confirmCallback();

        }

    });

}

const confirmModal = document.getElementById("confirmModal");

if(confirmModal){

    confirmModal.addEventListener("click",(e)=>{

        if(e.target.id==="confirmModal"){

            closeConfirmModal();

        }

    });

}