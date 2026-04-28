console.log("Auth script loaded");


const loginForm = document.getElementById('loginForm');

if (loginForm) {
  loginForm.addEventListener("submit", async function(e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("https://acity-backend.onrender.com/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  console.log("LOGIN RESPONSE:", data);

  if (res.ok) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    alert("Login successful");
    window.location.href = "index.html";
  } else {
    alert(data.message || data.error);
  }
 });
}



const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async function(e) {
  e.preventDefault();

  const name = document.getElementById("fullName").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("https://acity-backend.onrender.com/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, email, password })
  });

  const data = await res.json();

  alert(data.message || data.error);

  if (res.ok) {
    window.location.href = "login.html";
  }
});
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

const userData = localStorage.getItem("user");

if (userData) {
  const user = JSON.parse(userData);

  const adminLink = document.getElementById("adminLink");

  if (adminLink && user.role === "admin") {
    adminLink.style.display = "inline";
  }
}