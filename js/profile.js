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
    const res = await fetch("https://acity-backend.onrender.com/api/listings/my", {
      headers: {
        "Authorization": token
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
    await fetch(`https://acity-backend.onrender.com/api/listings/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": token
      }
    });

    alert("Item deleted!");
    loadMyItems();
  }
}

async function editItem(id) {
  const token = localStorage.getItem("token");

  const newTitle = prompt("Enter new title:");
  const newDescription = prompt("Enter new description:");
  const newCategory = prompt("Enter category (Items/Skills):");
  const newStatus = prompt("Enter status (available/sold/swapped):");

  if (!newTitle || !newDescription || !newCategory || !newStatus) return;

  const res = await fetch(`https://acity-backend.onrender.com/api/listings/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token
    },
    body: JSON.stringify({
      title: newTitle,
      description: newDescription,
      category: newCategory,
      status: newStatus
    })
  });

  const data = await res.json();

  if (res.ok) {
    alert("Item updated!");
    loadMyItems();
  } else {
    alert(data.message || data.error);
  }
}