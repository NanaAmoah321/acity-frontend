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
const mobileUser =
document.getElementById("mobileUserName");
if(user && mobileUser){
    mobileUser.textContent =
    user.name;
}
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
            "https://acity-backend.onrender.com/api/messages/unread-count",
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
const menuToggle =
document.getElementById("menu-toggle");
const mobileMenu =
document.getElementById("mobileMenu");
const mobileOverlay =
document.getElementById("mobileOverlay");
const closeMenu =
document.getElementById("closeMenu");
function closeDrawer(){
    mobileMenu.classList.remove("active");
    mobileOverlay.classList.remove("active");
}
if(menuToggle){
    menuToggle.onclick = ()=>{
        mobileMenu.classList.add("active");
        mobileOverlay.classList.add("active");
    };
}
if(closeMenu){
    closeMenu.onclick = closeDrawer;
}
if(mobileOverlay){
    mobileOverlay.onclick = closeDrawer;
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
        "https://acity-backend.onrender.com/api/notifications/unread-count",
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
            "https://acity-backend.onrender.com/api/listings/interested",
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
const profileToggle =
document.getElementById("profileToggle");
const profileMenu =
document.querySelector(".profile-menu");
if(profileToggle){
    profileToggle.onclick = ()=>{
        profileMenu.classList.toggle("open");
    };
    window.addEventListener("click",(e)=>{
        if(!profileMenu.contains(e.target)){
            profileMenu.classList.remove("open");
        }
    });
}
const themeSelect =
document.getElementById("themeSelect");
const themeIcon =
document.getElementById("themeIcon");
const appearanceBtn =
document.getElementById("appearanceBtn");
const appearanceMenu =
document.getElementById("appearanceMenu");
function applyTheme(theme){

    document.body.classList.remove("dark");

    if(theme === "dark"){

        document.body.classList.add("dark");

    }else if(theme === "system"){

        if(
            window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches
        ){

            document.body.classList.add("dark");

        }

    }

    updateThemeIcon(theme);

    localStorage.setItem("theme", theme);

}
function updateThemeIcon(theme){
    if(!themeIcon) return;
    switch(theme){
        case "light":
            themeIcon.className =
            "fa-solid fa-sun";
            break;
        case "dark":
            themeIcon.className =
            "fa-solid fa-moon";
            break;
        default:
            themeIcon.className =
            "fa-solid fa-circle-half-stroke";
    }
}
function saveTheme(theme){
    localStorage.setItem(
        "theme",
        theme
    );
    applyTheme(theme);
    document
    .querySelectorAll(".theme-option")
    .forEach(option=>{
        option.classList.remove("active");
    });
    document
    .querySelector(
        `.theme-option[data-theme="${theme}"]`
    )
    ?.classList.add("active");
}
const savedTheme =
localStorage.getItem("theme")
||
"light";
saveTheme(savedTheme);
document
.querySelectorAll(".theme-option")
.forEach(option=>{
    option.addEventListener(
        "click",
        ()=>{
            saveTheme(
                option.dataset.theme
            );
            appearanceMenu.classList.remove("open");
        }
    );
});
window.matchMedia(
    "(prefers-color-scheme: dark)"
).addEventListener(
    "change",
    ()=>{
        if(
            localStorage.getItem("theme")
            ===
            "system"
        ){
            applyTheme("system");
        }
    }
);
appearanceBtn?.addEventListener(
    "click",
    ()=>{
        appearanceMenu.classList.toggle("open");
    }
);
const themeToggle =
document.getElementById("themeToggle");
if(themeToggle){
    themeToggle.addEventListener("click",()=>{
        const current =
            localStorage.getItem("theme") || "light";
        const themes = ["system","light","dark"];
        const next =
            themes[(themes.indexOf(current)+1)%themes.length];
        saveTheme(next);
    });
}
const navbarSearch =
document.getElementById("navbarSearch");
const params =
new URLSearchParams(window.location.search);
if(navbarSearch){
    navbarSearch.value =
    params.get("search") || "";
}
if(navbarSearch){
    navbarSearch.addEventListener("keydown",e=>{
        if(e.key !== "Enter") return;
        const query =
        navbarSearch.value.trim();
        if(!query) return;
        window.location.href =
        `marketplace.html?search=${encodeURIComponent(query)}`;
    });
}
navbarSearch?.addEventListener("input", (e) => {
    const query = e.target.value.trim();
    if (window.location.pathname.includes("marketplace.html")) {
        const url = new URL(window.location);
        if(query){
            url.searchParams.set("search", query);
        }else{
            url.searchParams.delete("search");
        }
        history.replaceState({}, "", url);
        if(typeof loadFeaturedProducts === "function"){
            loadFeaturedProducts();
        }
        if(typeof renderStores === "function"){
            renderStores(allStores);
        }
    }
});
window.loadCartCount = loadCartCount;
updateMessageCount();
window.updateMessageCount =
updateMessageCount;