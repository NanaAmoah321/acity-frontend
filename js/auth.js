("Auth script loaded");
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
                showToast("Login successful");
                window.location.href =
                "marketplace.html";
            }else{
                showToast(data.message || data.error);
                loginButton.disabled = false;
                loginButton.innerHTML = `
                    <span>Sign In</span>
                `;
            }
        }catch(err){
            showToast("Something went wrong.");
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
  console.log("Register form submitted");
  
  const name = document.getElementById("fullName").value;
  const email = document.getElementById("email").value;
    
  const password = document.getElementById("password").value;
  const level = document.getElementById("level").value;
  const googleCredential = document.getElementById("googleCredential").value;
  const endpoint = googleCredential
    ? "https://acity-backend.onrender.com/api/auth/google-register"
    : "https://acity-backend.onrender.com/api/auth/register";

    const body = googleCredential
        ? {
            credential: googleCredential,
            level,
            password,
            receive_marketplace_updates: document.getElementById("receiveMarketplaceUpdates")?.checked || false
        }
        : {
            name,
            email,
            password,
            level,
            receive_marketplace_updates: document.getElementById("receiveMarketplaceUpdates")?.checked || false
        };

    
    console.log(endpoint, body);

    const res = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
  const data = await res.json();
  showToast(data.message || data.error);
  if (res.ok) {
        if (googleCredential) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            showToast(`🎉 Welcome ${data.user.name}!`);

            setTimeout(() => {
                window.location.href = "marketplace.html";
            }, 700);
        } else {
            showToast(data.message);
            window.location.href = "login.html";
        }
    }
})
}





const userData = localStorage.getItem("user");
if (userData) {
  const user = JSON.parse(userData);
  const adminLink = document.getElementById("adminLink");
  if (adminLink && user.role === "admin") {
    adminLink.style.display = "inline";
  }
}
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
showToast(data.message);
}
);
}
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
                showToast(
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
            showToast(data.message);
            if(res.ok){
                window.location.href =
                "login.html";
            }
        }
    );
}

// Google Sign-In
const googleBtn = document.getElementById("googleSignInBtn");
const googleBtnHTML = googleBtn?.innerHTML;
if (document.getElementById("googleSignInBtn")) {

    google.accounts.id.initialize({
        client_id: "967147683947-j1d0ujljjjf4jufv1gfkdk2o5bbg7gog.apps.googleusercontent.com",
        callback: handleGoogleLogin
    });

    // Attach click handler to Google sign-in button
    googleBtn.addEventListener("click", () => {

            googleBtn.disabled = true;

            googleBtn.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Connecting...</span>
            `;

            google.accounts.id.prompt();

        });

}

// Google Register

const googleRegisterBtn = document.getElementById("googleRegisterBtn");

if (googleRegisterBtn) {
    google.accounts.id.initialize({
        client_id: "967147683947-j1d0ujljjjf4jufv1gfkdk2o5bbg7gog.apps.googleusercontent.com",
        callback: handleGoogleRegister
    });

    googleRegisterBtn.addEventListener("click", () => {
        googleRegisterBtn.disabled = true;
        googleRegisterBtn.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            <span>Connecting...</span>
        `;

        google.accounts.id.prompt((notification) => {
            // Reset button if the prompt is closed or fails to show
            if (notification.isDismissedMoment() || notification.isNotDisplayed()) {
                googleRegisterBtn.disabled = false;
                googleRegisterBtn.innerHTML = `
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google">
                    <span>Continue with Google</span>
                `;
            }
        });
    });
}

async function handleGoogleLogin(response) {
    try {
        const res = await fetch(
            "https://acity-backend.onrender.com/api/auth/google",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    credential: response.credential
                })
            }
        );

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            showToast(`Welcome , ${data.user.name}!`);
            setTimeout(() => {
                window.location.href = "marketplace.html";
            }, 700);
        } else {
            googleBtn.disabled = false;
            googleBtn.innerHTML = googleBtnHTML;
            showToast(data.message || "Google sign-in failed.");
            
        }
    } catch (err) {
        googleBtn.disabled = false;
        googleBtn.innerHTML = googleBtnHTML;
        console.error("Google Login Error:", err);
        showToast("Google sign-in failed.");
    }
}

async function handleGoogleRegister(response) {
    try {
        const res = await fetch(
            "https://acity-backend.onrender.com/api/auth/google-preview",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    credential: response.credential
                })
            }
        );

        const data = await res.json();

        if (!res.ok) {
            showToast(data.message || "Google sign-up failed.", "error");
            return;
        }

        

        

        // Hidden credential input
        const googleCredentialInput = document.getElementById("googleCredential");
        if (googleCredentialInput) googleCredentialInput.value = response.credential;

        // Form input fields
        const fullNameInput = document.getElementById("fullName");
        if (fullNameInput) fullNameInput.value = data.name || "";

        const emailInput = document.getElementById("email");
        if (emailInput) emailInput.value = data.email || "";

        // Preview UI elements
        const previewName = document.getElementById("googlePreviewName");
        if (previewName) previewName.textContent = data.name || "";

        const previewEmail = document.getElementById("googlePreviewEmail");
        if (previewEmail) previewEmail.textContent = data.email || "";

        const previewImage = document.getElementById("googlePreviewImage");
        if (previewImage) {
            previewImage.src = data.picture || "images/default-avatar-image.jpg";
            previewImage.onerror = () => {
                previewImage.src = "images/default-avatar-image.jpg";
            };
        }



        // Reveal the preview container
        document.getElementById("googleLoading")?.classList.remove("hidden");

        showToast("Almost done! Choose your level.");

    } catch (err) {
        googleRegisterBtn.disabled = false;
        googleRegisterBtn.innerHTML = `
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google">
            <span>Continue with Google</span>
        `;
        console.error("Google Register Error:", err);
        showToast("Google sign-up failed.", "error");
    }
}