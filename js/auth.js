console.log("Auth script loaded");


const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function(e){

        e.preventDefault();

        const email =
        document.getElementById("email").value;

        const password =
        document.getElementById("password").value;

        const loginButton =
        document.getElementById("loginButton");

        loginButton.disabled = true;

        loginButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Signing In...
        `;

        try{

            const res = await fetch(
                "https://acity-backend.onrender.com/api/auth/login",
                {
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json"
                    },
                    body:JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await res.json();

            if(res.ok){

                localStorage.setItem(
                    "token",
                    data.token
                );

                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );

                alert("Login successful");

                window.location.href =
                "marketplace.html";

            }else{

                alert(data.message || data.error);

                loginButton.disabled = false;

                loginButton.innerHTML = `
                    <span>Sign In</span>
                `;

            }

        }catch(err){

            alert("Something went wrong.");

            loginButton.disabled = false;

            loginButton.innerHTML = `
                <span>Sign In</span>
            `;

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

// ==========================
// PASSWORD TOGGLE
// ==========================

document
.querySelectorAll(".toggle-password")
.forEach(button => {

    button.addEventListener("click", () => {

        const input =
        button.parentElement.querySelector(
            "input"
        );

        const icon =
        button.querySelector("i");

        if(input.type === "password"){

            input.type = "text";

            icon.className =
            "fa-solid fa-eye-slash";

        }else{

            input.type = "password";

            icon.className =
            "fa-solid fa-eye";

        }

    });

});

// ===========================
// FORGOT PASSWORD
// ===========================

const forgotPasswordForm =
document.getElementById(
"forgotPasswordForm"
);

if(forgotPasswordForm){

forgotPasswordForm.addEventListener(

"submit",

async(e)=>{

e.preventDefault();

const email =
document.getElementById("email").value;

const res =
await fetch(

"https://acity-backend.onrender.com/api/auth/forgot-password",

{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

email

})

}

);

const data =
await res.json();

alert(data.message);

}

);

}

// ===========================
// RESET PASSWORD
// ===========================

const resetPasswordForm =
document.getElementById(
    "resetPasswordForm"
);

if(resetPasswordForm){

    resetPasswordForm.addEventListener(

        "submit",

        async(e)=>{

            e.preventDefault();

            const password =
            document.getElementById(
                "password"
            ).value;

            const confirmPassword =
            document.getElementById(
                "confirmPassword"
            ).value;

            if(password !== confirmPassword){

                alert(
                    "Passwords do not match."
                );

                return;

            }

            const token =
            new URLSearchParams(
                window.location.search
            ).get("token");

            const res =
            await fetch(

                `https://acity-backend.onrender.com/api/auth/reset-password/${token}`,

                {

                    method:"POST",

                    headers:{
                        "Content-Type":"application/json"
                    },

                    body:JSON.stringify({
                        password
                    })

                }

            );

            const data =
            await res.json();

            alert(data.message);

            if(res.ok){

                window.location.href =
                "login.html";

            }

        }

    );

}