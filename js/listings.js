("JS is connected");
const ItemsContainer = document.getElementById('ItemsContainer');
const searchInput = document.getElementById('searchInput');
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

function safeImageUrl(value, fallback = "images/Other.jpg") {
    const imageValue = String(value || "")
        .trim()
        .toLowerCase();

    if (
        !imageValue ||
        imageValue === "null" ||
        imageValue === "undefined"
    ) {
        return fallback;
    }

    try {
        const url = new URL(value, window.location.origin);

        if (
            url.protocol === "https:" ||
            url.origin === window.location.origin
        ) {
            return url.href;
        }
    } catch {
        return fallback;
    }

    return fallback;
}

function formatStoreTime(timeString) {

    if (!timeString) return "";

    const [hour, minute] = timeString.split(":").map(Number);

    const date = new Date();

    date.setHours(hour, minute);

    return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
    });

}

function getStoreStatus(openingTime, closingTime) {

    if (!openingTime || !closingTime) {

        return {
            open: false,
            text: "Hours unavailable"
        };

    }

    const now = new Date();

    const open = new Date();
    const close = new Date();

    const [openHour, openMinute] = openingTime.split(":").map(Number);
    const [closeHour, closeMinute] = closingTime.split(":").map(Number);

    open.setHours(openHour, openMinute, 0, 0);
    close.setHours(closeHour, closeMinute, 0, 0);

    const isOpen = now >= open && now <= close;

    return {

        open: isOpen,

        text: isOpen
            ? `Open • Closes at ${formatStoreTime(closingTime)}`
            : `Closed • Opens at ${formatStoreTime(openingTime)}`

    };

}

async function loadItems() {
    const res = await fetch(
        `https://acity-backend.onrender.com/api/listings/stores?t=${Date.now()}`,
        {
            cache: "no-store"
        }
    );
    allStores = await res.json();
    renderStores(allStores);
}
function renderStores(stores) {
    const searchText = searchInput
        ? searchInput.value.toLowerCase().trim()
        : "";

    const filteredStores = stores.filter(store => {
        const storeName =
            String(store.store_name || "").toLowerCase();

        const category =
            String(store.store_category || "").toLowerCase();

        const sellerName =
            String(store.store_name || "").toLowerCase();

        const matchesSearch =
            storeName.includes(searchText) ||
            category.includes(searchText) ||
            sellerName.includes(searchText);

        const matchesCategory =
            selectedCategory === "All" ||
            category.trim() ===
                selectedCategory.toLowerCase().trim();

        return matchesSearch && matchesCategory;
    });

    ItemsContainer.replaceChildren();

    if (filteredStores.length === 0) {
        ItemsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-store-slash"></i>
                <h3>No Stores Found</h3>
                <p>Try another search or category.</p>
            </div>
        `;
        return;
    }

    filteredStores.forEach(store => {
        const card = document.createElement("article");
        card.className = "store-card";

        const image = document.createElement("img");
        image.className = "store-image";
        image.alt = `${store.store_name || "Store"} image`;
        image.src = safeImageUrl(
            store.profile_image,
            getStoreImage(
                Array.isArray(store.categories)
                    ? store.categories[0]
                    : "Other"
            )
        );

        image.onerror = () => {
            image.src = "images/Other.jpg";
        };

        /* Store image category badges */

    const badgeContainer = document.createElement("div");
    badgeContainer.className = "store-badges";

    const categories = Array.isArray(store.categories)
        ? store.categories
        : [];

    if (categories.length) {

        categories.forEach(cat => {

            const badge = document.createElement("span");

            badge.className = "store-badge";

            badge.textContent = cat;

            badgeContainer.appendChild(badge);

        });

    }

    const imageWrapper = document.createElement("div");
    imageWrapper.className = "store-image-wrapper";

    imageWrapper.append(
        image,
        badgeContainer
    );

    const info = document.createElement("div");
    info.className = "store-info";

    const name = document.createElement("h3");

    name.textContent =
        store.store_name || "Student Store";

    const status = document.createElement("p");

    status.className = "store-status";

    const now = new Date();

    const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();

    let statusText =
        "Hours unavailable";

    if (
        store.opening_time &&
        store.closing_time
    ) {

        const [oh, om] =
            store.opening_time
                .split(":")
                .map(Number);

        const [ch, cm] =
            store.closing_time
                .split(":")
                .map(Number);

        const open =
            oh * 60 + om;

        const close =
            ch * 60 + cm;

        const isOpen =
            currentMinutes >= open &&
            currentMinutes < close;

        const closing =
            new Date(
                `1970-01-01T${store.closing_time}`
            ).toLocaleTimeString([],{

                hour:"numeric",

                minute:"2-digit"

            });

        statusText = isOpen

            ? `🟢 Open until ${closing}`

            : "🔴 Closed";

    }

    status.textContent =
        statusText;

    const rating =
        document.createElement("p");

    rating.className =
        "store-rating";

    rating.textContent =
        store.average_rating

            ? `⭐ ${store.average_rating} (${store.total_reviews})`

            : "⭐ New Store";

    
    const storeStatus = getStoreStatus(
        store.opening_time,
        store.closing_time
    );

    const storeStatusElement = document.createElement("p");
    storeStatusElement.className = storeStatus.open
        ? "store-open"
        : "store-closed";

    storeStatusElement.innerHTML = storeStatus.open
        ? `<i class="fa-solid fa-circle"></i> ${storeStatus.text}`
        : `<i class="fa-solid fa-circle"></i> ${storeStatus.text}`;
    
    const visitButton =
        document.createElement("button");

    visitButton.type = "button";

    visitButton.textContent =
        "Visit Store";

    visitButton.addEventListener("click",()=>{

        viewStore(store.user_id);

    });

    info.append(

        name,

        storeStatusElement,

        rating,

        

        visitButton

    );

    card.append(

        imageWrapper,

        info

    );
        ItemsContainer.appendChild(card);
    });
}

function createPublicListingCard(item) {
    const card = document.createElement("article");
    card.className = "featured-card";
card.setAttribute("role", "button");
card.tabIndex = 0;

const openListing = () => {
    viewListing(item.id);
};

card.addEventListener("click", openListing);

card.addEventListener("keydown", event => {

    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openListing();
    }
});

const imageWrapper = document.createElement("div");
imageWrapper.className = "featured-image";

const image = document.createElement("img");
image.alt = item.title || "Listing image";
image.src = safeImageUrl(item.image_url);

image.onerror = () => {
    image.src = "images/Other.jpg";
};

const category = document.createElement("span");
category.className = "featured-category";
category.textContent = item.category || "Other";

imageWrapper.append(
    image,
    category
);

const info = document.createElement("div");
info.className = "featured-info";

const title = document.createElement("h3");
title.textContent = item.title || "Untitled Listing";







const price = document.createElement("p");
price.className = "featured-price";

const numericPrice = Number(item.price);

price.textContent = Number.isFinite(numericPrice)
    ? `GH₵${numericPrice.toFixed(2)}`
    : "Price unavailable";

const stock = document.createElement("p");
stock.className = "stock";

const quantity = Number(item.stock_quantity || 0);

if (quantity > 5) {
    stock.innerHTML =
        `<i class="fa-solid fa-box"></i>`;

    stock.append(` ${quantity} in stock`);
} else if (quantity > 0) {
    stock.innerHTML =
        `<i class="fa-solid fa-fire"></i>`;

    stock.append(` Only ${quantity} left`);
} else {
    stock.innerHTML =
        `<i class="fa-solid fa-circle-xmark"></i>`;

    stock.append(" Out of stock");
}

const footer = document.createElement("div");
footer.className = "featured-footer";

const seller = document.createElement("span");
seller.textContent = item.seller_name || "Student Seller";

const arrow = document.createElement("i");
arrow.className = "fa-solid fa-arrow-right";

footer.append(seller, arrow);
info.append(title, price, stock, footer);
card.append(imageWrapper, info);

return card;
}

async function loadFeaturedProducts() {
    const container =
    document.getElementById("featuredProducts");
    if (!container) return;
    container.innerHTML = "";
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
        container.appendChild(
            createPublicListingCard(item)
        );
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
    .slice(0, 8)
    .forEach(item => {
        container.appendChild(
            createPublicListingCard(item)
        );
    });
}


function getCategoryImage(category){
    return `images/${category}.jpg`;
}


function viewListing(listingId) {
    window.location.href =
        `product.html?id=${encodeURIComponent(listingId)}`;
}
function viewStore(userId) {
    window.location.href =
    `listing.html?id=${userId}`;
}
function viewService(id) {
    window.location.href =
    `services.html?id=${id}`;
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