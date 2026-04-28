console.log("JS is connected");
const ItemsContainer = document.getElementById('ItemsContainer');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');

async function loadItems() {
  const res = await fetch("https://acity-backend.onrender.com/api/listings");
  const Items = await res.json();
    
    const searchText = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    
    ItemsContainer.innerHTML = '';
    
    const filteredItems = Items.filter(Item => {
        const matchesSearch = 
        Item.title.toLowerCase().includes(searchText) || 
        Item.description.toLowerCase().includes(searchText);

        const matchesCategory =
        selectedCategory === 'All' || Item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    filteredItems.forEach(Item => {
        const card = document.createElement('div');
        card.classList.add('card');

        card.innerHTML = `
            <h3>${Item.title}</h3>
            <p>${Item.description}</p>
            <p><strong>Category:</strong> ${Item.category}</p>
            <p><strong>Status:</strong> ${Item.status}</p>
            <button onclick="addInterest(${Item.id})">Interested</button>
        `;

        ItemsContainer.appendChild(card);
    });
}

if (ItemsContainer) {
    loadItems();

    searchInput.addEventListener('input', loadItems);
    categoryFilter.addEventListener('change', loadItems);
}

const ItemForm = document.getElementById("ItemForm");

if (ItemForm) {
  ItemForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const category = document.getElementById("category").value;
    const status = document.getElementById("status").value;

    const res = await fetch("https://acity-backend.onrender.com/api/listings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      },
      body: JSON.stringify({ title, description, category, status })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Item created successfully!");
      window.location.href = "index.html";
    } else {
      alert(data.message || data.error);
    }
  });
}

async function addInterest(listingId) {
  const token = localStorage.getItem("token");
  console.log("TOKEN:", token);


  if (!token) {
    alert("Please login first");
    return;
  }

  try {
    const res = await fetch("https://acity-backend.onrender.com/api/listings/interest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      },
      body: JSON.stringify({ listing_id: listingId })
    });

    const data = await res.json();
    console.log("Response:", data);

    if (res.ok) {
      alert("Added to cart!");
    } else {
      alert(data.message);
    }

  } catch (err) {
    console.error(err);
  }
}