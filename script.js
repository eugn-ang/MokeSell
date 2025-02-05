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

function updateUIForLoggedInUser() {
    const loginButton = document.getElementById('loginButton');
    loginButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
        </svg>
        Profile
    `;
    loginButton.onclick = () => showProfile();
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

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredListings = listings.filter(listing =>
            listing.title.toLowerCase().includes(searchTerm) ||
            listing.category.toLowerCase().includes(searchTerm)
        );
        renderListings(filteredListings);
    });

    // Sort functionality
    const sortSelect = document.getElementById('sortSelect');
    sortSelect.addEventListener('change', (e) => {
        const sortedListings = [...listings];
        switch (e.target.value) {
            case 'price-low':
                sortedListings.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                sortedListings.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
                sortedListings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
        }
        renderListings(sortedListings);
    });

    // Category filtering
    const categoryLinks = document.querySelectorAll('.category-nav a');
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = e.target.dataset.category;
            const filteredListings = category === 'all' 
                ? listings 
                : listings.filter(listing => listing.category.toLowerCase() === category);
            renderListings(filteredListings);
        });
    });

    // Modal event listeners
    const loginButton = document.getElementById('loginButton');
    const sellButton = document.getElementById('sellButton');
    
    loginButton.addEventListener('click', () => openModal('loginModal'));
    sellButton.addEventListener('click', () => {
        if (currentUser) {
            openModal('sellModal');
        } else {
            showNotification('Please login to create a listing', 'warning');
            openModal('loginModal');
        }
    });

    // Form submissions
    
    const sellForm = document.getElementById('sellForm');

    

    sellForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newListing = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            price: parseFloat(document.getElementById('price').value),
            category: document.getElementById('category').value,
            image: document.getElementById('image').value,
            created_at: new Date().toISOString(),
            user_id: currentUser._id
        };
        
        await createListing(newListing);
        closeModal('sellModal');
        sellForm.reset();
    });

    // Close modals when clicking outside
    window.onclick = (event) => {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target.id);
        }
    };
});

// Show listing details
async function showListingDetails(id) {
    try {
        const response = await fetch(`${RESTDB_URL}/listings/${id}`, {
            method: 'GET',
            headers: {
                'x-apikey': RESTDB_KEY,
                'Content-Type': 'application/json'
            }
        });
        const listing = await response.json();
        
        // Create a modal for listing details
        const detailsHTML = `
            <div class="modal-content listing-details-modal">
                <img src="${listing.image}" alt="${listing.title}" class="listing-detail-image">
                <h2>${listing.title}</h2>
                <p class="listing-detail-price">$${parseFloat(listing.price).toFixed(2)}</p>
                <p class="listing-detail-description">${listing.description}</p>
                <div class="listing-detail-meta">
                    <span>${listing.category}</span>
                    <span>${formatRelativeTime(listing.created_at)}</span>
                </div>
                <button class="contact-seller-btn">Contact Seller</button>
                <button class="close-button" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = detailsHTML;
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        modal.querySelector('.contact-seller-btn').onclick = () => {
            if (currentUser) {
                showNotification('Message sent to seller!', 'success');
            } else {
                showNotification('Please login to contact the seller', 'warning');
                openModal('loginModal');
            }
        };

        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
                document.body.style.overflow = 'auto';
            }
        };
    } catch (error) {
        console.error('Error fetching listing details:', error);
        showNotification('Error loading listing details', 'error');
    }
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

// Event Listener for Login Button
const loginButton = document.getElementById('loginButton');
loginButton.addEventListener('click', () => openModal('loginModal'));

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
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

        // Debugging: Check if values exist
        console.log("Username:", Username, "Email:", Useremail, "Password:", Password);
        
        

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
                // You can store user session here
                updateUIForLoggedInUser()
                closeModal('loginModal');
                
            } else {
                showNotification("Invalid credentials!", "error");
                console.error("No matching user found.");
            }
        } catch (error) {
            console.error('Error during login:', error);
            showNotification('Error logging in', 'error');
        }
    });
});
