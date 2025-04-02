var currentUser;               //points to the document of the user who is logged in
console.log(currentUser)


function populateUserInfo() {
    let params = new URL(window.location.href); // Get URL of search bar
    let ID = params.searchParams.get("docID"); // Get value for key "docID"
    console.log("ID " + ID);
    console.log("params " + params);

    // Fetch user profile information
    db.collection("users")
        .doc(ID)
        .get()
        .then(doc => {
            let useraboutme = doc.data().about_me;
            let usercredential = doc.data().credentials;
            let userinterests = doc.data().interests;
            let useremail = doc.data().email;
            let profilePicture = doc.data().profilePicture;

            // Update profile picture if available
            if (profilePicture) {
                document.getElementById("profile-image").src = profilePicture;
            }

            // Placing data from firestore into the paragraphs from profile.html
            document.getElementById("paragraph_aboutme").innerHTML = useraboutme;
            document.getElementById("paragraph_credentials").innerHTML = usercredential;
            document.getElementById("paragraph_interests").innerHTML = userinterests;
            document.getElementById("email_user").innerHTML = useremail;
        });

    firebase.auth().onAuthStateChanged(user => {
        if (user && user.uid == ID) {
            // Show upload button only on own profile
            document.getElementById('upload-button').style.display = 'block';
            console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')
            currentUser = db.collection("users").doc(user.uid);
            currentUser.get()
                .then(userDoc => {
                    let useraboutme = userDoc.data().about_me;
                    let usercredential = userDoc.data().credentials;
                    let userinterests = userDoc.data().interests;
                    let profilePicture = userDoc.data().profilePicture;

                    // Changing displays for owner of profile or vistior of profile
                    console.log('This is actived')
                    document.getElementById("profile_aboutme").style.display = "block";
                    document.getElementById("paragraph_aboutme").style.display = "none";
                    document.getElementById("profile_credentials").style.display = "block";
                    document.getElementById("paragraph_credentials").style.display = "none";
                    document.getElementById("profile_interests").style.display = "block";
                    document.getElementById("paragraph_interests").style.display = "none";

                    if (profilePicture) {
                        document.getElementById("profile-image").src = profilePicture;
                    }

                    if (useraboutme != null) {
                        document.getElementById("profile_aboutme").value = useraboutme;
                        document.getElementById("paragraph_aboutme").innerHTML = useraboutme;
                    }
                    if (usercredential != null) {
                        document.getElementById("profile_credentials").value = usercredential;
                        document.getElementById("paragraph_credentials").innerHTML = usercredential;
                    }
                    if (userinterests != null) {
                        document.getElementById("profile_interests").value = userinterests;
                        document.getElementById("paragraph_interests").innerHTML = userinterests;
                    }
                });
        } else {
            // Hide upload button on other profiles
            document.getElementById('upload-button').style.display = 'none';
        }
    });
}


firebase.auth().onAuthStateChanged(user => {
    // Check if user is signed in:
    let params = new URL(window.location.href);
    let ID = params.searchParams.get("docID");
    console.log(ID)
    if (user.uid == ID) {
        document.getElementById('upload-button').style.display = 'block';
        //go to the correct user document by referencing to the user uid
        currentUser = db.collection("users").doc(user.uid)
        //get the document for current user.
        currentUser.get()
            .then(userDoc => {
                //get the data fields of the user
                console.log("this is reaching me ")
                let useraboutme = userDoc.data().about_me;
                let usercredential = userDoc.data().credentials;
                let userinterests = userDoc.data().interests;

                document.getElementById("profile_aboutme").style.display = "block"
                document.getElementById("paragraph_aboutme").style.display = "none"

                document.getElementById("profile_credentials").style.display = "block"
                document.getElementById("paragraph_credentials").style.display = "none"

                document.getElementById("profile_interests").style.display = "block"
                document.getElementById("paragraph_interests").style.display = "none"

                console.log(useraboutme)
                console.log(usercredential)
                console.log(userinterests)

                //if the data fields are not empty, then write them in to the form.
                if (useraboutme != null) {
                    document.getElementById("profile_aboutme").value = useraboutme;
                    document.getElementById("paragraph_aboutme").innerHTML = useraboutme;
                }
                if (usercredential != null) {
                    document.getElementById("profile_credentials").value = usercredential;
                    document.getElementById("paragraph_credentials").innerHTML = usercredential
                }
                if (userinterests != null) {
                    document.getElementById("profile_interests").value = userinterests;
                    document.getElementById("paragraph_interests").innerHTML = userinterests;

                }
            })
    } else {
        // No user is signed in.
        console.log("No user is signed in");
    }
});

//call the function to run it 
populateUserInfo();

function saveUserInfoAboutme() {
    useraboutme = document.getElementById('profile_aboutme').value;
    document.getElementById('paragraph_aboutme').value = useraboutme

    currentUser.update({
        about_me: useraboutme,
    })
        .then(() => {
            console.log("Document successfully updated!");
        })

    document.getElementById('savechanges_aboutme').style.display = "block";
    setTimeout(() => {
        document.getElementById('savechanges_aboutme').style.display = "none";
    }, 3000);
}

function saveUserInfoCredentials() {
    usercredential = document.getElementById('profile_credentials').value;
    document.getElementById('paragraph_credentials').value = usercredential

    currentUser.update({
        credentials: usercredential,
    })
        .then(() => {
            console.log("Document successfully updated!");
        })

    document.getElementById('savechanges_credentials').style.display = "block";
    setTimeout(() => {
        document.getElementById('savechanges_credentials').style.display = "none";
    }, 3000);
}

function saveUserInfoInterests() {
    userinterests = document.getElementById('profile_interests').value;
    document.getElementById('paragraph_interests').value = userinterests

    currentUser.update({
        interests: userinterests
    })
        .then(() => {
            console.log("Document successfully updated!");
        })

    document.getElementById('savechanges_interests').style.display = "block";
    setTimeout(() => {
        document.getElementById('savechanges_interests').style.display = "none";
    }, 3000);
}

function saveUserInfo() {
    // Data from editied textareas are stored to a variable
    useraboutme = document.getElementById('profile_aboutme').value;
    usercredential = document.getElementById('profile_credentials').value;
    userinterests = document.getElementById('profile_interests').value;
    document.getElementById('paragraph_interests').value = userinterests
    document.getElementById('paragraph_credentials').value = usercredential
    document.getElementById('paragraph_aboutme').value = useraboutme

    // Data updated into firstore
    displaysavedchangesAboutme()
    currentUser.update({
        about_me: useraboutme,
        credentials: usercredential,
        interests: userinterests
    })
        .then(() => {
            console.log("Document successfully updated!");
        })
}

function fetchUserSkills() {
    let params = new URL(window.location.href);
    let docID = params.searchParams.get("docID");
    console.log("Fetching skills for user with docID:", docID);

    // Grab each skill that has the users ID in it for the offering div
    db.collection("userSkills")
        .where("direction", "==", "Offering")
        .where("userID", "==", docID)
        .get()
        .then((querySnapshot) => {
            const offersDiv = document.getElementById("offers_div");
            offersDiv.innerHTML = '';

            // for every document that has the user ID it will take the data from the document
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const offerItem = createSkillCard(data, "Offering");
                offersDiv.appendChild(offerItem);
            });
        })
        .catch((error) => {
            console.error("Error getting offering skills: ", error);
        });

    // Grab each skill that has the users ID in it for the requesting div
    db.collection("userSkills")
        .where("direction", "==", "Requesting")
        .where("userID", "==", docID)
        .get()
        .then((querySnapshot) => {
            const requestsDiv = document.getElementById("requests_div");
            requestsDiv.innerHTML = '';

            // for every document that has the user ID it will take the data from the document
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const requestItem = createSkillCard(data, "Requesting");
                requestsDiv.appendChild(requestItem);
            });
        })
        .catch((error) => {
            console.error("Error getting requesting skills: ", error);
        });
}
// Create the cards that appear underneth offering and requests :3
function createSkillCard(data) {
    const card = document.createElement("div");
    card.classList.add("bg-white", "border", "rounded-lg", "shadow", "p-4", "mb-4", "md:w-50", "w-30", "mx-auto");

    const skillTitle = document.createElement("h3");
    skillTitle.classList.add("font-semibold", "text-center");
    skillTitle.textContent = `${data.skill}`;

    card.appendChild(skillTitle);

    return card;
}

window.onload = fetchUserSkills;

function addContact() {
    // Get the current user and profile user
    const currentUser = firebase.auth().currentUser;
    let params = new URL(window.location.href);
    let profileUserId = params.searchParams.get("docID");

    if (!currentUser) {
        alert("Please sign in to add contacts");
        window.location.href = "login.html";
        return;
    }

    if (currentUser.uid === profileUserId) {
        alert("You cannot add yourself as a contact");
        return;
    }

    // Get user data to store in contacts
    db.collection("users").doc(profileUserId).get()
        .then(doc => {
            if (doc.exists) {
                const contactEmail = doc.data().email || "User";
                const contactData = {
                    userId: currentUser.uid,
                    contactId: profileUserId,
                    contactName: contactEmail,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                };

                // First, let's set up a conversation
                const conversationId = [currentUser.uid, profileUserId].sort().join('_');

                db.collection("conversations").doc(conversationId).set({
                    participants: [currentUser.uid, profileUserId],
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastMessage: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true })
                    .then(() => {
                        console.log("Conversation created successfully");

                        // Now check if contact exists
                        return db.collection("contacts")
                            .where("userId", "==", currentUser.uid)
                            .where("contactId", "==", profileUserId)
                            .get();
                    })
                    .then(snapshot => {
                        if (snapshot.empty) {
                            // Add new contact with the conversation ID reference
                            contactData.conversationId = conversationId;
                            return db.collection("contacts").add(contactData);
                        } else {
                            console.log("Contact already exists");
                            return Promise.resolve(); // Contact exists, so no need to add
                        }
                    })
                    .then(() => {
                        alert("Contact added successfully! Opening chat...");
                        toggleChat();

                        // Wait for chat UI to load
                        setTimeout(() => {
                            if (typeof window.loadContacts === 'function') {
                                window.loadContacts();

                                // Allow time for contacts to load
                                setTimeout(() => {
                                    if (typeof window.selectContact === 'function') {
                                        window.selectContact(profileUserId, contactEmail);
                                    }
                                }, 800); // Longer delay to ensure contacts are loaded
                            }
                        }, 400);
                    })
                    .catch(error => {
                        console.error("Error in contact process:", error);

                        // If this is a permission error, provide more helpful information
                        if (error.code === "permission-denied") {
                            alert("Permission error: You don't have permission to create contacts. Please contact support.");
                        } else {
                            alert("Error adding contact. Error details: " + error.message);
                        }
                    });
            } else {
                alert("User profile not found");
            }
        })
        .catch(error => {
            console.error("Error getting user document:", error);
            alert("Error retrieving user information: " + error.message);
        });
}

// Add this at the end to hide chat button on own profile
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        let params = new URL(window.location.href);
        let profileUserId = params.searchParams.get("docID");

        // Hide chat button on your own profile
        if (user.uid === profileUserId) {
            document.getElementById("chat_btn").style.display = "none";
        }
    }
});

// Profile picture upload handling
document.getElementById('profile-upload').addEventListener('change', handleProfilePictureUpload);

async function handleProfilePictureUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Store the upload button and its original content
    const uploadButton = document.getElementById('upload-button');
    const originalContent = uploadButton.innerHTML;

    // Function to reset button state
    const resetButton = () => {
        uploadButton.innerHTML = originalContent;
        uploadButton.disabled = false;
    };

    try {
        // Check if file is an image
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Please upload an image smaller than 5MB');
            return;
        }

        const user = firebase.auth().currentUser;
        if (!user) {
            alert('Please sign in to upload a profile picture');
            return;
        }

        // Show loading state
        uploadButton.innerHTML = `
            <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        `;
        uploadButton.disabled = true;

        // Get storage reference
        const storageRef = firebase.storage().ref();

        // Create a reference to the user's profile picture
        const fileExtension = file.name.split('.').pop();
        const fileName = `${user.uid}.${fileExtension}`;
        const profilePicRef = storageRef.child(`profile-pictures/${fileName}`);

        // Create file metadata including the content type
        const metadata = {
            contentType: file.type,
        };

        // Upload the file and metadata
        const uploadTask = profilePicRef.put(file, metadata);

        // Listen for state changes, errors, and completion of the upload
        uploadTask.on(
            firebase.storage.TaskEvent.STATE_CHANGED,
            (snapshot) => {
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
            },
            (error) => {
                // Handle unsuccessful uploads
                console.error('Upload error:', error);
                let errorMessage = 'Error uploading profile picture. ';
                if (error.code === 'storage/unauthorized') {
                    errorMessage += 'You do not have permission to upload files.';
                } else if (error.code === 'storage/canceled') {
                    errorMessage += 'Upload was cancelled.';
                } else if (error.code === 'storage/unknown') {
                    errorMessage += 'An unknown error occurred.';
                } else {
                    errorMessage += error.message || 'Please try again.';
                }
                alert(errorMessage);
                resetButton();
            },
            async () => {
                // Handle successful uploads on complete
                try {
                    // Get the download URL
                    const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();

                    // Update user profile
                    await user.updateProfile({
                        photoURL: downloadURL
                    });

                    // Update user document in Firestore
                    await db.collection('users').doc(user.uid).update({
                        profilePicture: downloadURL
                    });

                    // Update the image on the page
                    const profileImage = document.getElementById('profile-image');
                    if (profileImage) {
                        profileImage.src = downloadURL;
                    }

                    // Reset button and show success message
                    resetButton();
                    alert('Profile picture updated successfully!');
                } catch (error) {
                    console.error('Error after upload:', error);
                    alert('Error updating profile information. Please try again.');
                    resetButton();
                }
            }
        );

    } catch (error) {
        console.error('Error in upload process:', error);
        alert('Error starting upload process. Please try again.');
        resetButton();
    }
}