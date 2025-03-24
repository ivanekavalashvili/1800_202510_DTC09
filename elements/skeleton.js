function loadElement(elementId, filePath) {
    fetch(filePath)
        .then(response => response.text())
        .then(text => document.getElementById(elementId).innerHTML = text);
}

function loadChatPopup() {
    // Create chat popup elements
    const chatIcon = document.createElement('div');
    chatIcon.id = 'chat-icon';
    chatIcon.setAttribute('onclick', 'toggleChat()');
    chatIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
                d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
                clip-rule="evenodd" />
        </svg>
    `;

    const chatContainer = document.createElement('div');
    chatContainer.id = 'chat-popup-container';

    // Add the elements to the body
    document.body.appendChild(chatIcon);
    document.body.appendChild(chatContainer);

    // Load chat content into the container
    fetch('elements/chat-content.html')
        .then(response => response.text())
        .then(html => {
            chatContainer.innerHTML = html;

            // Create a function to check if the DOM elements are loaded
            const checkElementsLoaded = () => {
                const messageInput = document.getElementById('message-input');
                if (messageInput) {
                    // Load chat.js only after elements are confirmed to exist
                    const script = document.createElement('script');
                    script.src = 'scripts/chat.js';
                    document.body.appendChild(script);
                } else {
                    // If elements aren't loaded yet, try again in a short while
                    setTimeout(checkElementsLoaded, 100);
                }
            };

            // Start the checking process
            checkElementsLoaded();
        });

    // Add chat styles to head if not already present
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        #chat-popup-container {
            display: none;
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 400px;
            max-height: 80vh;
            background-color: white;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
            border-radius: 10px;
            overflow: hidden;
            z-index: 1000;
        }

        #chat-popup-container.active {
            display: block;
        }

        #chat-icon {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background-color: #00498A;
            color: white;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            z-index: 1001;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
        }

        #chat-icon:hover {
            background-color: #003567;
        }
        
        #contacts-list .contact-item:hover {
            background-color: #f3f4f6;
        }
        
        #back-to-contacts {
            cursor: pointer;
        }
    `;
    document.head.appendChild(styleElement);

    // Add toggle function with additional handling for chat initialization
    window.toggleChat = function () {
        const container = document.getElementById('chat-popup-container');
        container.classList.toggle('active');

        // Trigger a custom event when chat becomes visible
        if (container.classList.contains('active')) {
            const chatEvent = new Event('chatVisible');
            document.dispatchEvent(chatEvent);
        }
    };
}

// Load navbar and footer
loadElement('navbar', 'elements/navbar.html');
loadElement('footer', 'elements/footer.html');

// Load chat popup after page content is loaded
document.addEventListener('DOMContentLoaded', function () {
    loadChatPopup();
});