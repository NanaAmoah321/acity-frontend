const container = document.getElementById("interestedContainer");

async function loadInterested() {
  const token = localStorage.getItem("token");

  const res = await fetch("https://acity-backend.onrender.com/api/listings/interested", {
    headers: {
      "Authorization": token
    }
  });

  const items = await res.json();

  container.innerHTML = "";

  if (items.length === 0) {
    container.innerHTML = "<p>No interested items yet.</p>";
    return;
  }

  items.forEach(item => {
    const div = document.createElement("div");
    div.classList.add("card");

    div.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.description}</p>
      <p><strong>Category:</strong> ${item.category}</p>
      <p><strong>Status:</strong> ${getStatusText(item.status)}</p>
      <button onclick="removeFromCart('${item.id}')">Remove from Cart</button>
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
        "Authorization": token
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

loadInterested();