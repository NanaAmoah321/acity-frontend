const API = "https://acity-backend.onrender.com/api";
const params = new URLSearchParams(location.search);
const userId = params.get("id");
const root = document.getElementById("listingDetails");
let store;

const esc = value => String(value ?? "").replace(/[&<>\"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;", "'":"&#39;"}[c]));
const imageFor = product => product.image_url || `images/${encodeURIComponent(product.category || "Other")}.jpg`;
const token = () => localStorage.getItem("token");
const toast = (message, type = "success") => window.showToast ? showToast(message, type) : alert(message);

async function request(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (token()) headers.Authorization = `Bearer ${token()}`;
    const response = await fetch(`${API}${path}`, { ...options, headers });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || data.message || "Request failed");
    return data;
}

async function loadStore() {
    if (!userId) return renderError("This store link is missing its seller ID.");
    try {
        store = await request(`/listings/store/${encodeURIComponent(userId)}`);
        render();
        await setupFollow();
    } catch (error) {
        console.error(error);
        renderError("We couldn't load this store right now.");
    }
}

function renderError(message) {
    root.innerHTML = `<div class="store-empty"><i class="fa-solid fa-store-slash"></i><h2>Store not found</h2><p>${esc(message)}</p></div>`;
}

function render() {
    const s = store.store;
    const categories = Array.isArray(s.categories) ? s.categories : [s.categories || "General"];
    root.innerHTML = `
        <section class="store-hero">
            <div class="store-identity">
                <div class="store-avatar"><img src="${esc(s.profile_image || "images/Other.jpg")}" alt="${esc(s.store_name)}" onerror="this.src='images/Other.jpg'"></div>
                <div class="store-info"><span class="store-eyebrow">${categories.map(esc).join(" · ")}</span><h1>${esc(s.store_name || "Student Store")}</h1>
                    <div class="store-rating">★ ${esc(s.average_rating || "New")} <span>·</span> ${Number(s.total_reviews || 0)} reviews</div>
                    <p>${esc(s.description || "Browse products from this Academic City seller.")}</p>
                    <div class="store-actions"><button class="btn btn-primary" id="messageSeller"><i class="fa-solid fa-message"></i> Message seller</button><button class="btn btn-secondary" id="followBtn"><i class="fa-regular fa-bookmark"></i> Follow store</button></div>
                </div>
            </div>
            <div class="store-stats"><div><strong>${store.products.length}</strong><span>Products</span></div><div><strong>${Number(s.total_reviews || 0)}</strong><span>Reviews</span></div><div><strong>${esc(s.average_rating || "New")}</strong><span>Rating</span></div></div>
        </section>
        <section class="store-toolbar"><label class="store-search"><i class="fa-solid fa-magnifying-glass"></i><input id="storeSearch" placeholder="Search this store" autocomplete="off"></label><select id="storeSort"><option value="latest">Latest</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></section>
        <div class="store-categories" id="storeCategories"><button class="active" data-category="All">All</button>${["Books","Electronics","Academic","Hostel Items","Clothing","Other"].map(c => `<button data-category="${esc(c)}">${esc(c)}</button>`).join("")}</div>
        <section class="store-products-section"><div class="store-section-heading"><div><span class="store-eyebrow">${store.products.length} items available</span><h2>Products</h2></div></div><div class="store-products" id="storeProducts"></div></section>`;
    document.getElementById("messageSeller").onclick = () => messageSeller(s.user_id, s.store_name);
    setupFilters(); renderProducts(store.products);
}

function renderProducts(products) {
    const target = document.getElementById("storeProducts");
    if (!products.length) { target.innerHTML = `<div class="store-empty"><i class="fa-solid fa-box-open"></i><h3>No products found</h3><p>Try another search or category.</p></div>`; return; }
    target.innerHTML = products.map(p => {
        const available = p.status !== "archived" && Number(p.stock_quantity) > 0;
        const stock = p.status === "archived" ? "Archived" : available ? `${Number(p.stock_quantity)} left` : "Out of stock";
        return `<article class="product-card" data-id="${Number(p.id)}"><a class="product-media" href="product.html?id=${Number(p.id)}"><img src="${esc(imageFor(p))}" alt="${esc(p.title)}" loading="lazy" onerror="this.src='images/Other.jpg'"><span class="product-category">${esc(p.category || "Other")}</span></a><div class="product-body"><a class="product-title" href="product.html?id=${Number(p.id)}">${esc(p.title)}</a><div class="product-meta"><strong>GH₵${Number(p.price).toFixed(2)}</strong><span class="${available ? (Number(p.stock_quantity) <= 5 ? "stock-low" : "stock-good") : "stock-out"}">${esc(stock)}</span></div><button class="add-cart" data-cart-id="${Number(p.id)}" ${available ? "" : "disabled"}>${available ? "<i class='fa-solid fa-cart-plus'></i> Add to cart" : esc(stock)}</button></div></article>`;
    }).join("");
    target.querySelectorAll("[data-cart-id]").forEach(button => button.onclick = () => addToCart(button.dataset.cartId, button));
}

function setupFilters() {
    const search = document.getElementById("storeSearch"), sort = document.getElementById("storeSort"); let category = "All";
    const apply = () => { const q = search.value.trim().toLowerCase(); let list = store.products.filter(p => (category === "All" || p.category === category) && (`${p.title} ${p.description || ""}`.toLowerCase().includes(q))); if (sort.value === "low") list.sort((a,b) => a.price - b.price); if (sort.value === "high") list.sort((a,b) => b.price - a.price); if (sort.value === "latest") list.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)); renderProducts(list); };
    search.oninput = apply; sort.onchange = apply;
    document.querySelectorAll("#storeCategories button").forEach(button => button.onclick = () => { document.querySelectorAll("#storeCategories button").forEach(b => b.classList.remove("active")); button.classList.add("active"); category = button.dataset.category; apply(); });
}

async function setupFollow() {
    const button = document.getElementById("followBtn");
    if (!token()) return;
    try { const status = await request(`/follow/${encodeURIComponent(store.store.user_id)}`); setFollow(button, status.following); } catch (e) { console.warn(e); }
    button.onclick = async () => { if (!token()) return toast("Please log in first.", "error"); button.disabled = true; try { const data = await request("/follow", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ following_user_id:store.store.user_id }) }); setFollow(button, data.following); toast(data.message || (data.following ? "Store followed." : "Store unfollowed.")); } catch(e) { toast(e.message, "error"); } finally { button.disabled = false; } };
}
function setFollow(button, following) { button.innerHTML = following ? '<i class="fa-solid fa-bookmark"></i> Following' : '<i class="fa-regular fa-bookmark"></i> Follow store'; button.classList.toggle("is-following", following); }

async function addToCart(id, button) { if (!token()) return toast("Please log in to add items to your cart.", "error"); const original = button.innerHTML; button.disabled = true; try { const data = await request("/listings/interest", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ listing_id:Number(id) }) }); toast(data.message || "Added to cart!"); if (window.loadCartCount) await window.loadCartCount(); button.innerHTML = '<i class="fa-solid fa-check"></i> Added'; setTimeout(() => { button.innerHTML = original; button.disabled = false; }, 1200); } catch(e) { toast(e.message, "error"); button.innerHTML = original; button.disabled = false; } }
function messageSeller(id, name) { if (!token()) return toast("Please log in to message this seller.", "error"); localStorage.setItem("openConversationWith", id); localStorage.setItem("openConversationName", name || "Seller"); location.href = "inbox.html"; }
window.addToCart = addToCart; window.messageSeller = messageSeller; loadStore();
