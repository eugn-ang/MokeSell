// RestDB Configuration
const RESTDB_URL = 'https://fedassignment2-cbbb.restdb.io/rest/usersapp'; // Replace with your actual RestDB URL
const RESTDB_KEY = '67a471210b037f6ef8192cc2'; // Add your RestDB API key here

// State management
let listings = [];
let currentUser = null;


// UI Functions
function renderListings(items = listings) {
    const listingsGrid = document.getElementById('listingsGrid');
    listingsGrid.innerHTML = items.map(listing => `
        <div class="listing-card" onclick="showListingDetails('${listing._id}')">
            <img src="${listing.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'}" 
                 alt="${listing.title}" 
                 class="listing-image">
            <div class="listing-details">
                <h3 class="listing-title">${listing.title}</h3>
                <p class="listing-price">$${parseFloat(listing.price).toFixed(2)}</p>
                <div class="listing-meta">
                    <span>${listing.category}</span>
                    <span>${formatRelativeTime(listing.created_at)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function updateUIForLoggedInUser(user) {
    currentUser = user; // Assign user to global variable

    const loginButton = document.getElementById('loginButton');

    // Change login button to profile icon
    loginButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="7" r="4"/>
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
        </svg>
    `;

    // Remove previous event listeners to avoid duplication
    loginButton.replaceWith(loginButton.cloneNode(true));
    const newLoginButton = document.getElementById('loginButton');

    // Attach the sidebar toggle function
    newLoginButton.addEventListener('click', toggleSidebar);
    // Hide Sign-Up button
    if (signupButton) {
        signupButton.style.display = "none";
    }
}


// Toggle Sidebar Visibility
function toggleSidebar() {
    if (!currentUser) {
        showNotification("Please log in to access your profile!", "warning");
        return; // Prevent sidebar from opening
    }

    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("open");

}
// Logout Function
function logoutUser() {
    localStorage.removeItem("currentUser"); // Clear user session
    currentUser = null;

    // Reset login button
    const loginButton = document.getElementById("loginButton");
    loginButton.innerHTML = "Login";
    loginButton.onclick = () => openModal('loginModal');

    // Close sidebar if open
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.remove("open");
    // Show Sign-Up button again
    if (signupButton) {
        signupButton.style.display = "inline-block"; 
    }
}


// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto';
}




// Event Listener for Sign Up Button
const signupButton = document.getElementById('signupButton');
signupButton.addEventListener('click', () => openModal('signupModal'));
// Handle Sign Up Form submission
const signupForm = document.getElementById('signupForm');
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const Useremail = document.getElementById('signupEmail').value;
    const Username = document.getElementById('signupUsername').value;
    const Password = document.getElementById('signupPassword').value;
    
    const user = {
        Useremail,
        Username,
        Password
    };

    try {
        await fetch("https://fedassignment2-cbbb.restdb.io/rest/usersapp", {
            method: 'POST',
            headers: {
                'x-apikey': RESTDB_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        });
        showNotification('Account created successfully!', 'success');
        closeModal('signupModal');
        signupForm.reset();
    } catch (error) {
        console.error('Error creating user account:', error);
        showNotification('Error creating account', 'error');
    }
});








document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('loginButton');
    const loginForm = document.getElementById('loginForm');

    // Check if a user is already logged in from previous sessions
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
        updateUIForLoggedInUser(JSON.parse(savedUser));
    }

    // Ensure login button only opens modal when user is NOT logged in
    loginButton.addEventListener('click', () => {
        if (!currentUser) {
            openModal('loginModal');
        } else {
            toggleSidebar();
        }
    });

    if (!loginForm) {
        console.error('Login form not found!');
        return;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form values
        const Username = document.getElementById('loginUsername')?.value;
        const Useremail = document.getElementById('loginEmail')?.value;
        const Password = document.getElementById('loginPassword')?.value;

        try {
            const response = await fetch(`https://fedassignment2-cbbb.restdb.io/rest/usersapp?q={"Useremail": "${Useremail}","Username": "${Username}","Password": "${Password}"}`, {
                method: 'GET',
                headers: {
                    'x-apikey': '67a471210b037f6ef8192cc2',
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.length > 0) {
                showNotification("Login successful!", "success");
                console.log("User found:", data[0]); 

                // Store user session in local storage
                localStorage.setItem("currentUser", JSON.stringify(data[0]));

                // Update UI
                updateUIForLoggedInUser(data[0]);

                // Close login modal
                closeModal('loginModal'); 

                // Clear form fields
                loginForm.reset();
            } else {
                showNotification("Invalid credentials!", "error");
            }
        } catch (error) {
            console.error('Error during login:', error);
            showNotification('Error logging in', 'error');
        }
    });
});