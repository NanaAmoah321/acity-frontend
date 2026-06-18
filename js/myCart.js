const container = document.getElementById("interestedContainer");

async function loadInterested() {
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:5000/api/listings/interested", {
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
    <img
        src="${item.image_url || `images/${item.category}.jpg`}"
        class="listing-image"
        onerror="this.src='images/Other.jpg'"
    >

    <h3>${item.title}</h3>

    <p class="product-price">
        ₵${item.price}
    </p>

    <p class="product-status">
        ${item.status}
    </p>

    <p>
        ${item.description}
    </p>

    

    <button
        onclick="removeFromCart(${item.id})"
    >
        Remove From Cart
    </button>
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