const API = "https://acity-backend.onrender.com/api";
const id = new URLSearchParams(location.search).get("id");
const root = document.getElementById("productDetails");

// Helper to escape HTML to prevent XSS attacks
const esc = (v) =>
    String(v ?? "").replace(/[&<>"']/g, (c) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[c]));

// Fallback image helper by category
const image = (p) => p.image_url || `images/${encodeURIComponent(p.category || "Other")}.jpg`;

let quantity = 1;

async function load() {
    try {
        const r = await fetch(`${API}/listings/${encodeURIComponent(id)}`);
        const p = await r.json();

        if (!r.ok) throw new Error(p.error || "Product not found");

        const available = p.status !== "archived" && Number(p.stock_quantity) > 0;
        const maxStock = Number(p.stock_quantity) || 0;

        root.innerHTML = `
            <article class="product-detail">
                <div class="product-detail-image">
                    <img src="${esc(image(p))}" alt="${esc(p.title)}" onerror="this.src='images/Other.jpg'">
                </div>
                <div class="product-detail-copy">
                    <span class="product-category-static">${esc(p.category || "Other")}</span>
                    <h1>${esc(p.title)}</h1>
                    <strong class="product-detail-price">GH₵${Number(p.price).toFixed(2)}</strong>
                    <p>${esc(p.description || "No description provided.")}</p>
                    <div class="product-detail-stock">
                        ${available ? `${maxStock} available` : (p.status === "archived" ? "Archived" : "Out of stock")}
                    </div>
                    
                    ${available ? `
                    <div class="product-quantity">
                        <button id="qtyDec" type="button">-</button>
                        <strong id="qtyVal">${quantity}</strong>
                        <button id="qtyInc" type="button">+</button>
                    </div>
                    ` : ""}

                    <button id="detailCart" class="add-cart" ${available ? "" : "disabled"}>
                        ${available ? "Add to cart" : "Unavailable"}
                    </button>
                    
                    <a class="seller-link" href="listing.html?id=${Number(p.user_id)}">View seller store</a>
                </div>
            </article>

            <section class="related-section">
                <div class="related-heading">
                    <h2>Related products</h2>
                    <p>More items from the same category you may like.</p>
                </div>

                <div id="relatedProducts" class="related-products">
                    <p class="related-loading">Loading related products...</p>
                </div>
            </section>
        `;

        if (available) {
            const qtyVal = document.getElementById("qtyVal");
            
            document.getElementById("qtyDec").onclick = () => {
                if (quantity > 1) {
                    quantity--;
                    qtyVal.textContent = quantity;
                }
            };

            document.getElementById("qtyInc").onclick = () => {
                if (quantity < maxStock) {
                    quantity++;
                    qtyVal.textContent = quantity;
                }
            };

            document.getElementById("detailCart").onclick = () => cart(p.id, quantity);
        }

        await loadRelatedProducts(p);

    } catch (e) {
        root.innerHTML = `
            <div class="store-empty">
                <h2>Product unavailable</h2>
                <p>${esc(e.message)}</p>
            </div>
        `;
    }
}

async function loadRelatedProducts(currentProduct) {
    const container = document.getElementById("relatedProducts");

    if (!container) return;

    try {
        const response = await fetch(`${API}/listings`);
        const products = await response.json();

        if (!response.ok || !Array.isArray(products)) {
            throw new Error("Unable to load related products");
        }

        const related = products
            .filter(product =>
                Number(product.id) !== Number(currentProduct.id) &&
                product.status !== "archived" &&
                product.category === currentProduct.category
            )
            .slice(0, 4);

        if (related.length === 0) {
            container.innerHTML = `
                <p class="related-empty">
                    No related products available.
                </p>
            `;
            return;
        }

        container.innerHTML = related.map(product => `
            <article class="related-card">
                <a href="product.html?id=${Number(product.id)}"
                   class="related-image">
                    <img
                        src="${esc(image(product))}"
                        alt="${esc(product.title)}"
                        onerror="this.src='images/Other.jpg'"
                    >
                </a>

                <div class="related-info">
                    <a
                        href="product.html?id=${Number(product.id)}"
                        class="related-title"
                    >
                        ${esc(product.title)}
                    </a>

                    <strong class="related-price">
                        GH₵${Number(product.price).toFixed(2)}
                    </strong>

                    <span class="related-stock">
                        ${Number(product.stock_quantity)} available
                    </span>
                </div>
            </article>
        `).join("");

    } catch (error) {
        console.error("Related products error:", error);

        container.innerHTML = `
            <p class="related-empty">
                Related products are unavailable right now.
            </p>
        `;
    }
}

async function cart(listing_id, qty = 1) {
    const t = localStorage.getItem("token");
    if (!t) return showToast("Please log in first", "error");

    try {
        const r = await fetch(`${API}/listings/interest`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${t}`
            },
            body: JSON.stringify({ listing_id, quantity: qty })
        });
        
        const d = await r.json();

        if (!r.ok) return showToast(d.error || d.message || "Could not add to cart", "error");

        showToast(d.message || "Added to cart!");
        if (window.loadCartCount) window.loadCartCount();

    } catch (err) {
        showToast("Network error. Please try again.", "error");
    }
}

load();