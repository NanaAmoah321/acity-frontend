const API_BASE_URL = "https://acity-backend.onrender.com";

const DRAFT_KEY = "acity_bulk_listing_draft_v1";

const CATEGORIES = [
    "Electronics",
    "Books",
    "Clothing",
    "Hostel Items",
    "Academic",
    "Other"
];

const page = document.getElementById("bulkPage");
const cards = document.getElementById("cards");
const results = document.getElementById("results");

let products = [];
let publishing = false;

const createId = () => {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

const blankProduct = () => {
    return {
        id: createId(),
        title: "",
        description: "",
        category: "",
        price: "",
        stock_quantity: "1",
        image: null,
        selected: false,
        error: ""
    };
};

function applyBulkTheme(theme) {
    document.body.classList.remove("dark");

    if (theme === "dark") {
        document.body.classList.add("dark");
    }

    if (theme === "system") {
        const prefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;

        if (prefersDark) {
            document.body.classList.add("dark");
        }
    }

    localStorage.setItem("theme", theme);
}

function loadBulkTheme() {
    const savedTheme =
        localStorage.getItem("theme") || "light";

    applyBulkTheme(savedTheme);
}

function cycleBulkTheme() {
    const currentTheme =
        localStorage.getItem("theme") || "light";

    const themes = [
        "light",
        "dark",
        "system"
    ];

    const currentIndex =
        themes.indexOf(currentTheme);

    const nextTheme =
        themes[(currentIndex + 1) % themes.length];

    applyBulkTheme(nextTheme);
}

loadBulkTheme();

document
    .getElementById("bulkThemeToggle")
    ?.addEventListener(
        "click",
        cycleBulkTheme
    );

window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
        if (
            localStorage.getItem("theme") === "system"
        ) {
            applyBulkTheme("system");
        }
    });

function escapeHtml(value) {
    return String(value ?? "").replace(
        /[&<>'"]/g,
        character => {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "'": "&#39;",
                '"': "&quot;"
            };

            return entities[character];
        }
    );
}

function categoryOptions(selectedCategory) {
    return `
        <option value="">Select category</option>

        ${CATEGORIES.map(category => `
            <option
                value="${escapeHtml(category)}"
                ${category === selectedCategory ? "selected" : ""}
            >
                ${escapeHtml(category)}
            </option>
        `).join("")}
    `;
}

function saveDraft() {
    const cleanProducts = products.map(product => {
        return {
            ...product,
            error: ""
        };
    });

    localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify(cleanProducts)
    );
}

function loadDraft() {
    try {
        const savedDraft = JSON.parse(
            localStorage.getItem(DRAFT_KEY) || "null"
        );

        if (Array.isArray(savedDraft) && savedDraft.length > 0) {
            products = savedDraft.map(product => {
                return {
                    ...blankProduct(),
                    ...product,
                    id: product.id || createId()
                };
            });
        }
    } catch {
        localStorage.removeItem(DRAFT_KEY);
    }

    if (products.length === 0) {
        products = [blankProduct()];
    }
}

function render() {
    if (products.length === 0) {
        cards.innerHTML = `
            <div class="bulk-empty">
                Add a product to begin.
            </div>
        `;

        return;
    }

    cards.innerHTML = products.map((product, index) => {
        return `
            <article
                class="bulk-card"
                data-id="${product.id}"
            >
                <div class="bulk-card-head">

                    <input
                        class="product-select"
                        type="checkbox"
                        ${product.selected ? "checked" : ""}
                        aria-label="Select product ${index + 1}"
                    >

                    <h2>
                        Product ${index + 1}
                    </h2>

                    <span class="spacer"></span>

                    <button
                        class="btn btn-secondary duplicate"
                        type="button"
                    >
                        Duplicate
                    </button>

                    <button
                        class="btn btn-danger remove"
                        type="button"
                        ${products.length === 1 ? "disabled" : ""}
                    >
                        Remove
                    </button>

                </div>

                <div class="bulk-card-grid">

                    <div class="bulk-fields">

                        <div class="bulk-field">
                            <label>
                                Product title
                            </label>

                            <input
                                data-field="title"
                                value="${escapeHtml(product.title)}"
                                maxlength="120"
                                required
                            >
                        </div>

                        <div class="bulk-field">
                            <label>
                                Description
                            </label>

                            <textarea
                                data-field="description"
                                rows="6"
                                maxlength="3000"
                                required
                            >${escapeHtml(product.description)}</textarea>
                        </div>

                        <div class="bulk-fields row">

                            <div class="bulk-field">
                                <label>
                                    Category
                                </label>

                                <select
                                    data-field="category"
                                    required
                                >
                                    ${categoryOptions(product.category)}
                                </select>
                            </div>

                            <div class="bulk-field">
                                <label>
                                    Price (GH₵)
                                </label>

                                <input
                                    data-field="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value="${escapeHtml(product.price)}"
                                    required
                                >
                            </div>

                        </div>

                        <div class="bulk-field">
                            <label>
                                Available quantity
                            </label>

                            <input
                                data-field="stock_quantity"
                                type="number"
                                min="1"
                                step="1"
                                value="${escapeHtml(product.stock_quantity)}"
                                required
                            >
                        </div>

                        <button
                            class="btn btn-secondary improve"
                            type="button"
                        >
                            <i class="fa-solid fa-wand-magic-sparkles"></i>
                            Improve with Acity AI
                        </button>

                        <div class="bulk-status">
                            ${
                                product.image
                                    ? "Image attached"
                                    : "No image attached"
                            }
                        </div>

                        ${
                            product.error
                                ? `
                                    <div class="bulk-error">
                                        ${escapeHtml(product.error)}
                                    </div>
                                `
                                : ""
                        }

                    </div>

                    <div>

                        <input
                            class="image-input"
                            type="file"
                            accept="image/*"
                            hidden
                        >

                        <div class="bulk-upload">

                            ${
                                product.image
                                    ? `
                                        <img
                                            src="${product.image.dataUrl}"
                                            alt="Preview for product ${index + 1}"
                                        >
                                    `
                                    : `
                                        <div>
                                            <i class="fa-solid fa-cloud-arrow-up fa-2x"></i>

                                            <strong>
                                                Drag and drop an image
                                            </strong>

                                            <span>
                                                or click to browse
                                            </span>
                                        </div>
                                    `
                            }

                        </div>

                        <div class="bulk-card-actions">

                            ${
                                product.image
                                    ? `
                                        <button
                                            class="btn btn-secondary change-image"
                                            type="button"
                                        >
                                            Change image
                                        </button>

                                        <button
                                            class="btn btn-danger remove-image"
                                            type="button"
                                        >
                                            Remove image
                                        </button>
                                    `
                                    : ""
                            }

                        </div>

                    </div>

                </div>
            </article>
        `;
    }).join("");

    bindCards();

    document.getElementById("selectAll").checked =
        products.length > 0 &&
        products.every(product => product.selected);
}

function updateProduct(product, field, value) {
    product[field] = value;
    product.error = "";

    saveDraft();
}

function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            resolve(reader.result);
        };

        reader.onerror = reject;

        reader.readAsDataURL(file);
    });
}

async function attachImage(product, file) {
    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {
        showToast(
            "Please choose an image file.",
            "error"
        );

        return;
    }

    if (file.size > 8 * 1024 * 1024) {
        showToast(
            "Each image must be 8 MB or smaller.",
            "error"
        );

        return;
    }

    product.image = {
        name: file.name,
        type: file.type,
        dataUrl: await fileToDataUrl(file)
    };

    saveDraft();
    render();
}

function bindCards() {
    cards.querySelectorAll(".bulk-card").forEach(card => {
        const product = products.find(
            item => item.id === card.dataset.id
        );

        card.querySelectorAll("[data-field]").forEach(input => {
            input.addEventListener("input", event => {
                updateProduct(
                    product,
                    event.target.dataset.field,
                    event.target.value
                );
            });
        });

        card.querySelector(".product-select").addEventListener(
            "change",
            event => {
                product.selected = event.target.checked;
                saveDraft();
            }
        );

        card.querySelector(".remove").addEventListener(
            "click",
            () => {
                products = products.filter(
                    item => item.id !== product.id
                );

                saveDraft();
                render();
            }
        );

        card.querySelector(".duplicate").addEventListener(
            "click",
            () => {
                const index = products.indexOf(product);

                products.splice(
                    index + 1,
                    0,
                    {
                        ...product,
                        id: createId(),
                        title: product.title
                            ? `${product.title} (copy)`
                            : "",
                        selected: false,
                        error: ""
                    }
                );

                saveDraft();
                render();
            }
        );

        card.querySelector(".improve").addEventListener(
            "click",
            () => {
                improveProduct(product);
            }
        );

        const imageInput = card.querySelector(".image-input");
        const uploadArea = card.querySelector(".bulk-upload");

        uploadArea.addEventListener(
            "click",
            () => imageInput.click()
        );

        imageInput.addEventListener(
            "change",
            () => {
                attachImage(
                    product,
                    imageInput.files[0]
                );
            }
        );

        uploadArea.addEventListener(
            "dragover",
            event => {
                event.preventDefault();
                uploadArea.classList.add("dragover");
            }
        );

        uploadArea.addEventListener(
            "dragleave",
            () => {
                uploadArea.classList.remove("dragover");
            }
        );

        uploadArea.addEventListener(
            "drop",
            event => {
                event.preventDefault();

                uploadArea.classList.remove("dragover");

                attachImage(
                    product,
                    event.dataTransfer.files[0]
                );
            }
        );

        card.querySelector(".change-image")?.addEventListener(
            "click",
            () => imageInput.click()
        );

        card.querySelector(".remove-image")?.addEventListener(
            "click",
            () => {
                product.image = null;

                saveDraft();
                render();
            }
        );
    });
}

function validateProduct(product) {
    if (product.title.trim().length < 3) {
        return "Title must be at least 3 characters.";
    }

    if (product.description.trim().length < 20) {
        return "Description must be at least 20 characters.";
    }

    if (!CATEGORIES.includes(product.category)) {
        return "Choose a valid category.";
    }

    const price = Number(product.price);

    if (!Number.isFinite(price) || price < 0) {
        return "Enter a valid price.";
    }

    const quantity = Number(product.stock_quantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
        return "Quantity must be a whole number of at least 1.";
    }

    return "";
}

async function improveProduct(product) {
    const token = localStorage.getItem("token");

    if (!token) {
        showToast(
            "Please sign in before using Acity AI.",
            "error"
        );

        return;
    }

    const validationError = validateProduct(product);

    if (validationError) {
        showToast(
            validationError,
            "error"
        );

        return;
    }

    const button = cards.querySelector(
        `[data-id="${product.id}"] .improve`
    );

    button.disabled = true;
    button.textContent = "Improving...";

    try {
        const response = await fetch(
            `${API_BASE_URL}/api/ai/seller/improve-listing`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },

                body: JSON.stringify({
                    title: product.title.trim(),
                    description: product.description.trim(),
                    category: product.category,
                    price: Number(product.price)
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result?.error?.message ||
                result?.error ||
                "AI improvement failed."
            );
        }

        const suggestion = result.data;

        const shouldApply = confirm(
            `Apply this AI suggestion?\n\n` +
            `Title:\n${suggestion.improvedTitle}\n\n` +
            `Description:\n${suggestion.improvedDescription}`
        );

        if (!shouldApply) {
            return;
        }

        product.title =
            suggestion.improvedTitle ||
            product.title;

        product.description =
            suggestion.improvedDescription ||
            product.description;

        if (
            suggestion.pricing?.available &&
            Number.isFinite(
                Number(suggestion.pricing.suggestedPrice)
            )
        ) {
            product.price =
                suggestion.pricing.suggestedPrice;
        }

        saveDraft();
        render();

        showToast("AI suggestions applied.");
    } catch (error) {
        showToast(
            error.message,
            "error"
        );
    } finally {
        if (button) {
            button.disabled = false;

            button.innerHTML = `
                <i class="fa-solid fa-wand-magic-sparkles"></i>
                Improve with Acity AI
            `;
        }
    }
}

function dataUrlToFile(image) {
    const [metadata, encodedData] =
        image.dataUrl.split(",");

    const binaryData = atob(encodedData);

    const bytes = Uint8Array.from(
        binaryData,
        character => character.charCodeAt(0)
    );

    const detectedType =
        metadata.match(/data:(.*?);/)?.[1] ||
        "image/jpeg";

    return new File(
        [bytes],
        image.name || "listing-image",
        {
            type: image.type || detectedType
        }
    );
}

async function publishProduct(product, token) {
    const formData = new FormData();

    formData.append(
        "title",
        product.title.trim()
    );

    formData.append(
        "description",
        product.description.trim()
    );

    formData.append(
        "category",
        product.category
    );

    formData.append(
        "price",
        String(Number(product.price))
    );

    formData.append(
        "stock_quantity",
        String(Number(product.stock_quantity))
    );

    if (product.image?.dataUrl) {
        formData.append(
            "image",
            dataUrlToFile(product.image)
        );
    }

    const response = await fetch(
        `${API_BASE_URL}/api/listings`,
        {
            method: "POST",

            headers: {
                Authorization: `Bearer ${token}`
            },

            body: formData
        }
    );

    const data = await response.json().catch(
        () => ({})
    );

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            "The listing could not be published."
        );
    }

    return data;
}

async function publishAll() {
    if (publishing) {
        return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
        showToast(
            "Please sign in before publishing.",
            "error"
        );

        return;
    }

    const invalidProduct = products.find(
        product => validateProduct(product)
    );

    if (invalidProduct) {
        invalidProduct.error =
            validateProduct(invalidProduct);

        render();

        showToast(
            "Fix the highlighted product before publishing.",
            "error"
        );

        return;
    }

    publishing = true;

    const publishButton =
        document.getElementById("publishAll");

    publishButton.disabled = true;

    const report = [];

    for (const product of products) {
        try {
            await publishProduct(
                product,
                token
            );

            report.push({
                id: product.id,
                title: product.title,
                ok: true
            });
        } catch (error) {
            product.error = error.message;

            report.push({
                id: product.id,
                title: product.title,
                ok: false,
                error: error.message
            });
        }
    }

    const failedProducts =
        report.filter(item => !item.ok);

    products = products.filter(product => {
        return failedProducts.some(
            failed => failed.id === product.id
        );
    });

    if (products.length === 0) {
        localStorage.removeItem(DRAFT_KEY);
        products = [blankProduct()];
    } else {
        saveDraft();
    }

    results.hidden = false;

    results.innerHTML = `
        <strong>
            ${
                report.length - failedProducts.length
            }
            of
            ${report.length}
            listings published.
        </strong>

        <ul>
            ${
                report.map(item => `
                    <li class="${item.ok ? "" : "failed"}">
                        ${item.ok ? "✓" : "✕"}
                        ${escapeHtml(item.title)}

                        ${
                            item.error
                                ? ` — ${escapeHtml(item.error)}`
                                : ""
                        }
                    </li>
                `).join("")
            }
        </ul>
    `;

    render();

    publishing = false;
    publishButton.disabled = false;
}

document.getElementById("addProduct").addEventListener(
    "click",
    () => {
        products.push(blankProduct());

        saveDraft();
        render();
    }
);

document.getElementById("publishAll").addEventListener(
    "click",
    publishAll
);

document.getElementById("selectAll").addEventListener(
    "change",
    event => {
        products.forEach(product => {
            product.selected = event.target.checked;
        });

        saveDraft();
        render();
    }
);

document.getElementById("bulkAction").addEventListener(
    "change",
    event => {
        const input =
            document.getElementById("bulkValue");

        input.hidden = !event.target.value;

        input.type =
            event.target.value === "stock"
                ? "number"
                : "text";

        input.placeholder =
            event.target.value === "stock"
                ? "Quantity"
                : "Category";
    }
);

document.getElementById("applyBulk").addEventListener(
    "click",
    () => {
        const action =
            document.getElementById("bulkAction").value;

        const value =
            document.getElementById("bulkValue").value.trim();

        const selectedProducts =
            products.filter(product => product.selected);

        if (!action || selectedProducts.length === 0) {
            showToast(
                "Select products and choose a bulk action.",
                "error"
            );

            return;
        }

        if (
            action === "category" &&
            !CATEGORIES.includes(value)
        ) {
            showToast(
                "Enter one of the available categories exactly.",
                "error"
            );

            return;
        }

        if (
            action === "stock" &&
            (!/^\d+$/.test(value) || Number(value) < 1)
        ) {
            showToast(
                "Quantity must be a whole number of at least 1.",
                "error"
            );

            return;
        }

        selectedProducts.forEach(product => {
            product[
                action === "stock"
                    ? "stock_quantity"
                    : "category"
            ] = value;
        });

        saveDraft();
        render();

        showToast("Bulk change applied.");
    }
);

async function init() {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
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

        if (!response.ok || !data.hasStore) {
            window.location.href = "create-store.html";
            return;
        }

        loadDraft();
        render();

        page.hidden = false;
    } catch (error) {
        console.error(error);

        showToast(
            "Unable to verify your store right now.",
            "error"
        );
    }
}

init();