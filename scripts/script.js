function sayHello() {
    console.log("Hello from Barter Base!");
}

// Check if user is logged in and update UI accordingly
auth.onAuthStateChanged(user => {
    if (user) {
        // User is logged in
        console.log("User is signed in:", user.email);

        // Update profile link to point to profile page instead of login
        const profileLinks = document.querySelectorAll('a[href="login.html"]');
        profileLinks.forEach(link => {
            link.setAttribute('href', 'profile.html');
        });

        const barterButton = document.querySelector('button.bg-uranian_blue');
        if (barterButton) {
            barterButton.addEventListener('click', function () {
                window.location.href = 'filter.html';
            });
        }
    } else {
        // User is not logged in
        console.log("User is not signed in");

        const profileLinks = document.querySelectorAll('a[href="profile.html"]');
        profileLinks.forEach(link => {
            link.setAttribute('href', 'login.html');
        });

        const barterButton = document.querySelector('button.bg-uranian_blue');
        if (barterButton) {
            barterButton.addEventListener('click', function () {
                window.location.href = 'login.html';
            });
        }
    }
});

// Tmp.
sayHello();