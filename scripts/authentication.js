document.addEventListener('DOMContentLoaded', function () {
    // Login form
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    // Signup form
    const signupForm = document.getElementById('signup-form');
    const signupError = document.getElementById('signup-error');

    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form values
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            // Hide previous error
            if (loginError) loginError.classList.add('hidden');

            // Sign in with Firebase
            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // Redirect to home page after successful login
                    window.location.href = 'index.html';
                })
                .catch((error) => {
                    // Show error message
                    if (loginError) {
                        loginError.textContent = error.message;
                        loginError.classList.remove('hidden');
                    } else {
                        alert(`Login error: ${error.message}`);
                    }
                });
        });
    }

    // Signup form submission
    if (signupForm) {
        signupForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form values
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('signup-password-confirm').value;

            // Hide previous error
            if (signupError) signupError.classList.add('hidden');

            // Check if passwords match
            if (password !== confirmPassword) {
                if (signupError) {
                    signupError.textContent = "Passwords don't match";
                    signupError.classList.remove('hidden');
                } else {
                    alert("Passwords don't match");
                }
                return;
            }

            // Create user with Firebase
            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // Create user document in Firestore
                    const user = userCredential.user;
                    return db.collection('users').doc(user.uid).set({
                        email: user.email,
                        interests: 'Add your interests here!',
                        credentials: 'Add your credentials here!',
                        about_me: 'Add things about you here!',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    });
                })
                .then(() => {
                    // Redirect to home page after successful signup
                    window.location.href = 'index.html';
                })
                .catch((error) => {
                    // Show error message
                    if (signupError) {
                        signupError.textContent = error.message;
                        signupError.classList.remove('hidden');
                    } else {
                        alert(`Signup error: ${error.message}`);
                    }
                });
        });
    }

    // Social Login: Google
    const googleBtn = document.getElementById('google-login');
    googleBtn.addEventListener('click', function (e) {
        e.preventDefault();
        const googleProvider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(googleProvider)
            .then((result) => {
                // Optional: you can retrieve the access token with result.credential.accessToken
                console.log("Google sign in successful:", result.user);
                window.location.href = 'index.html';
            })
            .catch((error) => {
                console.error("Error during Google sign in:", error);
                alert(error.message);
            });
    });

    // Social Login: Facebook
    const facebookBtn = document.getElementById('facebook-login');
    facebookBtn.addEventListener('click', function (e) {
        e.preventDefault();
        const facebookProvider = new firebase.auth.FacebookAuthProvider();
        auth.signInWithPopup(facebookProvider)
            .then((result) => {
                // Optional: you can retrieve the access token with result.credential.accessToken
                console.log("Facebook sign in successful:", result.user);
                window.location.href = 'index.html';
            })
            .catch((error) => {
                console.error("Error during Facebook sign in:", error);
                alert(error.message);
            });
    });
    // This needs to get changed at some point

    // Check authentication state
    // auth.onAuthStateChanged(user => {
    // if (user && window.location.pathname.includes('login.html')) {
    //     // User is signed in and on login page, redirect to home
    //     window.location.href = 'index.html';
    // }
    // });
});
