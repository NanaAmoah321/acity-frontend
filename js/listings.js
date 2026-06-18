console.log("JS is connected");
const ItemsContainer = document.getElementById('ItemsContainer');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');

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

    const selectedCategory =
    categoryFilter.value;

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

      const matchesCategory =

        selectedCategory === "All"

        ||

        store.store_category === selectedCategory;

      return matchesSearch && matchesCategory;

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
    categoryFilter.addEventListener('change', loadItems);
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