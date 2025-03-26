var currentUser;               //points to the document of the user who is logged in
console.log(currentUser)


function populateUserInfo() {
    let params = new URL(window.location.href); // Get URL of search bar
    let docID = params.searchParams.get("docID"); // Get value for key "docID"
    console.log("ID" + docID);
    console.log("params " + params);

    // Fetch user profile information
    db.collection("users")
        .doc(docID)
        .get()
        .then(doc => {
            let useraboutme = doc.data().about_me;
            let usercredential = doc.data().credentials;
            let userinterests = doc.data().interests;
            let useremail = doc.data().email;

            document.getElementById("paragraph_aboutme").innerHTML = useraboutme;
            document.getElementById("paragraph_credentials").innerHTML = usercredential;
            document.getElementById("paragraph_interests").innerHTML = userinterests;
            document.getElementById("email_user").innerHTML = "Profile belongs to " + useremail;
        });

    // Fetch skills for the user
    fetchUserSkills();  // Call the function to populate offers and requests
}


    firebase.auth().onAuthStateChanged(user => {
        // Check if user is signed in:
        if (user.uid == ID) {

            //go to the correct user document by referencing to the user uid
            currentUser = db.collection("users").doc(user.uid)
            //get the document for current user.
            currentUser.get()
                .then(userDoc => {
                    //get the data fields of the user
                    let useraboutme = userDoc.data().about_me;
                    let usercredential = userDoc.data().credentials;
                    let userinterests = userDoc.data().interests;
                    document.getElementById("save_btn").style.display = "block"

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

function saveUserInfo() {
    useraboutme = document.getElementById('profile_aboutme').value;
    usercredential = document.getElementById('profile_credentials').value;
    userinterests = document.getElementById('profile_interests').value;
    document.getElementById('paragraph_interests').value = userinterests
    document.getElementById('paragraph_credentials').value = usercredential
    document.getElementById('paragraph_aboutme').value = useraboutme

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

    db.collection("userSkills")
        .where("direction", "==", "Offering")
        .where("userID", "==", docID) 
        .get()
        .then((querySnapshot) => {
            const offersDiv = document.getElementById("offers_div");
            offersDiv.innerHTML = ''; 

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const offerItem = createSkillCard(data, "Offering");
                offersDiv.appendChild(offerItem);
            });
        })
        .catch((error) => {
            console.error("Error getting offering skills: ", error);
        });

    db.collection("userSkills")
        .where("direction", "==", "Requesting")
        .where("userID", "==", docID)
        .get()
        .then((querySnapshot) => {
            const requestsDiv = document.getElementById("requests_div");
            requestsDiv.innerHTML = '';

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