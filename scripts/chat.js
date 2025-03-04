// Import color scheming from tailwind config
tailwind.config = {
    theme: {
        extend: {
            colors: {
                yale_blue: '#003567',
                oxford_blue: '#00264C',
                polynesian_blue: '#00498A',
                ruddy_blue: '#72A4DD',
                uranian_blue: '#B2D5FF'
            }
        }
    }
}


const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};


firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const authStatus = document.getElementById('auth-status');
const loginMessage = document.getElementById('login-message');
const loginBtn = document.getElementById('login-btn');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messagesContainer = document.getElementById('messages');
const chatUserName = document.getElementById('chat-user-name');
const chatUserAvatar = document.getElementById('chat-user-avatar');
const chatStatus = document.getElementById('chat-status');

auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in
        loginMessage.textContent = `Signed in as ${user.displayName || user.email}`;
        loginBtn.classList.add('hidden');
        messageInput.disabled = false;
        messageForm.querySelector('button').disabled = false;
        chatUserName.textContent = user.displayName || 'Chat';
        chatStatus.textContent = 'Online';
        if (user.photoURL) {
            chatUserAvatar.src = user.photoURL;
        }

        // Load messages
        loadMessages();
    } else {
        // User is not signed in
        loginMessage.textContent = 'Please sign in to chat';
        loginBtn.classList.remove('hidden');
        messageInput.disabled = true;
        messageForm.querySelector('button').disabled = true;
        chatStatus.textContent = 'Please login to chat';
        chatUserAvatar.src = 'images/Blank_pfp.png';
    }
});

loginBtn.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
});

messageForm.addEventListener('submit', e => {
    e.preventDefault();

    const message = messageInput.value.trim();
    if (!message) return;

    const user = auth.currentUser;
    if (!user) return;

    db.collection('messages').add({
        text: message,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhoto: user.photoURL || '',
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
        .then(() => {
            messageInput.value = '';
        })
        .catch(error => {
            console.error("Error sending message: ", error);
            alert("Error sending message. Please try again.");
        });
});

function loadMessages() {
    // Listen for new messages
    db.collection('messages')
        .orderBy('timestamp', 'asc')
        .limit(50)
        .onSnapshot(snapshot => {
            messagesContainer.innerHTML = '';

            if (snapshot.empty) {
                const emptyMessage = document.createElement('div');
                emptyMessage.className = 'flex justify-center';
                emptyMessage.innerHTML = '<p class="text-gray-500">No messages yet. Start the conversation!</p>';
                messagesContainer.appendChild(emptyMessage);
                return;
            }


            snapshot.forEach(doc => {
                const message = doc.data();
                const messageElement = createMessageElement(message);
                messagesContainer.appendChild(messageElement);
            });

            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, error => {
            console.error("Error loading messages: ", error);
        });
}


function createMessageElement(message) {
    const currentUser = auth.currentUser;
    const isOwnMessage = currentUser && message.userId === currentUser.uid;

    const messageDiv = document.createElement('div');
    messageDiv.className = isOwnMessage
        ? 'flex justify-end'
        : 'flex justify-start';

    const messageContent = document.createElement('div');
    messageContent.className = isOwnMessage
        ? 'bg-polynesian_blue text-white rounded-lg py-2 px-4 max-w-xs break-words'
        : 'bg-gray-200 rounded-lg py-2 px-4 max-w-xs break-words';

    const textElement = document.createElement('p');
    textElement.textContent = message.text;
    messageContent.appendChild(textElement);

    if (!isOwnMessage) {
        const nameElement = document.createElement('p');
        nameElement.className = 'text-xs text-gray-500 mt-1';
        nameElement.textContent = message.userName || 'Anonymous';
        messageContent.appendChild(nameElement);
    }

    const flexContainer = document.createElement('div');
    flexContainer.className = 'flex items-end space-x-2';

    if (!isOwnMessage) {
        const avatar = document.createElement('img');
        avatar.src = message.userPhoto || 'images/Blank_pfp.png';
        avatar.alt = 'Avatar';
        avatar.className = 'w-8 h-8 rounded-full';
        flexContainer.appendChild(avatar);
    }

    flexContainer.appendChild(messageContent);
    messageDiv.appendChild(flexContainer);

    return messageDiv;
}