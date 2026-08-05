const API_BASE_URL = "https://acity-backend.onrender.com";

const createListingPage = document.getElementById("createListingPage");

async function checkSellerStore() {

    const token = localStorage.getItem("token");

    if (!token) return;

    if (createListingPage) {
        createListingPage.style.display = "none";
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/stores/me`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to check store.");
        }

        if (!data.hasStore) {

            window.location.href = "create-store.html";

            return;
        }

        if (createListingPage) {
            createListingPage.style.display = "";
        }

    } catch (error) {

        console.error(error);

        if (createListingPage) {
            createListingPage.style.display = "";
        }

    }

}

checkSellerStore();

const ItemForm = document.getElementById("ItemForm");
const uploadArea = document.getElementById("uploadArea");
const imageInput = document.getElementById("image");
const preview = document.getElementById("previewImage");
const uploadContent = document.getElementById("uploadContent");
const imageActions = document.getElementById("imageActions");
const changeBtn = document.getElementById("changeImageBtn");
const removeBtn = document.getElementById("removeImageBtn");
const aiImproveButton = document.getElementById("aiImproveButton");
const aiStatus = document.getElementById("aiStatus");

function getDraftListing() {
  return {
    title: document.getElementById("title").value.trim(),
    description: document.getElementById("description").value.trim(),
    category: document.getElementById("category").value.trim(),
    price: Number(document.getElementById("price").value)
  };
}

function setAiStatus(message, isError = false) {
  if (!aiStatus) return;

  aiStatus.textContent = message;
  aiStatus.style.color = isError ? "#b42318" : "";
}

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

aiImproveButton?.addEventListener("click", async () => {
  const token = localStorage.getItem("token");
  const draft = getDraftListing();

  if (!token) {
    showToast("Please sign in before using Acity AI.", "error");
    return;
  }

  if (
    draft.title.length < 3 ||
    draft.description.length < 20 ||
    !draft.category ||
    !Number.isFinite(draft.price) ||
    draft.price < 0
  ) {
    showToast(
      "Add a title, description, category, and valid price before using Acity AI.",
      "error"
    );
    return;
  }

  aiImproveButton.disabled = true;
  aiImproveButton.innerHTML = `
    <i class="fa-solid fa-spinner fa-spin"></i>
    Improving listing...
  `;

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/ai/seller/improve-listing`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(draft)
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.error?.message || "Unable to improve this listing right now."
      );
    }

    const suggestion = result.data;
    const pricing = suggestion.pricing;

    const pricingText = pricing.available
      ? `Data-backed price: GH₵${pricing.suggestedPrice}\nRange: GH₵${pricing.lowPrice}–GH₵${pricing.highPrice}\n${pricing.message}`
      : pricing.message;

    showConfirmModal({
      title: "Review Acity AI suggestion",
      message: [
        `Suggested title:\n${suggestion.improvedTitle}`,
        `Suggested description:\n${suggestion.improvedDescription}`,
        pricingText,
        "You can still edit all fields before publishing."
      ].join("\n\n"),
      icon: "fa-wand-magic-sparkles",
      confirmText: "Apply changes",
      confirmClass: "btn-primary",
      onConfirm: () => {
        document.getElementById("title").value = suggestion.improvedTitle;
        document.getElementById("description").value =
          suggestion.improvedDescription;

        if (pricing.available) {
          document.getElementById("price").value = pricing.suggestedPrice;
        }

        setAiStatus("Suggestions applied. Review them before publishing.");
      }
    });
  } catch (error) {
    setAiStatus(error.message, true);
    showToast(error.message, "error");
  } finally {
    aiImproveButton.disabled = false;
    aiImproveButton.innerHTML = `
      <i class="fa-solid fa-wand-magic-sparkles"></i>
      Improve with Acity AI
    `;
  }
});

if (ItemForm) {
  ItemForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const publishButton = document.getElementById("publishButton");
    publishButton.disabled = true;
    publishButton.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin"></i>
      Publishing...
    `;

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("title", document.getElementById("title").value);
      formData.append("description", document.getElementById("description").value);
      formData.append("category", document.getElementById("category").value);
      formData.append("stock_quantity", document.getElementById("stock_quantity").value);
      formData.append("price", document.getElementById("price").value);

      const file = imageInput.files[0];
      if (file) formData.append("image", file);

      const response = await fetch(`${API_BASE_URL}/api/listings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Unable to publish listing.");
      }

      showToast("Listing created successfully!");
      setTimeout(() => {
        window.location.href = "marketplace.html";
      }, 1000);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      publishButton.disabled = false;
      publishButton.innerHTML = `
        <i class="fa-solid fa-paper-plane"></i>
        <span>Publish Listing</span>
      `;
    }
  });
}