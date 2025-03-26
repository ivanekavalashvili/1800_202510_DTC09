// Get DOM elements
const searchResults = document.getElementById('search-results');
const loadingState = document.getElementById('loading-state');
const noResults = document.getElementById('no-results');

// Current user's skills for matching
let currentUserSkills = {
    offering: [],
    requesting: []
};

// Handle search term from URL when page loads
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('q');
    if (searchTerm) {
        performSearch(searchTerm);
    }
});

// Load current user's skills when authenticated
auth.onAuthStateChanged(user => {
    if (user) {
        loadCurrentUserSkills(user.uid);
    }
});

// Load current user's skills from database
async function loadCurrentUserSkills(userId) {
    try {
        const userSkillsSnapshot = await db.collection('userSkills')
            .where('userID', '==', userId)
            .get();

        userSkillsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.direction === 'Offering') {
                currentUserSkills.offering.push(data.skill);
            } else if (data.direction === 'Requesting') {
                currentUserSkills.requesting.push(data.skill);
            }
        });
    } catch (error) {
        console.error("Error loading user skills:", error);
    }
}

// Main search function
async function performSearch(searchTerm) {
    if (!searchTerm) return;

    // Show loading state
    searchResults.innerHTML = '';
    loadingState.classList.remove('hidden');
    noResults.classList.add('hidden');

    try {
        // Find users with matching skills
        const matchingUsers = await findUsersWithSkill(searchTerm);

        // Hide loading state
        loadingState.classList.add('hidden');

        if (matchingUsers.length === 0) {
            noResults.classList.remove('hidden');
            return;
        }

        // Display results
        displaySearchResults(matchingUsers);
    } catch (error) {
        console.error("Error performing search:", error);
        loadingState.classList.add('hidden');
        // Could add error state UI here
    }
}

// Find users with matching skills
async function findUsersWithSkill(searchTerm) {
    const results = [];
    const processedUsers = new Set(); // To avoid duplicates

    try {
        // Get all skills that match the search term
        const skillsSnapshot = await db.collection('skills')
            .get();

        const matchingSkills = skillsSnapshot.docs
            .filter(doc => doc.data().skill.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(doc => doc.data().skill);

        // Find users with these skills
        for (const skill of matchingSkills) {
            const userSkillsSnapshot = await db.collection('userSkills')
                .where('skill', '==', skill)
                .get();

            for (const userSkill of userSkillsSnapshot.docs) {
                const userId = userSkill.data().userID;

                // Skip if we've already processed this user
                if (processedUsers.has(userId)) continue;
                processedUsers.add(userId);

                // Get user details
                const userDoc = await db.collection('users').doc(userId).get();
                if (!userDoc.exists) continue;

                // Get all skills for this user
                const userSkillsSnapshot = await db.collection('userSkills')
                    .where('userID', '==', userId)
                    .get();

                const userSkills = {
                    offering: [],
                    requesting: []
                };

                userSkillsSnapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.direction === 'Offering') {
                        userSkills.offering.push(data.skill);
                    } else if (data.direction === 'Requesting') {
                        userSkills.requesting.push(data.skill);
                    }
                });

                // Calculate match score
                const matchScore = calculateMatchScore(userSkills);

                results.push({
                    id: userId,
                    ...userDoc.data(),
                    skills: userSkills,
                    matchScore
                });
            }
        }

        // Sort results by match score
        return results.sort((a, b) => b.matchScore - a.matchScore);
    } catch (error) {
        console.error("Error finding users:", error);
        return [];
    }
}

// Calculate match score based on skill overlap
function calculateMatchScore(userSkills) {
    let score = 0;

    // Points for skills they offer that we want
    for (const skill of userSkills.offering) {
        if (currentUserSkills.requesting.includes(skill)) {
            score += 2; // Higher weight for direct matches
        }
    }

    // Points for skills they want that we offer
    for (const skill of userSkills.requesting) {
        if (currentUserSkills.offering.includes(skill)) {
            score += 2; // Higher weight for direct matches
        }
    }

    return score;
}

// Display search results in the UI
function displaySearchResults(users) {
    searchResults.innerHTML = '';

    users.forEach(user => {
        const userCard = document.createElement('div');
        userCard.className = 'bg-white rounded-lg shadow-md overflow-hidden';

        const matchLabel = user.matchScore > 0
            ? `<span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">Strong Match</span>`
            : '';

        userCard.innerHTML = `
            <a href="profile.html?docID=${user.id}" class="block hover:opacity-90 transition-opacity">
                <img src="images/Blank_pfp.png" alt="Profile" class="w-full h-48 object-cover">
            </a>
            <div class="p-4">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-semibold text-lg">${user.email}</h3>
                    ${matchLabel}
                </div>
                
                ${user.about_me ? `<p class="text-gray-600 mb-4">${user.about_me}</p>` : ''}
                
                ${user.skills.offering.length > 0 ? `
                    <div class="mb-3">
                        <h4 class="font-medium text-sm text-gray-500 mb-1">Offering:</h4>
                        <div class="flex flex-wrap gap-1">
                            ${user.skills.offering.map(skill => `
                                <span class="bg-uranian_blue text-oxford_blue px-2 py-1 rounded-full text-sm">${skill}</span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${user.skills.requesting.length > 0 ? `
                    <div class="mb-3">
                        <h4 class="font-medium text-sm text-gray-500 mb-1">Looking for:</h4>
                        <div class="flex flex-wrap gap-1">
                            ${user.skills.requesting.map(skill => `
                                <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">${skill}</span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <a href="profile.html?docID=${user.id}" 
                   class="block text-center bg-polynesian_blue text-white px-4 py-2 rounded-full hover:bg-ruddy_blue transition duration-300 mt-4">
                    View Profile
                </a>
            </div>
        `;

        searchResults.appendChild(userCard);
    });
} 