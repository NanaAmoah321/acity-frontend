console.log("JS is connected");
const ItemsContainer = document.getElementById('ItemsContainer');
const searchInput = document.getElementById('searchInput');
//const categoryFilter = document.getElementById('categoryFilter');
let selectedCategory = "All";

document
.querySelectorAll(".categories button")
.forEach(button => {

    button.addEventListener("click", () => {

        document
        .querySelectorAll(".categories button")
        .forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        selectedCategory =
        button.textContent.trim();

        loadItems();

    });

});

function getStoreImage(category) {

    return `images/${category || "Other"}.jpg`;

}

async function loadItems() {



    const res =
    await fetch(
        "http://localhost:5000/api/listings/stores"
    );

    const stores =
    await res.json();

    console.log(stores);

    const searchText =
    searchInput
    ? searchInput.value.toLowerCase()
    : "";

    //const selectedCategory =
    //categoryFilter.value;

    ItemsContainer.innerHTML = "";


    const filteredStores =
    stores.filter(store => {

        console.log(store.store_category);

        const matchesSearch =

        store.store_name
        .toLowerCase()
        .includes(searchText)

        ||

        (store.store_category || "")
        .toLowerCase()
        .includes(searchText);

        const matchesCategory =

            selectedCategory === "All"

            ||

            (store.store_category || "")
            === selectedCategory;

        return (
            matchesSearch &&
            matchesCategory
        );

    });

    filteredStores.forEach(store => {

      console.log(store);

      const card =
      document.createElement("div");

      card.classList.add(
          "store-card"
      );

        card.innerHTML = `

            <img
                src="${getStoreImage(store.store_category)}"
                class="store-image"
            >

            <div class="store-info">

                <h3>
                    ${store.store_name}'s Store
                </h3>

                <p class="store-category">
                ${store.store_category || "General"} Store
                </p>


                <p>
                    ⭐ ${
                        store.average_rating
                        || "No rating"
                    }
                    (
                    ${
                        store.total_reviews
                        || 0
                    }
                    Reviews)
                </p>

                <p>
                    ${
                        store.total_products
                    }
                    Products
                </p>

                <button
                    onclick="
                    viewStore(
                    ${store.user_id}
                    )"
                >
                    Visit Store
                </button>

            </div>

        `;

        ItemsContainer.appendChild(
            card
        );

    });

}

async function loadFeaturedProducts(){

    const container =
    document.getElementById("featuredProducts");

    if (!container) return;

    container.innerHTML = "";

    for(let i = 0; i < 6; i++){

        container.innerHTML += `
            <div class="product-skeleton skeleton-card"></div>
        `;

    }

    const res =
    await fetch(
        "http://localhost:5000/api/listings"
    );

    

    const listings =
    await res.json();




    container.innerHTML = "";

    if (listings.length === 0) {

    container.innerHTML = `
        <div class="empty-state">
            <i class="fa-solid fa-box-open"></i>
            <h3>No Featured Products Yet</h3>
            <p>Products posted by students will appear here.</p>
        </div>
    `;

    return;
    }

    listings
    .slice(0,15)
    .forEach(item=>{

       console.log(
          item.title,
          item.image_url
        );

        console.log(item);

        container.innerHTML += `

        <div class="product-card" onclick="viewListing(${item.user_id})">

            <img
              src="${
                item.image_url && item.image_url.trim()
                ? item.image_url
                : `images/${item.category || "Other"}.jpg`
                }"
            >

            <div class="product-info">

                <h3>${item.title}</h3>

                <p class="price">
                    GH₵ ${item.price}
                </p>

                <p>
                    ${item.category}
                </p>

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
        "http://localhost:5000/api/services"
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

    <div class="service-card">

        <h3>
            ${service.title}
        </h3>

        <p class="provider">
            ${service.provider_name}
        </p>

        <p class="category">
            ${service.category}
        </p>

        <p class="rate">
            GH₵ ${service.rate}
            ${service.rate_type}
        </p>

        <div class="service-actions">

            <button
                onclick="viewService(${service.id})"
                class="details-btn"
            >
                View Details
            </button>

            <button
                onclick="messageProvider(${service.user_id})"
                class="message-btn"
            >
                Message
            </button>

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
        "http://localhost:5000/api/listings"
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

        <div class="product-card" onclick="viewListing(${item.user_id})">

            <img
              src="${
                 item.image_url && item.image_url.trim()
                 ? item.image_url
                 : `images/${item.category || "Other"}.jpg`
              }"
            >

            <div class="product-info">

                <h3>${item.title}</h3>

                <p>
                    GH₵ ${item.price}
                </p>

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
    `service.html?id=${id}`;

}





if (ItemsContainer) {
    loadItems();

    if (searchInput) {
        searchInput.addEventListener("input", loadItems);
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