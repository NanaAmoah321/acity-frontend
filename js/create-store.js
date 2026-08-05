const API_BASE_URL = "https://acity-backend.onrender.com";

const storeForm = document.getElementById("storeForm");

const uploadArea = document.getElementById("uploadArea");
const imageInput = document.getElementById("image");
const preview = document.getElementById("previewImage");
const uploadContent = document.getElementById("uploadContent");
const imageActions = document.getElementById("imageActions");
const changeBtn = document.getElementById("changeImageBtn");
const removeBtn = document.getElementById("removeImageBtn");

const selectedCategories = [];

/* -------------------------------
   Image Upload
-------------------------------- */

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

uploadArea.addEventListener("dragover",(e)=>{

    e.preventDefault();

    uploadArea.classList.add("dragover");

});

uploadArea.addEventListener("dragleave",()=>{

    uploadArea.classList.remove("dragover");

});

uploadArea.addEventListener("drop",(e)=>{

    e.preventDefault();

    uploadArea.classList.remove("dragover");

    imageInput.files = e.dataTransfer.files;

    imageInput.onchange();

});

/* -------------------------------
   Category Chips
-------------------------------- */

document.querySelectorAll(".category-chip").forEach(chip=>{

    chip.addEventListener("click",()=>{

        const category = chip.dataset.category;

        const index = selectedCategories.indexOf(category);

        if(index===-1){

            selectedCategories.push(category);

            chip.classList.add("selected");

        }else{

            selectedCategories.splice(index,1);

            chip.classList.remove("selected");

        }

    });

});

storeForm?.addEventListener("submit", async (e) => {

    e.preventDefault();

    if(document.getElementById("store_name").value.trim().length < 3){

        showToast(
            "Store name must be at least 3 characters.",
            "error"
        );

        return;
    }

    if(document.getElementById("description").value.trim().length < 20){

        showToast(
            "Tell buyers a little more about your store.",
            "error"
        );

        return;
    }

    if(selectedCategories.length === 0){

        showToast(
            "Select at least one category.",
            "error"
        );

        return;
    }

    if(!imageInput.files[0]){

        showToast(
            "Please upload a store picture.",
            "error"
        );

        return;
    }

    const createButton =
        document.getElementById("createStoreButton");

    createButton.disabled = true;

    createButton.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Creating Store...
    `;

    try{

        const token =
            localStorage.getItem("token");

        const formData =
            new FormData();

        formData.append(
            "store_name",
            document.getElementById("store_name").value.trim()
        );

        formData.append(
            "description",
            document.getElementById("description").value.trim()
        );

        formData.append(
            "categories",
            JSON.stringify(selectedCategories)
        );

        formData.append(
            "opening_time",
            document.getElementById("opening_time").value
        );

        formData.append(
            "closing_time",
            document.getElementById("closing_time").value
        );

        formData.append(
            "phone",
            document.getElementById("phone").value.trim()
        );

        formData.append(
            "location",
            document.getElementById("location").value.trim()
        );

        formData.append(
            "image",
            imageInput.files[0]
        );

        const response = await fetch(

            `${API_BASE_URL}/api/stores`,

            {

                method:"POST",

                headers:{

                    Authorization:`Bearer ${token}`

                },

                body:formData

            }

        );

        const data =
            await response.json();

        if(!response.ok){

            throw new Error(
                data.error ||
                "Unable to create store."
            );

        }

        showToast(
            "Store created successfully!"
        );

        setTimeout(()=>{

            window.location.href =
                "create-listing.html";

        },1000);

    }catch(err){

        showToast(
            err.message,
            "error"
        );

    }finally{

        createButton.disabled = false;

        createButton.innerHTML = `
            <i class="fa-solid fa-store"></i>
            <span>Create Store</span>
        `;

    }

});