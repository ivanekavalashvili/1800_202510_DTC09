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
                                console.log(currentSkill)
                                $("#" + currentCategory).append(`
                                <button id="${currentSkill}"
                                    class="bg-uranian_blue text-oxford_blue px-8 py-3 rounded-full font-semibold 
                                    hover:bg-ruddy_blue hover:text-yale_blue transition duration-300 my-3 mr-3">
                                    ${currentSkill}
                                </button>
                                `)
                                document.getElementById(currentSkill).addEventListener("click", () => {
                                    db.collection("userSkills").add({
                                        proficency: "beginner",
                                        userID: user.uid,
                                        skill: currentSkill
                                    })

                                })
                            }
                        })
                    })
            })
        })
}

auth.onAuthStateChanged(user => {
    if (user) {list_categories_from_database("Categories", user)}})




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

