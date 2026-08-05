const navbarToken =
localStorage.getItem("token");
var user =
JSON.parse(
    localStorage.getItem("user")
);

const mobileLoginLink = document.getElementById("mobileLoginLink");
const mobileRegisterLink = document.getElementById("mobileRegisterLink");
const mobileProfileLink = document.getElementById("mobileProfileLink");
const mobileLogoutLink = document.getElementById("mobileLogoutLink");
const mobileCartLink = document.getElementById("mobileCartLink");
const mobileCreateListingLink = document.getElementById("mobileCreateListingLink");
const mobileInboxLink = document.getElementById("mobileInboxLink");
const mobileNotificationsLink = document.getElementById("mobileNotificationsLink");
const mobileUsersubtitle = document.getElementById("mobileUserSubtitle");

function updateGuestMenu() {
    const loggedIn = !!localStorage.getItem("token");

    if (loggedIn) {
        if (mobileLoginLink) mobileLoginLink.style.display = "none";
        if (mobileRegisterLink) mobileRegisterLink.style.display = "none";

        if (mobileProfileLink) mobileProfileLink.style.display = "flex";
        if (mobileLogoutLink) mobileLogoutLink.style.display = "flex";
        if (mobileCartLink) mobileCartLink.style.display = "flex";
        if (mobileCreateListingLink) mobileCreateListingLink.style.display = "flex";
        if (mobileInboxLink) mobileInboxLink.style.display = "flex";
        if (mobileNotificationsLink) mobileNotificationsLink.style.display = "flex";
        if (mobileUsersubtitle) mobileUsersubtitle.textContent = "Welcome back!" ;
    } else {
        if (mobileLoginLink) mobileLoginLink.style.display = "flex";
        if (mobileRegisterLink) mobileRegisterLink.style.display = "flex";

        if (mobileProfileLink) mobileProfileLink.style.display = "none";
        if (mobileLogoutLink) mobileLogoutLink.style.display = "none";
        if (mobileCartLink) mobileCartLink.style.display = "none";
        if (mobileCreateListingLink) mobileCreateListingLink.style.display = "none";
        if (mobileInboxLink) mobileInboxLink.style.display = "none";
        if (mobileNotificationsLink) mobileNotificationsLink.style.display = "none";
        if (mobileUsersubtitle) mobileUsersubtitle.textContent = "Sign in or create an account";
    }
}

updateGuestMenu();

async function updateStoreNavigation(){

    const token = localStorage.getItem("token");

    if(!token) return;

    try{

        const response = await fetch(
            "https://acity-backend.onrender.com/api/stores/me",
            {
                headers:{
                    Authorization:`Bearer ${token}`
                }
            }
        );

        if(!response.ok) return;

        const data = await response.json();

        const desktopLink = document.querySelector(
            '.nav-item.sell span'
        );

        const mobileLink = document.getElementById(
            "mobileCreateListingLink"
        );

        if(data.hasStore){

            if(desktopLink){

                desktopLink.textContent = "Create Listing";

            }

            if(mobileLink){

                mobileLink.innerHTML = `
                    <i class="fa-solid fa-plus"></i>
                    Create Listing
                `;

            }

        }else{

            if(desktopLink){

                desktopLink.textContent = "Create Store";

            }

            if(mobileLink){

                mobileLink.innerHTML = `
                    <i class="fa-solid fa-store"></i>
                    Create Store
                `;

            }

        }

    }catch(err){

        console.error(err);

    }

}

const adminLink =
document.getElementById(
    "adminLink"
);




const mobileUser = document.getElementById("mobileUserName");
const mobileProfileImage = document.getElementById("mobileProfileImage");

if (user) {
    if (mobileUser) {
        mobileUser.textContent = user.name;
    }

    if (mobileProfileImage) {
        mobileProfileImage.src = user.profile_picture || "images/default-avatar-image.jpg";

        mobileProfileImage.onerror = () => {
            mobileProfileImage.src = "images/default-avatar-image.jpg";
        };
    }
}

const navProfileImage = document.getElementById("navProfileImage");
const navProfileName = document.getElementById("navProfileName");

if (user) {
    if (navProfileName) {
        // Display only the user's first name
        navProfileName.textContent = user.name ? user.name.split(" ")[0] : "Account";
    }

    if (navProfileImage) {
        navProfileImage.src = user.profile_picture || "images/default-avatar-image.jpg";

        // Fallback to default avatar if image URL fails to load
        navProfileImage.onerror = () => {
            navProfileImage.src = "images/default-avatar-image.jpg";
        };
    }
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

    const href = link.getAttribute("href");

    if (
        href === currentPage ||

        (
            currentPage === "create-store.html" &&
            href === "create-listing.html"
        )
    ) {
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

function logout() {

    showConfirmModal({

        title: "Logout",

        message: "Are you sure you want to log out?",

        icon: "fa-right-from-bracket",

        confirmText: "Logout",

        confirmClass: "btn-primary",

        onConfirm: () => {

            localStorage.removeItem("token");

            localStorage.removeItem("user");

            window.location.href = "login.html";

        }

    });

}



window.logout = logout;
window.loadCartCount = loadCartCount;
updateMessageCount();
window.updateMessageCount =
updateMessageCount;
updateStoreNavigation();