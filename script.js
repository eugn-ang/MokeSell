document.addEventListener("DOMContentLoaded", () => {
    const favoriteButtons = document.querySelectorAll(".favorite-btn");
    favoriteButtons.forEach(button => {
        button.addEventListener("click", () => {
            alert("Item added to favorites!");
        });
    });
});



function editProfile() {
    alert("Profile editing feature coming soon!");
}


function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar.style.right === "0px") {
        sidebar.style.right = "-250px";
    } else {
        sidebar.style.right = "0px";
    }
}