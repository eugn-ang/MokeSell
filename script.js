// RestDB Configuration
const RESTDB_URL = 'https://fedassignment2-cbbb.restdb.io/rest/usersapp'; // Replace with your actual RestDB URL
const RESTDB_KEY = '67a471210b037f6ef8192cc2'; // Add your RestDB API key here

// State management
let listings = [];
let currentUser = null;


function renderListings(items) {
    const listingsGrid = document.getElementById('listingsGrid');
    if (!listingsGrid) return;

    // Clear existing listings
    listingsGrid.innerHTML = '';

    if (items.length === 0) {
        listingsGrid.innerHTML = '<p>No items found in this category.</p>';
        return;
    }

    // Generate HTML for each listing
    listingsGrid.innerHTML = items.map(item => `
        <div class="listing-card" onclick="showListingDetails('${item._id}')">
            <img src="${item.image || 'https://via.placeholder.com/150'}" 
                 alt="${item.title}" 
                 class="listing-image">
            <div class="listing-details">
                <h3 class="listing-title">${item.title}</h3>
                <p class="listing-price">Price: $${parseFloat(item.price).toFixed(2)}</p>
                <p class="listing-condition">Condition: ${item.condition || 'N/A'}</p>
                <p class="listing-category">Category: ${item.category}</p>
                <p class="listing-description">${item.details || 'No details available.'}</p>
            </div>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners to category links
    const categoryLinks = document.querySelectorAll('.category-nav a[data-category]');
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior
            const category = e.target.dataset.category; // Get the category from the data attribute
            loadCategory(category); // Call the loadCategory function
        });
    });
});

async function loadCategory(category) {
    // Update the URL with the selected category
    history.pushState({}, "", `?category=${category}`);

    try {
        // Fetch listings from the database based on the category
        const response = await fetch(`https://fedassignment2-cbbb.restdb.io/rest/listings?q={"category":"${category}"}`, {
            method: 'GET',
            headers: {
                'x-apikey': RESTDB_KEY,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();

        // Render the filtered listings
        renderListings(data);
    } catch (error) {
        console.error('Error fetching listings:', error);
        showNotification('Error loading listings', 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');

    if (category) {
        loadCategory(category); // Load listings for the specified category
    } else {
        fetchListings(); // Load random listings if no category is specified
    }
});

async function fetchListings() {
    try {
        const response = await fetch("https://fedassignment2-cbbb.restdb.io/rest/listings", {
            method: 'GET',
            headers: {
                'x-apikey': RESTDB_KEY,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.length > 0) {
            // Shuffle and show random listings
            const shuffledListings = data.sort(() => 0.5 - Math.random());
            const randomListings = shuffledListings.slice(0, 5); // Display 5 random listings
            renderListings(randomListings);
        } else {
            console.warn('No listings available.');
            renderListings([]); // Display no items found message
        }
    } catch (error) {
        console.error('Error fetching listings:', error);
        showNotification('Error loading listings', 'error');
    }
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
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const signupError = document.getElementById('signupError');

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const Useremail = document.getElementById('signupEmail').value;
        const Username = document.getElementById('signupUsername').value;
        const Password = document.getElementById('signupPassword').value;

        try {
            // Check if email or username already exists
            const checkResponse = await fetch(`${RESTDB_URL}?q={"$or":[{"Useremail": "${Useremail}"}, {"Username": "${Username}"}]}`, {
                method: 'GET',
                headers: {
                    'x-apikey': RESTDB_KEY,
                    'Content-Type': 'application/json'
                }
            });

            const existingUsers = await checkResponse.json();

            if (existingUsers.length > 0) {
                // If a user with the same email or username exists, show an error
                signupError.textContent = "Error: Email or username is already in use.";
                signupError.style.display = "block";
                return; // Stop execution
            }

            // If no existing user is found, proceed with account creation
            const newUser = { Useremail, Username, Password };

            const createResponse = await fetch(RESTDB_URL, {
                method: 'POST',
                headers: {
                    'x-apikey': RESTDB_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newUser)
            });

            if (createResponse.ok) {
                // Show success popup
                openModal('successPopup');
                
                // Close the sign-up modal
                closeModal('signupModal');
                
                // Reset form fields
                signupForm.reset();
                
                // Hide any previous error messages
                signupError.style.display = "none"; 
            } else {
                throw new Error('Failed to create account.');
            }
        } catch (error) {
            console.error('Error creating user account:', error);
            signupError.textContent = "Error creating account. Please try again.";
            signupError.style.display = "block";
        }
    });
});







document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('loginButton');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError'); // Get error message element

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

                // Clear form fields and hide error message
                loginForm.reset();
                loginError.style.display = "none";
            } else {
                // Show error message inside the modal
                loginError.textContent = "Error: Invalid Credentials";
                loginError.style.display = "block";
            }
        } catch (error) {
            console.error('Error during login:', error);
            loginError.textContent = "Error logging in. Please try again.";
            loginError.style.display = "block";
        }
    });
});