export function initializeImageUploader() {

    const uploadArea = document.getElementById("uploadArea");
    const imageInput = document.getElementById("image");
    const preview = document.getElementById("previewImage");
    const uploadContent = document.getElementById("uploadContent");
    const imageActions = document.getElementById("imageActions");
    const changeBtn = document.getElementById("changeImageBtn");
    const removeBtn = document.getElementById("removeImageBtn");

    if (
        !uploadArea ||
        !imageInput ||
        !preview ||
        !uploadContent ||
        !imageActions
    ) return;

    uploadArea.onclick = () => imageInput.click();

    imageInput.onchange = () => {

        const file = imageInput.files[0];

        if (!file) return;

        preview.src = URL.createObjectURL(file);

        preview.style.display = "block";

        uploadContent.style.display = "none";

        imageActions.style.display = "flex";

    };

    changeBtn.onclick = () => imageInput.click();

    removeBtn.onclick = () => {

        imageInput.value = "";

        preview.src = "";

        preview.style.display = "none";

        uploadContent.style.display = "block";

        imageActions.style.display = "none";

    };

    uploadArea.addEventListener("dragover", (event) => {

        event.preventDefault();

        uploadArea.classList.add("dragover");

    });

    uploadArea.addEventListener("dragleave", () => {

        uploadArea.classList.remove("dragover");

    });

    uploadArea.addEventListener("drop", (event) => {

        event.preventDefault();

        uploadArea.classList.remove("dragover");

        imageInput.files = event.dataTransfer.files;

        imageInput.onchange();

    });

}