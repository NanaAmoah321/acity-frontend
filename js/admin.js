const userData = localStorage.getItem("user");
const token = localStorage.getItem("token");

if (!userData) {
  alert("Please login first");
  window.location.href = "login.html";
}

const user = JSON.parse(userData);

console.log("USER:", user); 

if (user.role !== "admin") {
  alert("Access denied");
  window.location.href = "index.html";
}

fetch("https://acity-backend.onrender.com/api/listings")
  .then(res => res.json())
  .then(items => {

    document.getElementById("stats").innerHTML = `
      <p>Total Listings: ${items.length}</p>
    `;

    const container = document.getElementById("allListings");

    items.forEach(item => {
      const div = document.createElement("div");
      div.classList.add("card");

      div.innerHTML = `
        <h3>${item.title}</h3>
        <p>${item.description}</p>

        <button class="Add-button" onclick="deleteItem(${item.id})">Delete</button>
        <button class="Add-button" onclick="flagItem(${item.id})">Flag</button>
     `;

     container.appendChild(div);
    });
  });

async function deleteItem(id) {
  const token = localStorage.getItem("token");

  const res = await fetch(`https://acity-backend.onrender.com/api/listings/admin/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": "Bearer " + token
    }
  });

  const data = await res.json();
  console.log("DELETE RESPONSE:", data);

  if (res.ok) {
    alert("Deleted successfully");
    location.reload();
  } else {
    alert(data.message || data.error);
  }
}

async function flagItem(id) {
  const token = localStorage.getItem("token");

  const res = await fetch(`https://acity-backend.onrender.com/api/listings/flag/${id}`, {
    method: "PUT",
    headers: {
      "Authorization": "Bearer " + token
    }
  });

  const data = await res.json();
  console.log("FLAG RESPONSE:", data);

  if (res.ok) {
    alert("Flagged successfully");
  } else {
    alert(data.message || data.error);
  }
}