const navbarToken =
localStorage.getItem("token");

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