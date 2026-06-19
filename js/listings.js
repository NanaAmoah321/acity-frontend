console.log("JS is connected");
const ItemsContainer = document.getElementById('ItemsContainer');
const searchInput = document.getElementById('searchInput');
//const categoryFilter = document.getElementById('categoryFilter');

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

    const searchText =
    searchInput.value.toLowerCase();

    //const selectedCategory =
    //categoryFilter.value;

    ItemsContainer.innerHTML = "";

    const filteredStores =
    stores.filter(store => {

      const matchesSearch =

        store.store_name
        .toLowerCase()
        .includes(searchText)

        ||

        (store.store_category || "")
        .toLowerCase()
        .includes(searchText);

      //const matchesCategory =

        //selectedCategory === "All"

        //||

        //store.store_category === selectedCategory;

      return matchesSearch;

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
if (ItemsContainer) {
    loadItems();

    searchInput.addEventListener('input', loadItems);
    //categoryFilter.addEventListener('change', loadItems);
}

const ItemForm = document.getElementById("ItemForm");

if (ItemForm) {
  ItemForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const category = document.getElementById("category").value;
    const status = document.getElementById("status").value;
    const price = document.getElementById("price").value;
    const image_url = document.getElementById("image_url").value;

    console.log({
      title,
      description,
      category,
      status,
      price,
      image_url
    });

    const res = await fetch("http://localhost:5000/api/listings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ title, description, category, status, price, image_url })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Item created successfully!");
      window.location.href = "index.html";
    } else {
      alert(data.message || data.error);
    }
  });
}

async function addInterest(listingId) {
  const token = localStorage.getItem("token");
  console.log("TOKEN:", token);


  if (!token) {
    alert("Please login first");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/listings/interest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ listing_id: listingId })
    });

    const data = await res.json();
    console.log("Response:", data);

    if (res.ok) {
      alert("Added to cart!");
    } else {
      alert(data.message);
    }

  } catch (err) {
    console.error(err);
  }
}

function messageSeller(userId) {

    localStorage.setItem(
        "receiver_id",
        userId
    );

    window.location.href =
    "message.html";

}

function viewListing(id) {

    window.location.href =
    `listing.html?id=${id}`;

}

function viewStore(userId) {

    window.location.href =
    `listing.html?id=${userId}`;

}

async function loadFeaturedProducts(){

    const res =
    await fetch(
        "http://localhost:5000/api/listings"
    );

    

    const listings =
    await res.json();

    const container =
    document.getElementById(
        "featuredProducts"
    );

    container.innerHTML = "";

    listings
    .slice(0,6)
    .forEach(item=>{

       console.log(
          item.title,
          item.image_url
        );

        container.innerHTML += `

        <div class="product-card" onclick="viewListing(${item.id})">

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

    const res =
    await fetch(
        "http://localhost:5000/api/services"
    );

    const services =
    await res.json();

    const container =
    document.getElementById(
        "servicesContainer"
    );

    container.innerHTML = "";

    services
.slice(0,6)
.forEach(service=>{

    container.innerHTML += `

    <div class="card">

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

    const res =
    await fetch(
        "http://localhost:5000/api/listings"
    );

    const listings =
    await res.json();

    const container =
    document.getElementById(
        "recentListings"
    );

    container.innerHTML = "";

    listings
    .slice(0,8)
    .forEach(item=>{

        container.innerHTML += `

        <div class="product-card" onclick="viewListing(${item.id})">

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

function messageProvider(userId) {

    localStorage.setItem(
        "receiver_id",
        userId
    );

    window.location.href =
    "message.html";

}

function viewListing(id) {
    window.location.href =
    `listing.html?id=${id}`;
}

loadItems();
loadFeaturedProducts();
loadServices();
loadRecentListings();