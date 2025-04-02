document.addEventListener('DOMContentLoaded', function () {
    // Login form
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');
    const loginButton = document.querySelector('.btn-login');

    // Signup form
    const signupForm = document.getElementById('signup-form');
    const signupError = document.getElementById('signup-error');
    const signupEmail = document.getElementById('signup-email');
    const signupPassword = document.getElementById('signup-password');
    const signupPasswordConfirm = document.getElementById('signup-password-confirm');
    const signupButton = document.querySelector('.btn-signup');

    // Email validation function
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Password validation function
    function isValidPassword(password) {
        return password.length >= 6;
    }

    // Function to check if all fields are valid
    function checkLoginFields() {
        if (loginEmail && loginPassword && loginButton) {
            const emailValid = isValidEmail(loginEmail.value);
            const passwordValid = isValidPassword(loginPassword.value);

            if (emailValid && passwordValid) {
                loginButton.classList.add('fields-filled');
            } else {
                loginButton.classList.remove('fields-filled');
            }
        }
    }

    // Function to check if all signup fields are valid
    function checkSignupFields() {
        if (signupEmail && signupPassword && signupPasswordConfirm && signupButton) {
            const emailValid = isValidEmail(signupEmail.value);
            const passwordValid = isValidPassword(signupPassword.value);
            const passwordsMatch = signupPassword.value === signupPasswordConfirm.value;

            if (emailValid && passwordValid && passwordsMatch) {
                signupButton.classList.add('fields-filled');
            } else {
                signupButton.classList.remove('fields-filled');
            }
        }
    }

    // Add event listeners for login form
    if (loginEmail && loginPassword) {
        loginEmail.addEventListener('input', checkLoginFields);
        loginPassword.addEventListener('input', checkLoginFields);
    }

    // Add event listeners for signup form
    if (signupEmail && signupPassword && signupPasswordConfirm) {
        signupEmail.addEventListener('input', checkSignupFields);
        signupPassword.addEventListener('input', checkSignupFields);
        signupPasswordConfirm.addEventListener('input', checkSignupFields);
    }

    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form values
            const email = loginEmail.value;
            const password = loginPassword.value;

            // Validate fields
            if (!isValidEmail(email)) {
                if (loginError) {
                    loginError.textContent = "Please enter a valid email address";
                    loginError.classList.remove('hidden');
                }
                return;
            }

            if (!isValidPassword(password)) {
                if (loginError) {
                    loginError.textContent = "Password must be at least 6 characters long";
                    loginError.classList.remove('hidden');
                }
                return;
            }

            // Hide previous error
            if (loginError) loginError.classList.add('hidden');

            // Sign in with Firebase
            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    window.location.href = 'main.html';
                })
                .catch((error) => {
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
            const email = signupEmail.value;
            const password = signupPassword.value;
            const confirmPassword = signupPasswordConfirm.value;

            // Validate fields
            if (!isValidEmail(email)) {
                if (signupError) {
                    signupError.textContent = "Please enter a valid email address";
                    signupError.classList.remove('hidden');
                }
                return;
            }

            if (!isValidPassword(password)) {
                if (signupError) {
                    signupError.textContent = "Password must be at least 6 characters long";
                    signupError.classList.remove('hidden');
                }
                return;
            }

            if (password !== confirmPassword) {
                if (signupError) {
                    signupError.textContent = "Passwords don't match";
                    signupError.classList.remove('hidden');
                }
                return;
            }

            // Hide previous error
            if (signupError) signupError.classList.add('hidden');

            // Create user with Firebase
            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
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
                    window.location.href = 'filter.html';
                })
                .catch((error) => {
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
                window.location.href = 'main.html';
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
                window.location.href = 'main.html';
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
    //     window.location.href = 'main.html';
    // }
    // });
});

firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => {
        // Persistence set to LOCAL, so the user remains signed in.
        console.log("Auth persistence set to LOCAL.");
    })
    .catch((error) => {
        console.error("Failed to set persistence:", error);
    });
