const user = JSON.parse(localStorage.getItem("user"));

if (user) {

    document.getElementById("userName").textContent = user.name;
    document.getElementById("userEmail").textContent = user.email;

    const aboutMe = document.getElementById("aboutMe");

    if (aboutMe) {
        aboutMe.value = user.aboutMe || "";
    }

}
function saveProfile() {

    if (!user) return;

    const aboutMe =
        document.getElementById("aboutMe")?.value || "";

    user.aboutMe = aboutMe;

    localStorage.setItem("user", JSON.stringify(user));

    alert("Profile updated!");

}

const ItemsContainer = document.getElementById("myItemsContainer");

async function loadMyItems() {
  console.log("Loading my items...");
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

    console.log(items);
    const count =
document.getElementById("itemsCount");

if(count){
    count.textContent = items.length;
}

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

    

    items
    .slice(0, 6)
    .forEach(item => {
      const div = document.createElement("div");
      div.classList.add("profile-card");

      console.log(item.image_url);

     div.className = "my-item-card";

div.innerHTML = `

<div class="listing-card">

    <img
        src="${item.image_url || `images/${item.category}.jpg`}"
        class="listing-image"
        onerror="this.src='images/Other.jpg'"
    >

    <div class="listing-content">

        <h3>${item.title}</h3>

        <div class="listing-price">
            GH₵${item.price}
        </div>

        <span class="listing-status">
            ${item.status}
        </span>

        <div class="listing-actions">

            <button onclick="editItem(${item.id})">
                <i class="fa-solid fa-pen"></i>
            </button>

            <button onclick="markSold(${item.id})">
                <i class="fa-solid fa-check"></i>
            </button>

            <button onclick="deleteItem(${item.id})">
                <i class="fa-solid fa-trash"></i>
            </button>

        </div>

    </div>

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
function formatDate(date) {

    return new Date(date).toLocaleString("en-GB",{

        day:"numeric",
        month:"short",
        hour:"2-digit",
        minute:"2-digit"

    });

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

        <div>

            <h3>${order.title}</h3>

            <span class="order-price">
                GH₵${order.price}
            </span>

        </div>

        <span class="order-status ${order.status.toLowerCase()}">
            ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>

    </div>

    <div class="order-body">

        <div class="order-info">
            <i class="fa-solid fa-user"></i>
            <span><strong>Buyer:</strong> ${order.buyer_name}</span>
        </div>

        <div class="order-info">
            <i class="fa-solid fa-truck"></i>
            <span><strong>Delivery:</strong> ${order.delivery_method}</span>
        </div>

        ${
            order.delivery_method === "room"
            ? `
            <div class="order-info">
                <i class="fa-solid fa-building"></i>
                <span>${order.hostel}</span>
            </div>

            <div class="order-info">
                <i class="fa-solid fa-door-open"></i>
                <span>${order.room_number}</span>
            </div>
            `
            : `
            <div class="order-info">
                <i class="fa-solid fa-location-dot"></i>
                <span>${order.meeting_point}</span>
            </div>
            `
        }

        <div class="order-info">
            <i class="fa-solid fa-clock"></i>
            <span>${formatDate(order.created_at)}</span>
        </div>

    </div>

    <div class="order-actions">

        ${
            order.status === "pending"
            ? `
            <button class="accept-btn">Accept</button>
            <button class="reject-btn">Reject</button>
            `
            : ""
        }

        <button
            class="message-btn"
            onclick="messageSeller(${order.buyer_id})"
        >
            <i class="fa-solid fa-comments"></i>
            Message
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
        "openConversationWith",
        userId
    );

    window.location.href =
        "inbox.html";

}