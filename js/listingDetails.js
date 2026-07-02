const params = new URLSearchParams(window.location.search);

const userId = params.get("id");

const listingDetails =
document.getElementById("listingDetails");

let store = null;

async function loadStore(){

    try{

        const res = await fetch(

            `https://acity-backend.onrender.com/api/listings/store/${userId}`

        );

        store = await res.json();

        renderStore();

    }catch(err){

        console.error(err);

        listingDetails.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-store-slash"></i>

                <h2>

                    Store not found

                </h2>

                <p>

                    We couldn't load this store.

                </p>

            </div>

        `;

    }

}

loadStore();

function renderStore(){

    listingDetails.innerHTML = `

<section class="store-card">

    <div class="store-avatar">

        <img

        src="images/${store.seller.store_category || "Other"}.jpg"

        onerror="this.src='images/Other.jpg'"

        >

    </div>

    <div class="store-info">

        <span class="store-badge">

            ${store.seller.store_category || "General"}

        </span>

        <h1>

            ${store.seller.seller_name}'s Store

        </h1>

        <div class="store-rating">

            ⭐ ${store.seller.average_rating || "New"}

            •

            ${store.seller.total_reviews || 0} Reviews

        </div>

        <p class="store-description">

            Browse everything available from this Academic City seller.

        </p>

        <div class="store-actions">

            <button

                class="message-btn"

                onclick="messageSeller(${store.seller.id})"

            >

                <i class="fa-solid fa-comments"></i>

                Message Seller

            </button>

            <button

                class="follow-btn"

            >

                <i class="fa-regular fa-bookmark"></i>

                Follow Store

            </button>

        </div>

    </div>

    <div class="store-stats">

        <div class="store-stat">

            <h2>

                ${store.products.length}

            </h2>

            <p>

                Products

            </p>

        </div>

        <div class="store-stat">

            <h2>

                ${store.seller.total_reviews || 0}

            </h2>

            <p>

                Reviews

            </p>

        </div>

        <div class="store-stat">

            <h2>

                ${store.seller.average_rating || "New"}

            </h2>

            <p>

                Rating

            </p>

        </div>

        <div class="store-stat">

            <h2>

                2026

            </h2>

            <p>

                Joined

            </p>

        </div>

    </div>

</section>

<section class="store-toolbar">

    <div class="store-search">

        <i class="fa-solid fa-magnifying-glass"></i>

        <input
            type="text"
            id="storeSearch"
            placeholder="Search this store..."
        >

    </div>

    <select
        id="storeSort"
        class="store-sort"
    >

        <option value="latest">
            Latest
        </option>

        <option value="low">
            Price: Low to High
        </option>

        <option value="high">
            Price: High to Low
        </option>

    </select>

</section>

<section class="store-categories">

    <button class="active" data-category="All">
        All
    </button>

    <button data-category="Books">
        Books
    </button>

    <button data-category="Electronics">
        Electronics
    </button>

    <button data-category="Academic">
        Academic
    </button>

    <button data-category="Hostel Items">
        Hostel
    </button>

    <button data-category="Clothing">
        Clothing
    </button>

    <button data-category="Other">
        Other
    </button>

</section>

<section class="store-products-section">

    <div class="section-header">

        <div>

            <h2>

                Products

            </h2>

            <p>

                ${store.products.length} item${store.products.length !== 1 ? "s" : ""} available

            </p>

        </div>

    </div>

    <div
        class="store-products"
        id="storeProducts"
    >

    </div>

</section>

`;

renderProducts(store.products);

setupStoreFilters();

}

function renderProducts(products){

    const container =
    document.getElementById("storeProducts");

    if(!container) return;

    if(products.length === 0){

        container.innerHTML = `

        <div class="empty-state">

            <i class="fa-solid fa-box-open"></i>

            <h3>

                No Products Found

            </h3>

            <p>

                Try another search or category.

            </p>

        </div>

        `;

        return;

    }

    container.innerHTML = products.map(product => `

        <div class="featured-card">

            <div class="featured-image">

                <img

                    src="${product.image_url || `images/${product.category}.jpg`}"

                    onerror="this.src='images/Other.jpg'"

                >

            </div>

            <div class="featured-info">

                <span class="featured-category">

                    ${product.category}

                </span>

                <h3>

                    ${product.title}

                </h3>

                <div class="featured-price">

                    GH₵${product.price}

                </div>

                <div class="listing-stock">

${
    product.stock_quantity > 5

    ?

    `<span class="stock-good">
        <i class="fa-solid fa-box"></i>
        ${product.stock_quantity} Available
    </span>`

    :

    product.stock_quantity > 0

    ?

    `<span class="stock-low">
        🔥 Only ${product.stock_quantity} left
    </span>`

    :

    `<span class="stock-out">
        ❌ Out of Stock
    </span>`
}

</div>

                <div class="featured-footer">

                    <span>

                        ${product.status}

                    </span>

                    ${
                        product.stock_quantity > 0

                        ?

                        `

                        <button
                        class="btn-primary"
                        onclick="addToCart(${product.id})"
                        >

                        Add to Cart

                        </button>

                        `

                            :

                            `

                        <button
                        class="btn-secondary"
                        disabled
                        >

                        Out of Stock

                        </button>

                        `

                        }

                </div>

            </div>

        </div>

    `).join("");

}

function setupStoreFilters(){

    const search =
    document.getElementById("storeSearch");

    const buttons =
    document.querySelectorAll(".store-categories button");

    let category = "All";

    function filter(){

        let filtered =
        [...store.products];

        if(category !== "All"){

            filtered =
            filtered.filter(product =>
                product.category === category
            );

        }

        const text =
        search.value.toLowerCase();

        filtered = filtered.filter(product => {

            const title = (product.title || "").toLowerCase();
            const description = (product.description || "").toLowerCase();

            return (
                title.includes(text) ||
                description.includes(text)
            );

        });

        renderProducts(filtered);

    }

    search.addEventListener(
        "input",
        filter
    );

    buttons.forEach(button=>{

        button.onclick=()=>{

            buttons.forEach(b=>
                b.classList.remove("active")
            );

            button.classList.add("active");

            category =
            button.dataset.category;

            filter();

        };

    });

}




async function addToCart(listingId) {
    console.log("1. addToCart called");

    const token = localStorage.getItem("token");
    console.log("2. token:", token);

    if (!token) {
        alert("Please login first");
        return;
    }

    try {
        const res = await fetch(
            "https://acity-backend.onrender.com/api/listings/interest",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    listing_id: listingId
                })
            }
        );

        console.log("3. fetch finished");

        const data = await res.json();
        console.log("4.", data);

        if (res.ok) {
            console.log("5. About to show toast");

            showToast("Added to cart!");

            console.log("6. Toast called");

            if (typeof updateCartCount === "function") {
                updateCartCount();
            }

        } else {
            console.log("Server error:", data);
            showToast(data.message || "Failed", "error");
        }

    } catch (err) {
        console.error(err);
    }
}

function messageSeller(userId) {

    localStorage.setItem(
        "openConversationWith",
        userId
    );

    window.location.href =
        "inbox.html";

}