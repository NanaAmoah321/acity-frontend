// Global State
let currentItems = [];
let selectedItem = null;
let checkoutAllMode = false;

// 1. Wrap top-level authentication & initialization into an IIFE
(async function init() {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.replace("login.html");
        return;
    }

    // Call initial load functions
    await loadInterested();
    if (typeof loadCartCount === "function") {
        loadCartCount();
    }
})();

// 2. Main functions
async function loadInterested() {
    const token = localStorage.getItem("token");
    
    try {
        const res = await fetch("https://acity-backend.onrender.com/api/listings/interested", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (res.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.replace("login.html");
            return;
        }

        if (!res.ok) {
            throw new Error("Could not load this information.");
        }

        const items = await res.json();
        currentItems = items;

        const subtotal = items.reduce(
            (sum, item) => sum + (Number(item.price) * item.quantity),
            0
        );

        document.getElementById("summaryItems").textContent = items.length;
        document.getElementById("summarySubtotal").textContent = `₵${subtotal}`;
        document.getElementById("summaryTotal").textContent = `₵${subtotal}`;

        const container = document.getElementById("interestedContainer");

        if (items.length === 0) {
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
                        <span class="cart-price">₵${item.price}</span>
                    </div>
                    <div class="cart-quantity">
                        Quantity: <strong>${item.quantity}</strong>
                    </div>
                    <p class="cart-description">${item.description || ""}</p>
                    <div class="cart-meta">
                        <span class="listing-badge">${item.status}</span>
                        <span class="order-badge">${item.order_status || "Not Ordered"}</span>
                    </div>
                    <div class="quantity-controls">
                        <button onclick="changeQuantity(${item.id}, -1)">
                            <i class="fa-solid fa-minus"></i>
                        </button>
                        <span>${item.quantity}</span>
                        <button onclick="changeQuantity(${item.id}, 1)">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                    <div class="cart-actions">
                        <button class="checkout-btn" onclick="checkoutItem(${item.id})">
                            <i class="fa-solid fa-credit-card"></i> Checkout
                        </button>
                        <button class="message-btn" onclick="messageSeller(
                            ${item.seller_id},
                            '${item.seller_name}',
                            ${item.id},
                            '${(item.title || "").replace(/'/g, "\\'")}',
                            ${item.price},
                            '${item.image_url || ""}',
                            '${item.category}',
                            '${item.status}'
                        )">
                            <i class="fa-solid fa-comments"></i> Message Seller
                        </button>
                        <button class="remove-btn" onclick="removeFromCart(${item.id})">
                            <i class="fa-solid fa-trash"></i> Remove
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(div);
        });
    } catch (err) {
        console.error(err);
        showToast(err.message, "error");
    }
}

async function removeFromCart(listingId) {
    showConfirmModal({
        title: "Remove Item",
        message: "Remove this item from your cart?",
        icon: "fa-cart-shopping",
        confirmText: "Remove",
        confirmClass: "btn-danger",
        onConfirm: async () => {
            const token = localStorage.getItem("token");
            const res = await fetch(
                `https://acity-backend.onrender.com/api/listings/cart/${listingId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await res.json();
            showToast(data.message || data.error);
            loadInterested();
            if (typeof loadCartCount === "function") loadCartCount();
        }
    });
}

function getStatusText(status) {
    if (status === "available") return "Pending (waiting for seller)";
    if (status === "sold") return "Completed";
    if (status === "swapped") return "Trade Completed";
    return "Unknown";
}

function checkoutItem(id) {
    checkoutAllMode = false;
    const item = currentItems.find(product => product.id === id);
    selectedItem = item;

    document.getElementById("checkoutTitle").textContent = item.title;
    document.getElementById("checkoutPrice").innerHTML = `
        <div class="checkout-meta">
            <span>Quantity: <strong>${item.quantity}</strong></span>
            <span>₵${Number(item.price) * item.quantity}</span>
        </div>
    `;
    document.getElementById("checkoutImage").src =
        item.image_url || `images/${item.category}.jpg`;
    document.getElementById("productTotal").textContent = `₵${Number(item.price) * item.quantity}`;
    document.getElementById("grandTotal").textContent = `₵${Number(item.price) * item.quantity}`;
    document.getElementById("checkoutModal").style.display = "flex";
}

function checkoutAll() {
    if (currentItems.length === 0) {
        showToast("Your cart is empty", "error");
        return;
    }
    checkoutAllMode = true;
    selectedItem = null;

    const totalPrice = currentItems.reduce(
        (sum, item) => sum + (Number(item.price) * item.quantity),
        0
    );
    const totalQuantity = currentItems.reduce(
        (sum, item) => sum + Number(item.quantity),
        0
    );
    const titles = currentItems.map(item => item.title).join(", ");

    document.getElementById("checkoutTitle").innerHTML = `
        <div class="checkout-title">
            <h3>${currentItems.length} Items</h3>
            <small>${titles}</small>
        </div>
    `;
    document.getElementById("checkoutPrice").innerHTML = `
        <div class="checkout-meta">
            <span>Total Quantity: <strong>${totalQuantity}</strong></span>
            <span>₵${totalPrice}</span>
        </div>
    `;
    document.getElementById("checkoutImage").src =
        currentItems[0].image_url || `images/${currentItems[0].category}.jpg`;
    document.getElementById("productTotal").textContent = `₵${totalPrice}`;
    document.getElementById("grandTotal").textContent = `₵${totalPrice}`;
    document.getElementById("checkoutModal").style.display = "flex";
}

// 3. Event Listeners
document.addEventListener("change", function(e) {
    if (e.target.name === "deliveryMethod") {
        const container = document.getElementById("deliveryFields");
        if (e.target.value === "room") {
            container.innerHTML = `
                <select id="hostel">
                    <option>Hostel A</option>
                    <option>Hostel B</option>
                </select>
                <input id="roomNumber" placeholder="Room Number">
            `;
        } else {
            container.innerHTML = `
                <input id="meetingLocation" placeholder="Meeting Location">
            `;
        }

        document.querySelectorAll(".delivery-card").forEach(card => {
            card.classList.remove("selected");
            const btn = document.getElementById("placeOrderBtn");
            if (btn) btn.disabled = false;
        });
        e.target.closest(".delivery-card")?.classList.add("selected");
    }
});

function closeCheckout() {
    document.getElementById("checkoutModal").style.display = "none";
}

function messageSeller(userId, userName, listingId, title, price, image, category, status) {
    localStorage.setItem("openConversationWith", userId);
    localStorage.setItem("openConversationName", userName);
    localStorage.setItem(
        "conversationListing",
        JSON.stringify({ id: listingId, title, price, image, category, status })
    );

    window.location.href = "inbox.html";
}

function placeOrder() {
    const deliveryMethod =
        document.querySelector(
            'input[name="deliveryMethod"]:checked'
        )?.value;

    if (!deliveryMethod) {
        showToast(
            "Select a delivery method.",
            "error"
        );
        return;
    }

    let hostel = null;
    let roomNumber = null;
    let meetingLocation = null;

    if (deliveryMethod === "room") {
        hostel =
            document.getElementById(
                "hostel"
            )?.value;

        roomNumber =
            document.getElementById(
                "roomNumber"
            )?.value?.trim();

        if (!hostel || !roomNumber) {
            showToast(
                "Enter your hostel and room number.",
                "error"
            );
            return;
        }
    }

    if (deliveryMethod === "meetup") {
        meetingLocation =
            document.getElementById(
                "meetingLocation"
            )?.value?.trim();

        if (!meetingLocation) {
            showToast(
                "Enter a meeting location.",
                "error"
            );
            return;
        }
    }

    const itemsToOrder =
        checkoutAllMode
            ? currentItems
            : selectedItem
                ? [selectedItem]
                : [];

    if (itemsToOrder.length === 0) {
        showToast(
            "No items selected.",
            "error"
        );
        return;
    }

    const checkoutData = {
        items: itemsToOrder.map(item => ({
            listing_id: item.id,
            seller_id: item.seller_id,
            title: item.title,
            price: Number(item.price),
            quantity: Number(item.quantity),
            image_url: item.image_url || "",
            category: item.category || "Other"
        })),

        delivery_method: deliveryMethod,
        hostel,
        room_number: roomNumber,
        meeting_location: meetingLocation
    };

    localStorage.setItem(
        "pendingCheckout",
        JSON.stringify(checkoutData)
    );

    closeCheckout();

    window.location.href =
        "payment.html";
}

async function changeQuantity(listingId, change) {
    const token = localStorage.getItem("token");
    const res = await fetch(
        `https://acity-backend.onrender.com/api/listings/cart/${listingId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ change })
        }
    );
    const data = await res.json();
    if (!res.ok) {
        showToast(data.message || data.error);
        return;
    }
    loadInterested();
    if (typeof loadCartCount === "function") loadCartCount();
}