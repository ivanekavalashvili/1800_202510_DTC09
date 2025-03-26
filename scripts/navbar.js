// Function to setup dropdown menu functionality
function setupDropdownMenu() {
    const profileButton = document.getElementById('profile-button');
    const dropdown = document.getElementById('profile-dropdown');
    const profilePic = document.getElementById('navbar-profile-pic');

    if (!profileButton || !dropdown || !profilePic) {
        console.log("Dropdown elements not found, retrying...");
        setTimeout(setupDropdownMenu, 100);
        return;
    }

    // Store the current profile picture source
    const currentProfilePicSrc = profilePic.src;

    // Remove existing event listeners if any
    const newProfileButton = profileButton.cloneNode(true);
    profileButton.parentNode.replaceChild(newProfileButton, profileButton);

    // Restore the profile picture source
    const newProfilePic = newProfileButton.querySelector('#navbar-profile-pic');
    if (newProfilePic) {
        newProfilePic.src = currentProfilePicSrc;
    }

    // Toggle dropdown on button click
    newProfileButton.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation(); // Prevent event from bubbling up
        dropdown.classList.toggle('hidden');
        console.log('Dropdown toggled');
    });

    // Remove existing document click listener
    document.removeEventListener('click', handleDocumentClick);
    document.removeEventListener('keydown', handleEscapeKey);

    // Add new document click listener
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleEscapeKey);
}

// Handler for document clicks
function handleDocumentClick(e) {
    const profileContainer = document.getElementById('profile-container');
    const dropdown = document.getElementById('profile-dropdown');
    if (profileContainer && dropdown && !profileContainer.contains(e.target)) {
        dropdown.classList.add('hidden');
    }
}

// Handler for escape key
function handleEscapeKey(e) {
    if (e.key === 'Escape') {
        const dropdown = document.getElementById('profile-dropdown');
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
    }
}

// Function to update navbar profile picture and links based on authentication state
function updateNavbarProfile() {
    const profilePic = document.getElementById('navbar-profile-pic');
    const profileButton = document.getElementById('profile-button');
    const profileDropdownLink = document.getElementById('profile-dropdown-link');
    const dropdown = document.getElementById('profile-dropdown');

    // Check if elements exist
    if (!profilePic || !profileButton || !profileDropdownLink || !dropdown) {
        console.log("Navbar elements not found, retrying...");
        setTimeout(updateNavbarProfile, 100);
        return;
    }

    // Function to update profile picture
    function updateProfilePicture(src) {
        const allProfilePics = document.querySelectorAll('#navbar-profile-pic');
        allProfilePics.forEach(pic => {
            pic.src = src;
            console.log("Updated profile picture:", src);
        });
    }

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in
            console.log("User is signed in:", user.uid);

            // Get user data from Firestore
            db.collection("users").doc(user.uid).get()
                .then((doc) => {
                    if (doc.exists) {
                        const userData = doc.data();
                        console.log("User data:", userData);
                        if (userData.profilePicture) {
                            updateProfilePicture(userData.profilePicture);
                        } else {
                            console.log("No profile picture found, using default");
                            updateProfilePicture('images/Blank_pfp.png');
                        }
                    } else {
                        console.log("No user document found");
                        updateProfilePicture('images/Blank_pfp.png');
                    }
                })
                .catch((error) => {
                    console.error("Error getting user data:", error);
                    updateProfilePicture('images/Blank_pfp.png');
                });

            // Update profile links
            profileDropdownLink.href = `profile.html?docID=${user.uid}`;
            profileButton.style.cursor = 'pointer';
        } else {
            // No user is signed in
            console.log("No user signed in");
            updateProfilePicture('images/Blank_pfp.png');
            // Only redirect to login if we're not already on the login page
            if (!window.location.pathname.includes('login.html')) {
                window.location.href = 'login.html';
            }
        }
    });
}

// Wait for both DOM and Firebase to be ready
function initializeNavbar() {
    console.log("Initializing navbar...");
    if (typeof firebase !== 'undefined' && firebase.app()) {
        updateNavbarProfile();
        setupDropdownMenu();
    } else {
        console.log("Waiting for Firebase...");
        setTimeout(initializeNavbar, 100);
    }
}

// Initialize navbar profile when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNavbar);
} else {
    initializeNavbar();
} 