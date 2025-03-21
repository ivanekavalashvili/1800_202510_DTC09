example_dictionary = {
    "Electronics": ["Software Development", "Hardware Development"],
    "Art": ["Traditional art", "Digital art", "Pottery"],
    "Trades": ["Machenery", "Carpentry", "Plumbing"],
    "Languages": ["English", "Mandarin Chinese", "Spanish", "Hindi", "Portuguese", "Bengali", "Russian", "Japanese", "Punjabi", "Vietnamese", "Cantonese", "Korean", "French", "German",],
    "Music": ["Producing", "Piano", "Guitar", "Violin", "Drums"]
};

function add_skills_to_database() {
    for (skill in example_dictionary.Art) {
        db.collection("skills").add({
            categoryName: "Art",
            skill: example_dictionary.Art[skill]
        })
    }
}

function list_categories_from_database(collection, user) {
    let sectionTemplate = document.getElementById("skillSectionTemplate");
    console.log(sectionTemplate)
    db.collection(collection).get()
        .then(allCategories => {
            document.getElementById("category-go-here").innerHTML = ""
            document.getElementById("sections").innerHTML = ""
            allCategories.forEach(category => {
                var currentCategory = category.data().category;
                let newcategory = sectionTemplate.content.cloneNode(true);
                newcategory.querySelector('.categoryTitle').innerHTML = currentCategory;
                document.getElementById("category-go-here").appendChild(newcategory);
                $("#sections").append(`
                <div class="bg-white rounded-lg shadow p-6">
                    <h1 class="hover:bg-gray-50 p-2 rounded font-semibold transition"><a href="#">${currentCategory}</a></h1>
                    <div class="flex items-center space-x-4">
                        <div class="flex pt-4 border-t flex-wrap" id="${currentCategory}">
                        </div>
                    </div>
                </div>
                `)

                db.collection("skills").get()
                    .then(allSkills => {
                        allSkills.forEach(skill => {
                            var currentSkill = skill.data().skill;
                            var skillCategory = skill.data().categoryName
                            if (skillCategory == currentCategory) {
                                $("#" + currentCategory).append(`
                                <button id="${currentSkill}"
                                    class="bg-uranian_blue text-oxford_blue px-8 py-3 rounded-full font-semibold 
                                    hover:bg-ruddy_blue hover:text-yale_blue transition duration-300 my-3 mr-3">
                                    ${currentSkill}
                                </button>
                                `)
                                db.collection("userSkills")
                                    .get()
                                    .then(allUserSkills => {
                                        allUserSkills.forEach(userSkill => {
                                            if (userSkill.data().userID == user.uid && userSkill.data().skill == currentSkill && userSkill.data().direction == direction) {
                                                document.getElementById(currentSkill).classList = "selected text-uranian_blue bg-oxford_blue px-8 py-3 rounded-full font-semibold hover:bg-ruddy_blue hover:text-yale_blue transition duration-300 my-3 mr-3"
                                                selected = true
                                            }
                                        })
                                    })
                                document.getElementById(currentSkill).addEventListener("click", () => {
                                    if (document.getElementById(currentSkill).classList == "selected text-uranian_blue bg-oxford_blue px-8 py-3 rounded-full font-semibold hover:bg-ruddy_blue hover:text-yale_blue transition duration-300 my-3 mr-3") {
                                    db.collection("userSkills")
                                        .get()
                                        .then(allUserSkills => {
                                            allUserSkills.forEach(userSkill => {
                                                console.log(userSkill.id)
                                                if (userSkill.data().userID == user.uid && userSkill.data().skill == currentSkill && userSkill.data().direction == direction) {
                                                    deleteThing = db.collection("userSkills").doc(userSkill.id).delete();
                                                    document.getElementById(currentSkill).classList = "bg-uranian_blue text-oxford_blue px-8 py-3 rounded-full font-semibold hover:bg-ruddy_blue hover:text-yale_blue transition duration-300 my-3 mr-3"
                                                }
                                            })
                                        })
                                    }
                                    else {
                                        db.collection("userSkills").add({
                                                proficency: "beginner",
                                                userID: user.uid,
                                                skill: currentSkill,
                                                direction: direction
                                            })
                                            document.getElementById(currentSkill).classList = "selected text-uranian_blue bg-oxford_blue px-8 py-3 rounded-full font-semibold hover:bg-ruddy_blue hover:text-yale_blue transition duration-300 my-3 mr-3"
                                        
                                    }
                                })
                            }
                        })
                    })
            })
        })
}



auth.onAuthStateChanged(user => {
    if (user) {
        direction = "Offering"
        document.getElementById("offerBtn").classList = "text-uranian_blue bg-oxford_blue px-8 py-3 rounded-l-full font-semibold hover:bg-ruddy_blue hover:text-yale_blue transition duration-300 my-3"
        list_categories_from_database("Categories", user, direction)
        document.getElementById("toggleBtn").addEventListener("click", () => {
            if (direction == "Offering") {
                direction = "Requesting"
                document.getElementById("offerBtn").classList = "bg-uranian_blue text-oxford_blue px-8 py-3 rounded-l-full font-semibold hover:bg-ruddy_blue hover:text-yale_blue transition duration-300 my-3"
                document.getElementById("requestBtn").classList = "text-uranian_blue bg-oxford_blue px-8 py-3 rounded-r-full font-semibold hover:bg-ruddy_blue hover:text-yale_blue transition duration-300 my-3 mr-3"
                list_categories_from_database("Categories", user, direction)
                document.getElementById("title").innerHTML = "What skills would you like to Request?"
            }
            else {
                direction = "Offering"
                document.getElementById("offerBtn").classList = "text-uranian_blue bg-oxford_blue px-8 py-3 rounded-l-full font-semibold hover:bg-ruddy_blue hover:text-yale_blue transition duration-300 my-3"
                document.getElementById("requestBtn").classList = "bg-uranian_blue text-oxford_blue px-8 py-3 rounded-r-full font-semibold hover:bg-ruddy_blue hover:text-yale_blue transition duration-300 my-3 mr-3"
                list_categories_from_database("Categories", user, direction)
                document.getElementById("title").innerHTML = "What skills are you willing to Offer?"
            }
        })
    }
})




// function list_categories() {
//     for (key in Object.keys(example_dictionary)) {
//         $("#sections").append(`
//             <div class="bg-white rounded-lg shadow p-6">
//                 <h1 class="hover:bg-gray-50 p-2 rounded font-semibold transition"><a href="#">${Object.keys(example_dictionary)[key]}</a></h1>
//                 <div class="flex items-center space-x-4">
//                     <div class="flex pt-4 border-t flex-wrap" id="${Object.keys(example_dictionary)[key]}">
//                     </div>
//                 </div>
//             </div>
//         `)
//         console.log(Object.keys(example_dictionary)[key])
//         let unwrapped_array = example_dictionary[Object.keys(example_dictionary)[key]]

//         for (item in unwrapped_array) {
//             $("#" + Object.keys(example_dictionary)[key]).append(`
//                 <button
//                     class="bg-uranian_blue text-oxford_blue px-8 py-3 rounded-full font-semibold hover:bg-ruddy_blue hover:text-yale_blue transition duration-300 my-3 mr-3">
//                     ${unwrapped_array[item]}
//                 </button>
//                 `)
//         }
//     }
// }

