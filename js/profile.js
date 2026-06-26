const user = JSON.parse(localStorage.getItem("user"));

if (user) {
  
  document.getElementById("userName").textContent = user.name;
  document.getElementById("userEmail").textContent = user.email;
  


  // Load saved skills if they exist
  document.getElementById("skillsOffered").value = user.skillsOffered || "";
  document.getElementById("skillsNeeded").value = user.skillsNeeded || "";

}

function saveProfile() {
  if (!user) return;

  const skillsOffered = document.getElementById("skillsOffered").value;
  const skillsNeeded = document.getElementById("skillsNeeded").value;

  user.skillsOffered = skillsOffered;
  user.skillsNeeded = skillsNeeded;

  localStorage.setItem("user", JSON.stringify(user));

  alert("Profile updated!");
}

const ItemsContainer = document.getElementById("myItemsContainer");

async function loadMyItems() {
  const token = localStorage.getItem("token");

  
  if (!token) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  try {

    ItemsContainer.innerHTML = "";

    for(let i=0;i<3;i++){

    ItemsContainer.innerHTML += `
        <div class="profile-skeleton skeleton-card">
        </div>
    `;

    }
    const res = await fetch("https://acity-backend.onrender.com/api/listings/my", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const items = await res.json();
    document.getElementById("itemsCount").textContent =
    items.length;

    console.log("API RESPONSE:", items);

    ItemsContainer.innerHTML = "";

    if (items.length === 0) {

  ItemsContainer.innerHTML = `
    <div class="empty-state">

      <i class="fa-solid fa-box-open"></i>

      <h3>No Listings Yet</h3>

      <p>
        Start selling by posting your first item.
      </p>

    </div>
  `;

  return;
  }

    if (items.length === 0) {
      ItemsContainer.innerHTML = "<p>No items posted yet.</p>";
      return;
    }

    items.forEach(item => {
      const div = document.createElement("div");
      div.classList.add("profile-card");

      console.log(item.image_url);

     div.innerHTML = `
      <img
        src="${item.image_url || `images/${item.category}.jpg`}"
        class="my-item-image"
        onerror="this.src='images/Other.jpg'"
      >

      <h3>${item.title}</h3>

      <p class="item-price">
        GH₵ ${item.price}
      </p>

      <p><strong>Category:</strong> ${item.category}</p>

      <p><strong>Status:</strong> ${item.status}</p>

      <div class="actions">
        <button onclick="deleteItem(${item.id})">
            Delete
        </button>

        <button onclick="editItem(${item.id})">
            Edit
        </button>
      </div>
     `;

      ItemsContainer.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    ItemsContainer.innerHTML = "<p>Server error</p>";
  }
}

loadMyItems();
  
async function deleteItem(id) {
  const token = localStorage.getItem("token");

  if (confirm("Delete this item?")) {
    await fetch(`https://acity-backend.onrender.com/api/listings/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    alert("Item deleted!");
    loadMyItems();
  }
}

async function editItem(id) {

  const token = localStorage.getItem("token");

  const itemCard =
  Array.from(
    document.querySelectorAll(".profile-card")
  ).find(card =>
    card.innerHTML.includes(
      `editItem(${id})`
    )
  );

  const currentItem =
  (
    await fetch(
      `https://acity-backend.onrender.com/api/listings/${id}`
    )
  ).json();

  const item =
  await currentItem;

  const newTitle =
  prompt(
    "Enter new title:",
    item.title
  );

  const newDescription =
  prompt(
    "Enter new description:",
    item.description
  );

  const newCategory =
  prompt(
    "Enter category:",
    item.category
  );

  const newPrice =
  prompt(
    "Enter price:",
    item.price
  );

  const newImageUrl =
  prompt(
    "Enter image URL:",
    item.image_url
  );

  const newStatus =
  prompt(
    "Enter status:",
    item.status
  );

  const res =
  await fetch(
    `https://acity-backend.onrender.com/api/listings/${id}`,
    {
      method: "PUT",

      headers: {
        "Content-Type":
        "application/json",

        "Authorization":
        `Bearer ${token}`
      },

      body: JSON.stringify({

        title:
        newTitle ||
        item.title,

        description:
        newDescription ||
        item.description,

        category:
        newCategory ||
        item.category,

        price:
        newPrice ||
        item.price,

        image_url:
        newImageUrl ||
        item.image_url,

        status:
        newStatus ||
        item.status

      })
    }
  );

  const data =
  await res.json();

  if (res.ok) {

    alert(
      "Item updated!"
    );

    loadMyItems();

  } else {

    alert(
      data.message ||
      data.error
    );

  }

}

async function loadSellerOrders() {

    const token =
    localStorage.getItem(
        "token"
    );

    const res =
    await fetch(
        "https://acity-backend.onrender.com/api/listings/seller-orders",
        {
            headers: {
                Authorization:
                `Bearer ${token}`
            }
        }
    );

    const orders =
    await res.json();

    console.log("ORDERS RESPONSE:", orders);

    const container =
    document.getElementById(
        "sellerOrders"
    );

    if (!container)
        return;

    container.innerHTML = "";

    if (!Array.isArray(orders)) {

        console.error("Not an array:", orders);

        return;

    }

    if (orders.length === 0) {

    container.innerHTML = `
        <div class="empty-state">
            <i class="fa-solid fa-store"></i>

            <h3>Your Store Is Quiet</h3>

            <p>
                Share your listings to start receiving orders.
            </p>
        </div>
    `;

    return;
    }

    orders.forEach(order => {

    container.innerHTML += `

    <div class="order-card">

        <div class="order-header">

            <h3>${order.title}</h3>

            <span class="order-price">
                GH₵ ${order.price}
            </span>

        </div>

        <div class="order-details">

            <p>
                <i class="fa-solid fa-user"></i>
                <strong>Buyer:</strong>
                ${order.buyer_name}
            </p>

            <p>
                <i class="fa-solid fa-truck"></i>
                <strong>Delivery:</strong>
                ${order.delivery_method === "room"
                    ? "Room Delivery"
                    : "Meet Up"}
            </p>

            ${
                order.delivery_method === "room"
                ? `
                <p>
                    <i class="fa-solid fa-building"></i>
                    <strong>Hostel:</strong>
                    ${order.hostel}
                </p>

                <p>
                    <i class="fa-solid fa-door-open"></i>
                    <strong>Room:</strong>
                    ${order.room_number}
                </p>
                `
                : `
                <p>
                    <i class="fa-solid fa-location-dot"></i>
                    <strong>Meeting Point:</strong>
                    ${order.meeting_location}
                </p>
                `
            }

            <p>
                <i class="fa-solid fa-clock"></i>
                <strong>Ordered:</strong>
                ${new Date(order.created_at).toLocaleString([],{

                  day:"numeric",

                  month:"short",

                  hour:"2-digit",

                  minute:"2-digit"

                })}
            </p>

        </div>

        <div class="order-status ${order.status}">
            ${order.status.toUpperCase()}
        </div>

        <div class="order-actions">

            <button
                class="accept-btn"
                onclick="acceptOrder(${order.id})"
            >
                Accept
            </button>

            <button
                class="reject-btn"
                onclick="rejectOrder(${order.id})"
            >
                Reject
            </button>

            <button
                class="message-btn"
                onclick="messageSeller(${order.buyer_id})"
            >
                Message Buyer
            </button>

        </div>

    </div>

    `;

    });

}
loadSellerOrders();
async function acceptOrder(orderId) {

    const token =
    localStorage.getItem(
        "token"
    );

    const res =
    await fetch(
        `https://acity-backend.onrender.com/api/listings/orders/${orderId}`,
        {
            method: "PUT",

            headers: {
                "Content-Type":
                "application/json",

                Authorization:
                `Bearer ${token}`
            },

            body: JSON.stringify({
                status:
                "accepted"
            })

        }
    );

    const data =
    await res.json();

    alert(
        data.message
    );

    loadSellerOrders();

}

async function rejectOrder(orderId) {

    const token =
    localStorage.getItem(
        "token"
    );

    const res =
    await fetch(
        `https://acity-backend.onrender.com/api/listings/orders/${orderId}`,
        {
            method: "PUT",

            headers: {
                "Content-Type":
                "application/json",

                Authorization:
                `Bearer ${token}`
            },

            body: JSON.stringify({
                status:
                "rejected"
            })

        }
    );

    const data =
    await res.json();

    alert(
        data.message
    );

    loadSellerOrders();

}
function messageSeller(userId){

    localStorage.setItem(
        "receiver_id",
        userId
    );

    window.location.href =
        "conversation.html";

}