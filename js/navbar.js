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

async function
loadUnreadCount() {

    if (!navbarToken) return;

    try {

        const res =
        await fetch(
            "http://localhost:5000/api/messages/unread-count",
            {
                headers: {
                    Authorization:
                    `Bearer ${navbarToken}`
                }
            }
        );

        const data =
        await res.json();

        const badge =
        document.getElementById(
            "messageCount"
        );

        if (
            Number(data.count) > 0
        ) {

            badge.innerText =
            `(${data.count})`;

        }

    } catch (err) {

        console.error(err);

    }

}

loadUnreadCount();

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

async function updateCartCount() {

    const token =
    localStorage.getItem("token");

    if (!token) return;

    try {

        const res =
        await fetch(
            "http://localhost:5000/api/listings/interested",
            {
                headers: {
                    Authorization:
                    `Bearer ${token}`
                }
            }
        );

        const items =
        await res.json();

        const cartCount =
        document.getElementById(
            "cartCount"
        );

        if (cartCount) {

            cartCount.textContent =
            items.length;

            cartCount.style.display =
            items.length > 0
            ? "flex"
            : "none";

        }

    } catch (err) {

        console.error(
            "Cart count error:",
            err
        );

    }

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

updateCartCount(); 


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