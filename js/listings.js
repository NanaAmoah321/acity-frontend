console.log("JS is connected");
const ItemsContainer = document.getElementById('ItemsContainer');
const searchInput = document.getElementById('searchInput');
//const categoryFilter = document.getElementById('categoryFilter');
let selectedCategory = "All";
let allStores = [];
function getSearchQuery(){

    return (
        new URLSearchParams(window.location.search)
            .get("search") || ""
    ).toLowerCase();

}

document
.querySelectorAll(".mobile-categories button")
.forEach(button => {

    button.addEventListener("click", () => {

        document
        .querySelectorAll(".mobile-categories button")
        .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        selectedCategory = button.dataset.category;

        renderStores(allStores);

    });

});

function getStoreImage(category) {

    return `images/${category || "Other"}.jpg`;

}





async function loadItems() {

    const res = await fetch(
        "https://acity-backend.onrender.com/api/listings/stores"
    );

    allStores = await res.json();

    renderStores(allStores);

}

function renderStores(stores){

    const searchText = searchInput
        ? searchInput.value.toLowerCase().trim()
        : "";

    const filteredStores = stores.filter(store => {

        const matchesSearch =

            store.store_name
                .toLowerCase()
                .includes(searchText)

            ||

            (store.store_category || "")
                .toLowerCase()
                .includes(searchText)

            ||

            (store.seller_name || "")
                .toLowerCase()
                .includes(searchText);

        const matchesCategory =

            selectedCategory === "All"

            ||

            (store.store_category || "")
                .toLowerCase()
                .trim() ===
            selectedCategory
                .toLowerCase()
                .trim();

        return matchesSearch && matchesCategory;

    });

    ItemsContainer.innerHTML = "";

    if(filteredStores.length === 0){

        ItemsContainer.innerHTML = `

        <div class="empty-state">

            <i class="fa-solid fa-store-slash"></i>

            <h3>No Stores Found</h3>

            <p>

                Try another search or category.

            </p>

        </div>

        `;

        return;

    }

    filteredStores.forEach(store=>{

        const card = document.createElement("div");

        card.className = "store-card";

        card.innerHTML = `

<img
src="${getStoreImage(store.store_category)}"
class="store-image"
>

<div class="store-info">

    <span class="store-category">

        ${store.store_category || "General"}

    </span>

    <h3>

        ${store.store_name}

    </h3>

    <p>

        ⭐ ${store.average_rating || "New Store"}

    </p>

    <p>

        ${store.total_products} Products

    </p>

    <button
        onclick="viewStore(${store.user_id})"
    >

        Visit Store

    </button>

</div>

`;

        ItemsContainer.appendChild(card);

    });

}

async function loadFeaturedProducts() {

    const container =
    document.getElementById("featuredProducts");

    if (!container) return;

    container.innerHTML = "";

    // Loading Skeletons
    for (let i = 0; i < 6; i++) {

        container.innerHTML += `

        <div class="featured-card skeleton-card">

            <div class="featured-image skeleton"></div>

            <div class="featured-info">

                <div class="skeleton skeleton-pill"></div>

                <div class="skeleton skeleton-title"></div>

                <div class="skeleton skeleton-price"></div>

                <div class="featured-footer">

                    <div class="skeleton skeleton-store"></div>

                    <div class="skeleton skeleton-circle"></div>

                </div>

            </div>

        </div>

        `;

    }

    const res =
    await fetch(
        "https://acity-backend.onrender.com/api/listings"
    );

    let listings =
await res.json();

if(getSearchQuery()){

    listings = listings.filter(item=>

        item.title
            .toLowerCase()
            .includes(getSearchQuery())

        ||

        item.description
            .toLowerCase()
            .includes(getSearchQuery())

        ||

        item.category
            .toLowerCase()
            .includes(getSearchQuery())

        ||

        item.seller_name
            .toLowerCase()
            .includes(getSearchQuery())

    );

}

    container.innerHTML = "";

    // Empty State
    if (listings.length === 0) {

        container.innerHTML = `

        <div class="empty-state">

            <i class="fa-solid fa-box-open"></i>

            <h3>No Featured Products Yet</h3>

            <p>

                Student listings will appear here once they're posted.

            </p>

        </div>

        `;

        return;

    }

    listings
    .slice(0, 15)
    .forEach(item => {

        container.innerHTML += `

<div
class="featured-card"
onclick="viewListing(${item.user_id})">

    <div class="featured-image">

        <img

        src="${
        item.image_url && 
        item.image_url.trim()

        ? item.image_url

        : `images/${item.category || "Other"}.jpg`
        }"

        onerror="this.src='images/Other.jpg'"

       >

    </div>

    <div class="featured-info">

        <span class="featured-category">

            ${item.category}

        </span>

        <h3>

            ${item.title}

        </h3>

        <p class="featured-price">

            GH₵${item.price}

        </p>

        <p class="stock">

        ${
            item.stock_quantity > 5
            ? `<i class="fa-solid fa-box"></i> ${item.stock_quantity} in stock`
            : item.stock_quantity > 0
                ? `<i class="fa-solid fa-fire"></i> Only ${item.stock_quantity} left`
                : `<i class="fa-solid fa-circle-xmark"></i> Out of stock`
        }

        </p>

        <div class="featured-footer">

            <span>

                ${item.seller_name}

            </span>

            <i class="fa-solid fa-arrow-right"></i>

        </div>

    </div>

</div>

`;

    });

}

async function loadServices(){

    const container =
    document.getElementById(
        "servicesContainer"
    );

    if (!container) return;
    
    container.innerHTML = "";

    for(let i=0;i<3;i++){

    container.innerHTML += `
        <div class="service-skeleton skeleton-card">
        </div>
    `;

    }

    const res =
    await fetch(
        "https://acity-backend.onrender.com/api/services"
    );

    const services =
    await res.json();
    
    container.innerHTML = "";

    if (services.length === 0) {

    container.innerHTML = `
        <div class="empty-state">
            <i class="fa-solid fa-screwdriver-wrench"></i>
            <h3>No Services Yet</h3>
            <p>Offer your first skill and start earning.</p>
        </div>
    `;

    return;
    }

    services
.slice(0,6)
.forEach(service=>{

    container.innerHTML += `

<div class="featured-card">

    <div class="service-icon">

        <i class="fa-solid fa-graduation-cap"></i>

    </div>

    <div class="featured-info">

        <span class="featured-category">

            ${service.category}

        </span>

        <h3>

            ${service.title}

        </h3>

        <p class="featured-price">

            GH₵${service.rate}

        </p>

        <div class="featured-footer">

            <span>

                ${service.provider_name}

            </span>

            <i

            onclick="viewService(${service.id})"

            class="fa-solid fa-arrow-right"

            ></i>

        </div>

    </div>

</div>

`;

});
}

async function loadRecentListings(){

    const container =
    document.getElementById(
        "recentListings"
    );

    if (!container) return;

    container.innerHTML = "";

    for(let i=0;i<6;i++){

    container.innerHTML += `
        <div class="product-skeleton skeleton-card">
        </div>
    `;

    }

    const res =
    await fetch(
        "https://acity-backend.onrender.com/api/listings"
    );

    const listings =
    await res.json();

    

    container.innerHTML = "";

    if (listings.length === 0) {

    container.innerHTML = `
        <div class="empty-state">
            <i class="fa-solid fa-tags"></i>
            <h3>No Listings Yet</h3>
            <p>Be the first student to post an item.</p>
        </div>
    `;

    return;
    }

    listings
    .slice(0,8)
    .forEach(item=>{

        container.innerHTML += `

<div

class="featured-card"

onclick="viewListing(${item.user_id})"

>

<div class="featured-image">

<img

src="${
item.image_url &&
item.image_url.trim()

? item.image_url

: `images/${item.category || "Other"}.jpg`
}"

onerror="this.src='images/Other.jpg'"

>

</div>

<div class="featured-info">

<span class="featured-category">

${item.category}

</span>

<h3>

${item.title}

</h3>

<p class="featured-price">

GH₵${item.price}

</p>

<p class="stock">

        ${
            item.stock_quantity > 5
            ? `<i class="fa-solid fa-box"></i> ${item.stock_quantity} in stock`
            : item.stock_quantity > 0
                ? `<i class="fa-solid fa-fire"></i> Only ${item.stock_quantity} left`
                : `<i class="fa-solid fa-circle-xmark"></i> Out of stock`
        }

</p>

<div class="featured-footer">

<span>

${item.seller_name}

</span>

<i class="fa-solid fa-arrow-right"></i>

</div>

</div>

</div>

`;
    });

}


function getCategoryImage(category){

    return `images/${category}.jpg`;

}

function viewService(id){

    window.location.href =
    `services.html?id=${id}`;

}

function viewListing(id) {

    window.location.href =
    `listing.html?id=${id}`;

}

function viewStore(userId) {

    window.location.href =
    `listing.html?id=${userId}`;

}

function viewService(id) {

    window.location.href =
    `service.html?id=${id}`;

}





if (ItemsContainer) {

    loadItems();

    if (searchInput) {

        searchInput.addEventListener("input", () => {

            renderStores(allStores);

        });

    }

}

if (document.getElementById("featuredProducts")) {
    loadFeaturedProducts();
}

if (document.getElementById("servicesContainer")) {
    loadServices();
}

if (document.getElementById("recentListings")) {
    loadRecentListings();
}