// Function to get random categories
function getRandomCategories(categories, count) {
    const shuffled = [...categories].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Function to display recommended contacts
function displayRecommendedContacts(users) {
    console.log("Displaying users:", JSON.stringify(users, null, 2));
    const recommendedContainer = document.getElementById('recommended-contacts');
    recommendedContainer.innerHTML = ''; // Clear existing content

    users.forEach(user => {
        console.log("Processing user data:", JSON.stringify(user, null, 2));
        console.log("User ID:", user.id);

        const userCard = document.createElement('div');
        userCard.className = 'bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-[600px]';

        userCard.innerHTML = `
            <a href="profile.html?docID=${user.id}" class="block hover:opacity-90 transition-opacity h-48 flex-shrink-0">
                <img src="${user.profilePicture || 'images/Blank_pfp.png'}" alt="Profile" 
                     class="w-full h-full object-cover">
            </a>
            <div class="p-4 flex flex-col flex-grow">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-semibold text-lg">${user.email}</h3>
                </div>
                
                ${user.about_me ? `
                    <div class="mb-4 overflow-hidden">
                        <p class="text-gray-600 line-clamp-3">${user.about_me}</p>
                    </div>
                ` : ''}
                
                <div class="flex-grow">
                    ${user.skills.offering.length > 0 ? `
                        <div class="mb-3">
                            <h4 class="font-medium text-sm text-gray-500 mb-1">Offering:</h4>
                            <div class="flex flex-wrap gap-1">
                                ${user.skills.offering.slice(0, 4).map(skill => `
                                    <span class="bg-uranian_blue text-oxford_blue px-2 py-1 rounded-full text-sm">${skill}</span>
                                `).join('')}
                                ${user.skills.offering.length > 4 ? `
                                    <span class="bg-uranian_blue text-oxford_blue px-2 py-1 rounded-full text-sm">+${user.skills.offering.length - 4} more</span>
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${user.skills.requesting.length > 0 ? `
                        <div class="mb-3">
                            <h4 class="font-medium text-sm text-gray-500 mb-1">Looking for:</h4>
                            <div class="flex flex-wrap gap-1">
                                ${user.skills.requesting.slice(0, 4).map(skill => `
                                    <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">${skill}</span>
                                `).join('')}
                                ${user.skills.requesting.length > 4 ? `
                                    <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">+${user.skills.requesting.length - 4} more</span>
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <a href="profile.html?docID=${user.id}" 
                   class="block text-center bg-polynesian_blue text-white px-4 py-2 rounded-full hover:bg-ruddy_blue transition duration-300 mt-4">
                    View Profile
                </a>
            </div>
        `;

        recommendedContainer.appendChild(userCard);
    });
}

// Function to load recommended contacts
function loadRecommendedContacts() {
    const recommendedContainer = document.getElementById('recommended-contacts');
    const currentUser = firebase.auth().currentUser;

    console.log("Loading recommended contacts...");
    console.log("Current user:", currentUser?.uid);
    console.log("Current user email:", currentUser?.email);

    if (!currentUser) {
        console.log("No user logged in, showing random users with skills");
        // If no user is logged in, show random users with skills
        db.collection("users").limit(20).get()
            .then((querySnapshot) => {
                console.log("Random users fetched:", querySnapshot.docs.length);
                // Fetch skills for each user
                const userPromises = querySnapshot.docs.map(doc =>
                    db.collection("userSkills")
                        .where("userID", "==", doc.id)
                        .get()
                        .then(skillsSnapshot => {
                            const skills = {
                                offering: [],
                                requesting: []
                            };
                            skillsSnapshot.forEach(skillDoc => {
                                const data = skillDoc.data();
                                if (data.direction === "Offering") {
                                    skills.offering.push(data.skill);
                                } else if (data.direction === "Requesting") {
                                    skills.requesting.push(data.skill);
                                }
                            });
                            return {
                                id: doc.id,
                                ...doc.data(),
                                skills
                            };
                        })
                );
                Promise.all(userPromises)
                    .then(users => {
                        // Filter out users with no skills
                        const usersWithSkills = users.filter(user =>
                            user.skills.offering.length > 0 || user.skills.requesting.length > 0
                        );
                        // Take only the first 3 users with skills
                        displayRecommendedContacts(usersWithSkills.slice(0, 3));
                    });
            })
            .catch((error) => {
                console.error("Error getting random users:", error);
            });
        return;
    }

    // Get current user's skills
    db.collection("users").doc(currentUser.uid).get()
        .then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                const userSkills = userData.skillsLookingFor || [];
                console.log("Current user skills:", userSkills);
                console.log("Current user data:", userData);

                // Get all users except current user
                db.collection("users")
                    .where(firebase.firestore.FieldPath.documentId(), '!=', currentUser.uid)
                    .limit(50) // Get more users to filter from
                    .get()
                    .then((querySnapshot) => {
                        console.log("Potential matches fetched:", querySnapshot.docs.length);
                        // Fetch skills for each user and calculate match score
                        const userPromises = querySnapshot.docs.map(doc =>
                            db.collection("userSkills")
                                .where("userID", "==", doc.id)
                                .get()
                                .then(skillsSnapshot => {
                                    const skills = {
                                        offering: [],
                                        requesting: []
                                    };
                                    skillsSnapshot.forEach(skillDoc => {
                                        const data = skillDoc.data();
                                        if (data.direction === "Offering") {
                                            skills.offering.push(data.skill);
                                        } else if (data.direction === "Requesting") {
                                            skills.requesting.push(data.skill);
                                        }
                                    });
                                    return {
                                        id: doc.id,
                                        ...doc.data(),
                                        skills
                                    };
                                })
                        );
                        Promise.all(userPromises)
                            .then(users => {
                                console.log("All users before filtering:", users.map(u => ({ id: u.id, email: u.email })));
                                // Filter out users with no skills and exclude current user
                                const usersWithSkills = users.filter(user => {
                                    const isNotCurrentUser = user.id !== currentUser.uid && user.email !== currentUser.email;
                                    const hasMultipleSkills = (user.skills.offering.length > 1 || user.skills.requesting.length > 1);
                                    console.log(`User ${user.email}: isNotCurrentUser=${isNotCurrentUser}, hasMultipleSkills=${hasMultipleSkills}`);
                                    return isNotCurrentUser && hasMultipleSkills;
                                });
                                console.log("Users after filtering:", usersWithSkills.map(u => ({ id: u.id, email: u.email })));
                                // Sort users by match score and take top 3
                                const sortedUsers = usersWithSkills.sort((a, b) => {
                                    const aScore = calculateMatchScore(a.skills, userSkills);
                                    const bScore = calculateMatchScore(b.skills, userSkills);
                                    return bScore - aScore;
                                }).slice(0, 3);
                                console.log("Final users to display:", sortedUsers.map(u => ({ id: u.id, email: u.email })));
                                displayRecommendedContacts(sortedUsers);
                            });
                    })
                    .catch((error) => {
                        console.error("Error getting users:", error);
                        // Fallback to random users with skills if there's an error
                        db.collection("users")
                            .where(firebase.firestore.FieldPath.documentId(), '!=', currentUser.uid)
                            .limit(20)
                            .get()
                            .then((querySnapshot) => {
                                console.log("Fallback random users:", querySnapshot.docs.length);
                                const userPromises = querySnapshot.docs.map(doc =>
                                    db.collection("userSkills")
                                        .where("userID", "==", doc.id)
                                        .get()
                                        .then(skillsSnapshot => {
                                            const skills = {
                                                offering: [],
                                                requesting: []
                                            };
                                            skillsSnapshot.forEach(skillDoc => {
                                                const data = skillDoc.data();
                                                if (data.direction === "Offering") {
                                                    skills.offering.push(data.skill);
                                                } else if (data.direction === "Requesting") {
                                                    skills.requesting.push(data.skill);
                                                }
                                            });
                                            return {
                                                id: doc.id,
                                                ...doc.data(),
                                                skills
                                            };
                                        })
                                );
                                Promise.all(userPromises)
                                    .then(users => {
                                        console.log("Fallback users before filtering:", users.map(u => ({ id: u.id, email: u.email })));
                                        // Filter out users with no skills and exclude current user
                                        const usersWithSkills = users.filter(user => {
                                            const isNotCurrentUser = user.id !== currentUser.uid && user.email !== currentUser.email;
                                            const hasMultipleSkills = (user.skills.offering.length > 1 || user.skills.requesting.length > 1);
                                            console.log(`Fallback user ${user.email}: isNotCurrentUser=${isNotCurrentUser}, hasMultipleSkills=${hasMultipleSkills}`);
                                            return isNotCurrentUser && hasMultipleSkills;
                                        });
                                        console.log("Fallback users after filtering:", usersWithSkills.map(u => ({ id: u.id, email: u.email })));
                                        displayRecommendedContacts(usersWithSkills.slice(0, 3));
                                    });
                            });
                    });
            }
        })
        .catch((error) => {
            console.error("Error getting current user:", error);
            // Fallback to random users with skills if there's an error
            db.collection("users")
                .where(firebase.firestore.FieldPath.documentId(), '!=', currentUser.uid)
                .limit(20)
                .get()
                .then((querySnapshot) => {
                    console.log("Error fallback random users:", querySnapshot.docs.length);
                    const userPromises = querySnapshot.docs.map(doc =>
                        db.collection("userSkills")
                            .where("userID", "==", doc.id)
                            .get()
                            .then(skillsSnapshot => {
                                const skills = {
                                    offering: [],
                                    requesting: []
                                };
                                skillsSnapshot.forEach(skillDoc => {
                                    const data = skillDoc.data();
                                    if (data.direction === "Offering") {
                                        skills.offering.push(data.skill);
                                    } else if (data.direction === "Requesting") {
                                        skills.requesting.push(data.skill);
                                    }
                                });
                                return {
                                    id: doc.id,
                                    ...doc.data(),
                                    skills
                                };
                            })
                    );
                    Promise.all(userPromises)
                        .then(users => {
                            console.log("Error fallback users before filtering:", users.map(u => ({ id: u.id, email: u.email })));
                            // Filter out users with no skills and exclude current user
                            const usersWithSkills = users.filter(user => {
                                const isNotCurrentUser = user.id !== currentUser.uid && user.email !== currentUser.email;
                                const hasMultipleSkills = (user.skills.offering.length > 1 || user.skills.requesting.length > 1);
                                console.log(`Error fallback user ${user.email}: isNotCurrentUser=${isNotCurrentUser}, hasMultipleSkills=${hasMultipleSkills}`);
                                return isNotCurrentUser && hasMultipleSkills;
                            });
                            console.log("Error fallback users after filtering:", usersWithSkills.map(u => ({ id: u.id, email: u.email })));
                            displayRecommendedContacts(usersWithSkills.slice(0, 3));
                        });
                });
        });
}

// Function to calculate match score
function calculateMatchScore(userSkills, currentUserSkills) {
    let score = 0;
    for (const skill of userSkills.offering) {
        if (currentUserSkills.includes(skill)) {
            score += 2;
        }
    }
    for (const skill of userSkills.requesting) {
        if (currentUserSkills.includes(skill)) {
            score += 2;
        }
    }
    return score;
}

// Function to get user's skills and show relevant categories
function loadUserCategories() {
    const categoriesContainer = document.getElementById('categories-container');

    // Get current user
    const user = firebase.auth().currentUser;

    // Define all available categories with their images
    const allCategories = {
        'Electronics': 'electronics.jpg',
        'Art & Design': 'art.jpg',
        'Music': 'music.jpg',
        'Gaming': 'gaming.jpg',
        'Languages': 'languages.jpg',
        'Sports': 'sports.jpg',
        'Trades': 'trades.jpg'
    };

    if (user) {
        // User is logged in, get their skills
        db.collection("users").doc(user.uid).get()
            .then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    const skillsLookingFor = userData.skillsLookingFor || [];
                    console.log("User skills:", skillsLookingFor); // Debug log

                    // Filter categories based on user's skills
                    const relevantCategories = Object.entries(allCategories).filter(([category]) => {
                        // Convert category to lowercase for case-insensitive matching
                        const categoryLower = category.toLowerCase();
                        return skillsLookingFor.some(skill => {
                            const skillLower = skill.toLowerCase();
                            // Check if the skill is related to the category
                            return categoryLower.includes(skillLower) ||
                                skillLower.includes(categoryLower) ||
                                // Add specific skill-category mappings
                                (categoryLower === 'languages' && ['french', 'spanish', 'german', 'english', 'language', 'languages'].includes(skillLower)) ||
                                (categoryLower === 'electronics' && ['electronics', 'computer', 'laptop', 'phone', 'gadget'].includes(skillLower)) ||
                                (categoryLower === 'art & design' && ['art', 'design', 'drawing', 'painting', 'graphic design'].includes(skillLower)) ||
                                (categoryLower === 'music' && ['music', 'guitar', 'piano', 'singing', 'instrument'].includes(skillLower)) ||
                                (categoryLower === 'gaming' && ['gaming', 'game', 'gamer', 'console', 'pc gaming'].includes(skillLower)) ||
                                (categoryLower === 'sports' && ['sports', 'fitness', 'workout', 'exercise', 'athletic'].includes(skillLower)) ||
                                (categoryLower === 'trades' && ['trades', 'construction', 'plumbing', 'electrical', 'carpentry'].includes(skillLower));
                        });
                    });

                    console.log("Relevant categories:", relevantCategories.map(([cat]) => cat)); // Debug log

                    let categoriesToShow;
                    if (relevantCategories.length === 0) {
                        // No relevant categories found or less than 3, show random categories
                        categoriesToShow = getRandomCategories(Object.entries(allCategories), 3);
                    } else {
                        // Sort relevant categories by relevance (most relevant first)
                        categoriesToShow = relevantCategories
                            .sort((a, b) => {
                                const aRelevance = skillsLookingFor.filter(skill =>
                                    a[0].toLowerCase().includes(skill.toLowerCase()) ||
                                    skill.toLowerCase().includes(a[0].toLowerCase())
                                ).length;
                                const bRelevance = skillsLookingFor.filter(skill =>
                                    b[0].toLowerCase().includes(skill.toLowerCase()) ||
                                    skill.toLowerCase().includes(b[0].toLowerCase())
                                ).length;
                                return bRelevance - aRelevance;
                            })
                            .slice(0, 3);
                    }

                    displayCategories(categoriesToShow);
                }
            })
            .catch((error) => {
                console.error("Error getting user data:", error);
                displayCategories(getRandomCategories(Object.entries(allCategories), 3));
            });
    } else {
        // No user logged in, show 3 random categories
        displayCategories(getRandomCategories(Object.entries(allCategories), 3));
    }
}

// Function to display categories
function displayCategories(categories) {
    const categoriesContainer = document.getElementById('categories-container');

    // Clear existing content
    categoriesContainer.innerHTML = '';

    // Add category cards
    categories.forEach(([category, image]) => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-[1.02] cursor-pointer';
        categoryCard.onclick = () => window.location.href = `filter.html?category=${encodeURIComponent(category)}`;
        categoryCard.innerHTML = `
            <img src="images/${image}" alt="${category}" class="w-full h-48 object-cover">
            <div class="p-4">
                <h3 class="font-semibold text-lg mb-2">${category}</h3>
                <p class="text-gray-600">Explore ${category.toLowerCase()} related skills and services.</p>
                <a href="filter.html?category=${encodeURIComponent(category)}" 
                   class="text-polynesian_blue hover:text-ruddy_blue inline-block mt-2"
                   onclick="event.stopPropagation()">
                    Explore ${category} →
                </a>
            </div>
        `;
        categoriesContainer.appendChild(categoryCard);
    });
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', function () {
    loadUserCategories();
    // Wait for auth state to be ready before loading recommended contacts
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            console.log("Auth state changed - User is signed in:", user.uid);
            loadRecommendedContacts();
        } else {
            console.log("Auth state changed - No user is signed in");
            loadRecommendedContacts(); // Still load contacts for non-logged in users
        }
    });
}); 