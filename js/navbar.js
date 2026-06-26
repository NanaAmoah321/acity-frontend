const navbarToken =
localStorage.getItem("token");

var user =
JSON.parse(
    localStorage.getItem("user")
);

const adminLink =
document.getElementById(
    "adminLink"
);

if (
    user &&
    user.role === "admin" &&
    adminLink
) {

    adminLink.style.display =
    "flex";

}

async function updateMessageCount(){

    const badge =
    document.getElementById("messageCount");

    if(!badge) return;

    const token =
    localStorage.getItem("token");

    if(!token){

        badge.style.display = "none";

        return;

    }

    try{

        const res = await fetch(

            "http://localhost:5000/api/messages/unread-count",

            {

                headers:{
                    Authorization:`Bearer ${token}`
                }

            }

        );

        const data =
        await res.json();

        if(Number(data.count) > 0){

            badge.textContent =
            data.count;

            badge.style.display =
            "flex";

        }else{

            badge.textContent =
            "";

            badge.style.display =
            "none";

        }

    }catch{

        badge.style.display =
        "none";

    }

}

const menuToggle=
document.getElementById("menu-toggle");

const navLinks =
document.getElementById("navLinks");

if (menuToggle) {

    menuToggle.addEventListener(
        "click",
        () => {

            navLinks.classList.toggle(
                "active"
            );

        }
    );

}






const currentPage =
window.location.pathname.split("/").pop();

document
.querySelectorAll(".nav-item")
.forEach(link => {

    const href =
    link.getAttribute("href");

    if(href === currentPage){

        link.classList.add("active");

    }

});




async function updateNotificationCount(){

    const token =
    localStorage.getItem("token");

    if(!token) return;

    const res =
    await fetch(

        "http://localhost:5000/api/notifications/unread-count",

        {

            headers:{
                Authorization:
                `Bearer ${token}`
            }

        }

    );

    const data =
    await res.json();

    const badge =
    document.getElementById(
        "notificationCount"
    );

    if(!badge) return;

    badge.textContent =
    data.count;

    badge.style.display =
    data.count>0
    ? "flex"
    : "none";

}

updateNotificationCount();

async function loadCartCount() {

    const badge =
    document.getElementById("cartCount");

    if(!badge){

        return;

    }

    const token =
    localStorage.getItem("token");

    if(!token){

        badge.style.display = "none";
        return;

    }

    try{

        const res = await fetch(
            "http://localhost:5000/api/listings/interested",
            {
                headers:{
                    Authorization:`Bearer ${token}`
                }
            }
        );

        if(!res.ok){

            badge.style.display = "none";
            return;

        }

        const cart =
        await res.json();

        if(cart.length > 0){

            badge.innerHTML = cart.length;

            badge.style.display = "flex";

        }else{

            badge.innerHTML = "";

            badge.style.display = "none";

        }

    }catch{

        badge.style.display = "none";

    }

}

document.addEventListener(

    "DOMContentLoaded",

    loadCartCount

);

window.loadCartCount = loadCartCount;
updateMessageCount();
window.updateMessageCount =
updateMessageCount;