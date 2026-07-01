
let currentItems = [];
const container = document.getElementById("interestedContainer");

async function loadInterested() {
  const token = localStorage.getItem("token");

  const res = await fetch("https://acity-backend.onrender.com/api/listings/interested", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const items = await res.json();
  currentItems = items;

  const subtotal =
items.reduce(

    (sum,item)=>

    sum + Number(item.price),

    0

);

document.getElementById(

    "summaryItems"

).textContent = items.length;

document.getElementById(

    "summarySubtotal"

).textContent =

`₵${subtotal}`;

document.getElementById(

    "summaryTotal"

).textContent =

`₵${subtotal}`;

    if(items.length === 0){

        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-cart-shopping"></i>
                <h3>Your Cart Is Empty</h3>
                <p>Browse the marketplace and add items.</p>
            </div>
        `;

        return;
    }

    container.innerHTML = "";

  items.forEach(item => {
    const div = document.createElement("div");
    div.classList.add("cart-card");

    
   div.innerHTML = `

   <div class="cart-image-wrapper">

    <img
        src="${item.image_url || `images/${item.category}.jpg`}"
        class="cart-image"
        onerror="this.src='images/Other.jpg'"
    >

    </div>

    <div class="cart-details">

    <div class="cart-header">

        <h3>${item.title}</h3>

        <span class="cart-price">
            ₵${item.price}
        </span>

    </div>

    <p class="cart-description">
        ${item.description}
    </p>

    <div class="cart-meta">

        <span class="listing-badge">
            ${item.status}
        </span>

        <span class="order-badge">
            ${item.order_status || "Not Ordered"}
        </span>

    </div>

    <div class="cart-actions">

        <button
            class="btn-message"
            onclick="messageSeller(${item.user_id})"
        >
            <i class="fa-solid fa-comments"></i>
            Message
        </button>

        <button
            class="btn-checkout"
            onclick="checkoutItem(${item.id})"
        >
            <i class="fa-solid fa-credit-card"></i>
            Checkout
        </button>

        <button
            class="btn-remove"
            onclick="removeFromCart(${item.id})"
        >
            <i class="fa-solid fa-trash"></i>
            Remove
        </button>

    </div>

    </div>


    `;
    container.appendChild(div);
  });
}
async function removeFromCart(listingId) {
  const token = localStorage.getItem("token");

  if (confirm("Remove this item from cart?")) {
    const res = await fetch(`https://acity-backend.onrender.com/api/listings/cart/${listingId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`     
      }
    });

    const data = await res.json();

    alert(data.message || data.error);
    loadInterested(); 
    loadCartCount();
  }
}

function getStatusText(status) {
  if (status === "available") return "Pending (waiting for seller)";
  if (status === "sold") return "Completed";
  if (status === "swapped") return "Trade Completed";
  return "Unknown";
}

let selectedItem = null;

let checkoutAllMode = false;



function checkoutItem(id) {

    checkoutAllMode = false;

    const item =
    currentItems.find(
        product =>
        product.id === id
    );

    selectedItem = item;

    document
    .getElementById(
        "checkoutTitle"
    )
    .textContent =
    item.title;

    document
    .getElementById(
        "checkoutPrice"
    )
    .textContent =
    `₵${item.price}`;

    document
    .getElementById(
        "checkoutImage"
    )
    .src =
    item.image_url ||
    `images/${item.category}.jpg`;

    document
    .getElementById(
        "productTotal"
    )
    .textContent =
    `₵${item.price}`;

    document
    .getElementById(
        "grandTotal"
    )
    .textContent =
    `₵${item.price}`;

    document
    .getElementById(
        "checkoutModal"
    )
    .style.display =
    "flex";

}

function checkoutAll() {

    if (currentItems.length === 0) {

        showToast("Your cart is empty", "error");
        return;

    }

    checkoutAllMode = true;

    selectedItem = null;

    document.getElementById("checkoutTitle").textContent =
        `${currentItems.length} Items`;

    document.getElementById("checkoutPrice").textContent =
        `₵${currentItems.reduce((sum, item) => sum + Number(item.price), 0)}`;

    document.getElementById("checkoutImage").src =
        currentItems[0].image_url ||
        `images/${currentItems[0].category}.jpg`;

    const total =
        currentItems.reduce((sum, item) => sum + Number(item.price), 0);

    document.getElementById("productTotal").textContent =
        `₵${total}`;

    document.getElementById("grandTotal").textContent =
        `₵${total}`;

    document.getElementById("checkoutModal").style.display =
        "flex";

}

document.addEventListener(
    "change",
    function(e) {

        if (
            e.target.name !==
            "deliveryMethod"
        ) return;

        const container =
        document.getElementById(
            "deliveryFields"
        );

        if (
            e.target.value ===
            "room"
        ) {

            container.innerHTML = `

                <select id="hostel">

                    <option>
                        Hostel A
                    </option>

                    <option>
                        Hostel B
                    </option>

                </select>

                <input
                    id="roomNumber"
                    placeholder="Room Number"
                >

            `;

        } else {

            container.innerHTML = `

                <input
                    id="meetingLocation"
                    placeholder="Meeting Location"
                >

            `;

        }

    }
);

document
.addEventListener(
    "change",
    function(e) {

        if (
            e.target.name ===
            "deliveryMethod"
        ) {

            document
            .querySelectorAll(
                ".delivery-card"
            )
            .forEach(card => {

                card.classList.remove(
                    "selected"
                );

                document
                .getElementById(
                    "placeOrderBtn"
                )
                .disabled = false;

            });

            e.target
            .closest(
                ".delivery-card"
            )
            .classList.add(
                "selected"
            );

        }

    }
);

function closeCheckout() {

    document
        .getElementById("checkoutModal")
        .style.display = "none";

}

function messageSeller(userId) {

    localStorage.setItem(
        "receiver_id",
        userId
    );

    window.location.href =
    "conversation.html";

}

async function placeOrder() {

    const token =
    localStorage.getItem(
        "token"
    );

    try {

    const itemsToOrder = checkoutAllMode
        ? currentItems
        : [selectedItem];

    for (const item of itemsToOrder) {

        const res = await fetch(
            "https://acity-backend.onrender.com/api/listings/orders",
            {

                method: "POST",

                headers: {

                    "Content-Type":"application/json",

                    "Authorization":
                    `Bearer ${token}`

                },

                body: JSON.stringify({

                    listing_id: item.id,

                    seller_id: item.user_id,

                    delivery_method: deliveryMethod,

                    hostel,

                    room_number,

                    meeting_location

                })

            }
        );

        if (!res.ok) {

            const data = await res.json();

            throw new Error(
                data.message || "Order failed"
            );

        }

    }

    showToast(

        checkoutAllMode
        ? "All orders placed!"
        : "Order placed!"

    );

    closeCheckout();

    loadInterested();

    loadCartCount();

} catch(err){

    console.error(err);

    showToast(

        err.message,

        "error"

    );

}

    const deliveryMethod =
    document.querySelector(
        'input[name="deliveryMethod"]:checked'
    )?.value;

    if (!deliveryMethod) {

        alert(
            "Select a delivery method"
        );

        return;

    }

    let hostel = null;
    let room_number = null;
    let meeting_location = null;

    if (
        deliveryMethod ===
        "room"
    ) {

        hostel =
        document.getElementById(
            "hostel"
        )?.value;

        room_number =
        document.getElementById(
            "roomNumber"
        )?.value;

    }

    if (
        deliveryMethod ===
        "meetup"
    ) {

        meeting_location =
        document.getElementById(
            "meetingLocation"
        )?.value;

    }

    try {

        const res =
        await fetch(
            "https://acity-backend.onrender.com/api/listings/orders",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                    "application/json",

                    "Authorization":
                    `Bearer ${token}`
                },

                body: JSON.stringify({

                    listing_id:
                    selectedItem.id,

                    seller_id:
                    selectedItem.user_id,

                    delivery_method:
                    deliveryMethod,

                    hostel,

                    room_number,

                    meeting_location

                })

            }
        );

        const data =
        await res.json();

        alert(
            data.message
        );

        closeCheckout();

    } catch(err) {

        console.error(err);

        alert(
            "Failed to create order"
        );

    }

}
loadInterested();