const ItemForm = document.getElementById("ItemForm");
const uploadArea =
document.getElementById("uploadArea");

const imageInput =
document.getElementById("image");

const preview =
document.getElementById("previewImage");

const uploadContent =
document.getElementById("uploadContent");

const imageActions =
document.getElementById("imageActions");

const changeBtn =
document.getElementById("changeImageBtn");

const removeBtn =
document.getElementById("removeImageBtn");

uploadArea.onclick = () => {

    imageInput.click();

};

imageInput.onchange = () => {

    const file =
    imageInput.files[0];

    if(!file) return;

    preview.src =
    URL.createObjectURL(file);

    preview.style.display =
    "block";

    uploadContent.style.display =
    "none";

    imageActions.style.display =
    "flex";

};

changeBtn.onclick = () => {

    imageInput.click();

};

removeBtn.onclick = () => {

    imageInput.value = "";

    preview.src = "";

    preview.style.display =
    "none";

    uploadContent.style.display =
    "block";

    imageActions.style.display =
    "none";

};

uploadArea.addEventListener(
    "dragover",
    e=>{

        e.preventDefault();

        uploadArea.classList.add(
            "dragover"
        );

    }
);

uploadArea.addEventListener(
    "dragleave",
    ()=>{

        uploadArea.classList.remove(
            "dragover"
        );

    }
);

uploadArea.addEventListener(
    "drop",
    e=>{

        e.preventDefault();

   

        uploadArea.classList.remove(
            "dragover"
        );

        imageInput.files =
        e.dataTransfer.files;

        imageInput.onchange();

    }
);

if (ItemForm) {

    ItemForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const publishButton =
        document.getElementById("publishButton");

        publishButton.disabled = true;

        publishButton.innerHTML = `

        <i class="fa-solid fa-spinner fa-spin"></i>

        Publishing...

        `;

        const token =
        localStorage.getItem("token");

        const formData =
        new FormData();

        formData.append(
            "title",
            document.getElementById("title").value
        );

        formData.append(
            "description",
            document.getElementById("description").value
        );

        formData.append(
            "category",
            document.getElementById("category").value
        );

        

        formData.append(
            "price",
            document.getElementById("price").value
        );

        const file =
        document.getElementById("image").files[0];

        if(file){

            formData.append(
                "image",
                file
            );

        }

        const res =
        await fetch(

            "https://acity-backend.onrender.com/api/listings",

            {

                method:"POST",

                headers:{

                    Authorization:
                    `Bearer ${token}`

                },

                body:formData

            }

        );

        const data =
        await res.json();

        if(res.ok){

            showToast(
                "Listing created successfully!"
            );

            setTimeout(()=>{

                window.location.href =
                "marketplace.html";

            },1000);

        }else{

            showToast(

                data.message || data.error,

                "error"

            );

        }

    });

}