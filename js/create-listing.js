const ItemForm = document.getElementById("ItemForm");

if (ItemForm) {
  ItemForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const category = document.getElementById("category").value;
    const status = document.getElementById("status").value;
    const price = document.getElementById("price").value;
    const image_url = document.getElementById("image_url").value;

    console.log({
      title,
      description,
      category,
      status,
      price,
      image_url
    });

    const res = await fetch("http://localhost:5000/api/listings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ title, description, category, status, price, image_url })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Item created successfully!");
      window.location.href = "marketplace.html";
    } else {
      alert(data.message || data.error);
    }
  });
}