example_dictionary = {
    "Electronics": ["Software Development", "Hardware Development"],
    "Art": ["Traditional art", "Digital art", "Pottery"],
    "Trades": ["Machenery", "Carpentry", "etc"],
    "Languages": ["English", "Mandarin Chinese", "Spanish", "Hindi", "Portuguese", "Bengali", "Russian", "Japanese", "Punjabi", "Vietnamese", "Cantonese", "Korean", "French", "German",],
    "Music": ["Producing", "Piano", "Guitar", "Violin", "Drums"]
};

function list_categories() {
    for (key in Object.keys(example_dictionary)) {
        $("#Categories").append(`
            <li class="hover:bg-gray-50 p-2 rounded transition" > <a href="#">${Object.keys(example_dictionary)[key]}</a></li>
            `)
    }
    for (key in Object.keys(example_dictionary)) {
        $("#sections").append(`
            <div class="bg-white rounded-lg shadow p-6">
                <h1 class="hover:bg-gray-50 p-2 rounded font-semibold transition"><a href="#">${Object.keys(example_dictionary)[key]}</a></h1>
                <div class="flex items-center space-x-4">
                    <div class="flex pt-4 border-t flex-wrap" id="${Object.keys(example_dictionary)[key]}">
                    </div>
                </div>
            </div>
        `)
        console.log(Object.keys(example_dictionary)[key])
        let unwrapped_array = example_dictionary[Object.keys(example_dictionary)[key]]
        
        for (item in unwrapped_array) {
            console.log(item)
            $("#" + Object.keys(example_dictionary)[key]).append(`
                <button
                    class="bg-uranian_blue text-oxford_blue px-8 py-3 rounded-full font-semibold hover:bg-ruddy_blue hover:text-yale_blue transition duration-300 my-3 mr-3">
                    ${unwrapped_array[item]}
                </button>
                `)
        }
    }
}

list_categories()