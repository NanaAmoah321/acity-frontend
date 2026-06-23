
let currentItems = [];
const container = document.getElementById("interestedContainer");

async function loadInterested() {
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:5000/api/listings/interested", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const items = await res.json();
  currentItems = items;

  container.innerHTML = "";

  if (items.length === 0) {
    container.innerHTML = "<p>No interested items yet.</p>";
    return;
  }

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
    const res = await fetch(`http://localhost:5000/api/listings/cart/${listingId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`     
      }
    });

    const data = await res.json();

    alert(data.message || data.error);
    loadInterested(); 
  }
}

function getStatusText(status) {
  if (status === "available") return "Pending (waiting for seller)";
  if (status === "sold") return "Completed";
  if (status === "swapped") return "Trade Completed";
  return "Unknown";
}

let selectedItem = null;



function checkoutItem(id) {

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
    "message.html";

}

async function placeOrder() {

    const token =
    localStorage.getItem(
        "token"
    );

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
            "http://localhost:5000/api/listings/orders",
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