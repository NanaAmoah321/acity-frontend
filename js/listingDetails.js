const params = new URLSearchParams(window.location.search);

const userId = params.get("id");

async function loadStore() {


try {

    const storeRes = await fetch(
        `http://localhost:5000/api/listings/store/${userId}`
    );

    const store = await storeRes.json();

    console.log(store);
    console.log(store.seller);
    console.log(store.products);

    document.getElementById("listingDetails").innerHTML = `

        <div class="store-header">

            <img
                src="images/${store.seller.store_category || 'Other'}.jpg"
                class="store-banner"
                onerror="this.src='images/Other.jpg'"
            >

            <div class="store-overlay">

                <h1>
                    ${store.seller.seller_name}'s Store
                </h1>

                <p>
                    ${store.seller.store_category || "General"} Store
                </p>

                <p>
                    ⭐ ${store.seller.average_rating || "No rating"}
                    (${store.seller.total_reviews || 0} Reviews)
                </p>

                <button
                    onclick="messageSeller(${store.seller.id})"
                >
                    Message Seller
                </button>

            </div>

        </div>

        <h2 class="products-heading">
            Products
        </h2>

        <div class="store-products">

            ${store.products.map(product => `

                

                <div class="store-product-card">

                    <img
                        src="${product.image_url || `images/${product.category}.jpg`}"
                        class="listing-image"
                        onerror="this.src='images/Other.jpg'"
                    >

                    <h3>${product.title}</h3>


                    <p class="product-price">
                        ₵${product.price}
                    </p>

                    <p class="product-status">
                        ${product.status}
                    </p>

                    <button
                        onclick="addToCart(${product.id})"
                    >
                        Add To Cart
                    </button>

                </div>

            `).join("")}

        </div>

    `;

} catch (err) {

    console.error(err);

}


}

loadStore();

function messageSeller(userId) {


localStorage.setItem(
    "receiver_id",
    userId
);

window.location.href =
"message.html";


}

async function addToCart(listingId) {


const token =
localStorage.getItem("token");

if (!token) {

    alert("Please login first");
    return;

}

try {

    const res = await fetch(
        "http://localhost:5000/api/listings/interest",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                listing_id: listingId
            })
        }
    );

    const data = await res.json();

    alert(data.message);

} catch (err) {

    console.error(err);

    alert("Failed to add item");

}


}
