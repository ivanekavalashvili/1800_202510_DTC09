var currentUser;               //points to the document of the user who is logged in
console.log(currentUser)

function populateUserInfo() {
            firebase.auth().onAuthStateChanged(user => {
                // Check if user is signed in:
                if (user) {

                    //go to the correct user document by referencing to the user uid
                    currentUser = db.collection("users").doc(user.uid)
                    //get the document for current user.
                    currentUser.get()
                        .then(userDoc => {
                            //get the data fields of the user
                            let useraboutme = userDoc.data().about_me;
                            let usercredential = userDoc.data().credentials;
                            let userinterests = userDoc.data().interests;

                            console.log(useraboutme)
                            console.log(usercredential)
                            console.log(userinterests)

                            //if the data fields are not empty, then write them in to the form.
                            if (useraboutme != null) {
                                document.getElementById("profile_aboutme").value = useraboutme;
                            }
                            if (usercredential != null) {
                                document.getElementById("profile_credentials").value = usercredential;
                            }
                            if (userinterests != null) {
                                document.getElementById("profile_interests").value = userinterests;
                            }
                        })
                } else {
                    // No user is signed in.
                    console.log ("No user is signed in");
                }
            });
        }

//call the function to run it 
populateUserInfo();

function editUserInfo() {
    document.getElementById("profile_aboutme").disabled = false
    document.getElementById("profile_credentials").disabled = false
    document.getElementById("profile_interests").disabled = false
}

function saveUserInfo() {
    document.getElementById("profile_aboutme").disabled = true
    document.getElementById("profile_credentials").disabled = true
    document.getElementById("profile_interests").disabled = true

    useraboutme = document.getElementById('profile_aboutme').value; 
    usercredential = document.getElementById('profile_credentials').value; 
    userinterests = document.getElementById('profile_interests').value;   

    currentUser.update({
        about_me: useraboutme,
        credentials: usercredential,
        interests: userinterests
    })
        .then(() => {
            console.log("Document successfully updated!");
        })
}
