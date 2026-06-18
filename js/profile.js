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

const ItemsContainer = document.getElementById("ItemsContainer");

async function loadMyItems() {
  const token = localStorage.getItem("token");

  
  if (!token) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/listings/my", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const items = await res.json();

    console.log("API RESPONSE:", items);

    ItemsContainer.innerHTML = "";

    if (!Array.isArray(items)) {
      ItemsContainer.innerHTML = `<p>${items.message || "Error loading items"}</p>`;
      return;
    }

    if (items.length === 0) {
      ItemsContainer.innerHTML = "<p>No items posted yet.</p>";
      return;
    }

    items.forEach(item => {
      const div = document.createElement("div");
      div.classList.add("card");

      div.innerHTML = `
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <p><strong>Category:</strong> ${item.category}</p>
        <p><strong>Status:</strong> ${item.status}</p>
        <button onclick="deleteItem(${item.id})">Delete</button>
        <button onclick="editItem(${item.id})">Edit</button>
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
    await fetch(`http://localhost:5000/api/listings/${id}`, {
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
    document.querySelectorAll(".card")
  ).find(card =>
    card.innerHTML.includes(
      `editItem(${id})`
    )
  );

  const currentItem =
  (
    await fetch(
      `http://localhost:5000/api/listings/${id}`
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
    `http://localhost:5000/api/listings/${id}`,
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
        "http://localhost:5000/api/listings/seller-orders",
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

    orders.forEach(order => {

        container.innerHTML += `

        <div class="card">

            <h3>
                ${order.title}
            </h3>

            <p>
                Buyer:
                ${order.buyer_name}
            </p>

            <p>
                ₵${order.price}
            </p>

            <p class="order-status">

              Status:
              <strong>
                   ${order.status}
              </strong>

            </p>

            <button
                onclick="acceptOrder(${order.id})"
            >
                Accept
            </button>

            <button
                onclick="rejectOrder(${order.id})"
            >
                Reject
            </button>

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
        `http://localhost:5000/api/listings/orders/${orderId}`,
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
        `http://localhost:5000/api/listings/orders/${orderId}`,
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
