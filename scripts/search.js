const searchResults = document.getElementById('search-results');
const loadingState = document.getElementById('loading-state');
const noResults = document.getElementById('no-results');


let currentUserSkills = {
    offering: [],
    requesting: []
};


document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('q');
    if (searchTerm) {
        performSearch(searchTerm);
    }
});


auth.onAuthStateChanged(user => {
    if (user) {
        loadCurrentUserSkills(user.uid);
    }
});


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


async function performSearch(searchTerm) {
    if (!searchTerm) return;


    searchResults.innerHTML = '';
    loadingState.classList.remove('hidden');
    noResults.classList.add('hidden');

    try {

        const matchingUsers = await findUsersWithSkillOrCategory(searchTerm);


        loadingState.classList.add('hidden');

        if (matchingUsers.length === 0) {
            noResults.classList.remove('hidden');
            return;
        }


        displaySearchResults(matchingUsers);
    } catch (error) {
        console.error("Error performing search:", error);
        loadingState.classList.add('hidden');

    }
}


async function findUsersWithSkillOrCategory(searchTerm) {
    const results = [];
    const processedUsers = new Set();
    const searchTermLower = searchTerm.toLowerCase();

    try {
        const categoriesSnapshotPromise = db.collection('Categories').get();
        const skillsSnapshotPromise = db.collection('skills').get();

        const [categoriesData, skillsData] = await Promise.all([categoriesSnapshotPromise, skillsSnapshotPromise]);

        const matchingCategories = categoriesData.docs
            .filter(doc => doc.data().category.toLowerCase().includes(searchTermLower))
            .map(doc => doc.data().category);

        const matchingSkills = skillsData.docs
            .filter(doc => {
                const skillData = doc.data();
                return skillData.skill.toLowerCase().includes(searchTermLower) ||
                    (skillData.categoryName && matchingCategories.includes(skillData.categoryName));
            })
            .map(doc => doc.data().skill);

        const userSkillPromises = matchingSkills.map(skill =>
            db.collection('userSkills')
                .where('skill', '==', skill)
                .get()
        );

        const userSkillsSnapshots = await Promise.all(userSkillPromises);

        const userPromises = [];

        for (const userSkillsSnapshot of userSkillsSnapshots) {
            userSkillsSnapshot.docs.forEach(userSkill => {
                const userId = userSkill.data().userID;

                if (processedUsers.has(userId)) return;
                processedUsers.add(userId);

                const userDocPromise = db.collection('users').doc(userId).get();
                const userSkillsSnapshotPromise = db.collection('userSkills')
                    .where('userID', '==', userId)
                    .get();

                userPromises.push(
                    (async () => {
                        const [userDoc, userSkillsSnapshot] = await Promise.all([userDocPromise, userSkillsSnapshotPromise]);

                        if (!userDoc.exists) return null;

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

                        const matchScore = calculateMatchScore(userSkills);

                        return {
                            id: userId,
                            ...userDoc.data(),
                            skills: userSkills,
                            matchScore
                        };
                    })()
                );
            });
        }

        const users = await Promise.all(userPromises);
        const validUsers = users.filter(user => user !== null);

        results.push(...validUsers);

        return results.sort((a, b) => b.matchScore - a.matchScore);
    } catch (error) {
        console.error("Error finding users:", error);
        return [];
    }
}


function calculateMatchScore(userSkills) {
    let score = 0;


    for (const skill of userSkills.offering) {
        if (currentUserSkills.requesting.includes(skill)) {
            score += 2;
        }
    }


    for (const skill of userSkills.requesting) {
        if (currentUserSkills.offering.includes(skill)) {
            score += 2;
        }
    }

    return score;
}


function displaySearchResults(users) {
    searchResults.innerHTML = '';

    users.forEach(user => {
        const userCard = document.createElement('div');
        userCard.className = 'bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-[600px]';

        const matchLabel = user.matchScore > 0
            ? `<span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">Strong Match</span>`
            : '';

        userCard.innerHTML = `
            <a href="profile.html?docID=${user.id}" class="block hover:opacity-90 transition-opacity h-48 flex-shrink-0">
                <img src="${user.profilePicture || 'images/Blank_pfp.png'}" alt="Profile" 
                     class="w-full h-full object-cover">
            </a>
            <div class="p-4 flex flex-col flex-grow">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-semibold text-lg">${user.email}</h3>
                    ${matchLabel}
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

        searchResults.appendChild(userCard);
    });
}