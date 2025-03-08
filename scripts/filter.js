example_dictionary = {
    "📱 Electronics": ["Software Development", "Hardware Development"],
    "🎨 Art & Design": ["Traditional art", "Digital art", "Pottery"],
    "🔧 Trades": ["Machenery", "Carpentry", "etc"],
    "🗣️ Languages": ["English", "Mandarin Chinese", "Spanish", "Hindi", "Portuguese", "Bengali", "Russian", "Japanese", "Punjabi", "Vietnamese", "Cantonese", "Korean", "French", "German",],
    "🎵 Music": ["Producing", "Piano", "Guitar", "Violin", "Drums"]
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
                    <div class="flex space-x-4 pt-4 border-t">
                    </div>
                </div>
            </div>
                    `)
    }
}

list_categories()