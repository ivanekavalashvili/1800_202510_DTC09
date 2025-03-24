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
};


const authStatus = document.getElementById('auth-status');
const loginMessage = document.getElementById('login-message');
const loginBtn = document.getElementById('login-btn');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messagesContainer = document.getElementById('messages');
const chatUserName = document.getElementById('chat-user-name');
const chatUserAvatar = document.getElementById('chat-user-avatar');
const chatStatus = document.getElementById('chat-status');
const contactsContainer = document.getElementById('contacts-container');
const contactsList = document.getElementById('contacts-list');
const messagesContainerWrapper = document.getElementById('messages-container');
const backToContactsBtn = document.getElementById('back-to-contacts');


let currentConversationId = null;
let currentContactId = null;
let unsubscribeMessages = null;


auth.onAuthStateChanged(user => {
    if (user) {

        loginMessage.textContent = `Signed in as ${user.displayName || user.email}`;
        loginBtn.classList.add('hidden');
        chatUserName.textContent = user.displayName || user.email || 'Chat';
        chatStatus.textContent = 'Online';
        if (user.photoURL) {
            chatUserAvatar.src = user.photoURL;
        }


        loadContacts();


        showContactsView();
    } else {

        loginMessage.textContent = 'Please sign in to chat';
        loginBtn.classList.remove('hidden');
        messageInput.disabled = true;
        messageForm.querySelector('button').disabled = true;
        chatStatus.textContent = 'Please login to chat';
        chatUserAvatar.src = 'images/Blank_pfp.png';
    }
});


loginBtn.addEventListener('click', () => {

    window.location.href = 'login.html';
});


// Re-implemented messaging feature:
messageForm.addEventListener('submit', e => {
    e.preventDefault();
    const msg = messageInput.value.trim();
    if (!msg) return;
    if (!currentConversationId) {
        alert("No conversation selected.");
        return;
    }
    const user = auth.currentUser;
    if (!user) return;
    // Disable while sending
    messageInput.disabled = true;
    messageForm.querySelector('button').disabled = true;

    const convRef = db.collection('conversations').doc(currentConversationId);
    convRef.get()
        .then(doc => {
            // { changed code }
            if (!doc.exists) {
                // Create conversation doc & add a welcome message (optional)
                return convRef.set({
                    participants: [user.uid, currentContactId],
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastMessage: firebase.firestore.FieldValue.serverTimestamp()
                }).then(() => {
                    return convRef.collection('messages').add({
                        text: "Conversation started.",
                        senderId: "system",
                        senderName: "System",
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    });
                });
            } else {
                return Promise.resolve();
            }
            // { changed code }
        })
        .then(() => {
            return convRef.collection('messages').add({
                text: msg,
                senderId: user.uid,
                senderName: user.displayName || user.email || 'Anonymous',
                senderPhoto: user.photoURL || '',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            return convRef.update({
                lastMessage: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            messageInput.value = '';
            messageInput.disabled = false;
            messageForm.querySelector('button').disabled = false;
            messageInput.focus();
        })
        .catch(error => {
            console.error("Error sending message:", error);
            alert("Error sending message: " + error.message);
            messageInput.disabled = false;
            messageForm.querySelector('button').disabled = false;
        });
});


function loadContacts() {
    const user = auth.currentUser;
    if (!user) return;

    // Clear existing contacts and show loading state
    contactsList.innerHTML = `
        <div id="contacts-loading" class="flex justify-center p-4">
            <p class="text-gray-500">Loading contacts...</p>
        </div>
    `;

    console.log("Loading contacts for user:", user.uid);

    // Make contacts container visible and ensure it has proper styling
    contactsContainer.classList.remove('hidden');
    contactsContainer.style.display = 'block';

    // First try without ordering to avoid index error
    db.collection('contacts')
        .where('userId', '==', user.uid)
        .get()
        .then(snapshot => {
            console.log("Contact query completed, found:", snapshot.size, "contacts");

            // Remove loading indicator
            const loadingElement = document.getElementById('contacts-loading');
            if (loadingElement) {
                loadingElement.remove();
            }

            if (snapshot.empty) {
                contactsList.innerHTML = `
                    <div class="flex justify-center p-4">
                        <p class="text-gray-500">No contacts yet. Add contacts from user profiles!</p>
                    </div>
                `;
                return;
            }

            // Clear contacts list first
            contactsList.innerHTML = '';

            // Process contacts and sort them client-side
            const contacts = [];
            snapshot.forEach(doc => {
                contacts.push(doc.data());
            });

            // Sort by timestamp if available (newest first)
            contacts.sort((a, b) => {
                if (!a.timestamp) return 1;
                if (!b.timestamp) return -1;
                return b.timestamp.seconds - a.timestamp.seconds;
            });

            // Render sorted contacts
            contacts.forEach(contact => {
                const contactId = contact.contactId;
                console.log("Processing contact:", contactId, contact);
                const contactElement = createContactElement(contact);
                contactsList.appendChild(contactElement);
            });

            // Set up real-time listener for new contacts (without ordering)
            setupSimpleContactsListener(user.uid);
        })
        .catch(error => {
            console.error("Error loading contacts:", error);
            contactsList.innerHTML = `
                <div class="flex justify-center p-4">
                    <p class="text-red-500">Error loading contacts: ${error.message}</p>
                    <p class="text-gray-600 mt-2">If this is an index error, please create the required index using the link in the console.</p>
                    <button onclick="loadContacts()" class="mt-2 bg-polynesian_blue text-white px-3 py-1 rounded">
                        Retry
                    </button>
                </div>
            `;
        });
}

// Simpler listener without ordering requirement
function setupSimpleContactsListener(userId) {
    db.collection('contacts')
        .where('userId', '==', userId)
        .onSnapshot(snapshot => {
            // Only update for new contacts
            snapshot.docChanges().forEach(change => {
                if (change.type === "added") {
                    const contact = change.doc.data();
                    const contactId = contact.contactId;

                    // Check if this contact is already in the list
                    const existingContact = document.querySelector(`[data-contact-id="${contactId}"]`);
                    if (!existingContact) {
                        const contactElement = createContactElement(contact);
                        contactsList.prepend(contactElement); // Add new contacts at the top
                    }
                }
            });
        }, error => {
            console.error("Error in contacts listener:", error);
        });
}

function createContactElement(contact) {
    // Validate contact data
    if (!contact || !contact.contactId) {
        console.error("Invalid contact data:", contact);
        return document.createElement('div'); // Return empty div to avoid errors
    }

    // Create a completely navigation-free contact element
    const contactDiv = document.createElement('div');
    contactDiv.className = 'flex items-center p-3 border-b hover:bg-gray-100 cursor-pointer';
    contactDiv.setAttribute('data-contact-id', contact.contactId);
    contactDiv.dataset.contactName = contact.contactName || 'User';
    contactDiv.dataset.contactId = contact.contactId;

    // Create the inner content manually to avoid any potential navigation issues
    const innerContent = document.createElement('div');
    innerContent.className = 'flex items-center w-full';

    const img = document.createElement('img');
    img.src = 'images/Blank_pfp.png';
    img.alt = 'Contact Avatar';
    img.className = 'w-10 h-10 rounded-full mr-3';

    const textDiv = document.createElement('div');
    textDiv.className = 'flex-grow';

    const name = document.createElement('h3');
    name.className = 'font-medium text-polynesian_blue';
    name.textContent = contact.contactName || 'User';

    const subtext = document.createElement('p');
    subtext.className = 'text-xs text-gray-500';
    subtext.textContent = 'Click to chat';

    // Assemble the DOM structure
    textDiv.appendChild(name);
    textDiv.appendChild(subtext);
    innerContent.appendChild(img);
    innerContent.appendChild(textDiv);
    contactDiv.appendChild(innerContent);

    // Add a robust click handler
    const clickHandler = function (e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        console.log("Contact clicked:", contact.contactId, contact.contactName);

        // Force chat view to appear immediately
        contactsContainer.style.display = 'none';
        messagesContainerWrapper.style.display = 'block';
        backToContactsBtn.classList.remove('hidden');

        // Now call select contact
        selectContact(contact.contactId, contact.contactName);
        return false;
    };

    // Ensure the click handler is attached to all elements
    contactDiv.addEventListener('click', clickHandler);

    return contactDiv;
}

function selectContact(contactId, contactName) {
    if (!contactId) {
        console.error("Invalid contact ID:", contactId);
        return;
    }

    console.log("Selecting contact:", contactId, contactName);
    currentContactId = contactId;

    const user = auth.currentUser;
    if (!user) return;

    // Consistently sort IDs to ensure same conversation ID regardless of who initiates
    const ids = [user.uid, contactId].sort();
    currentConversationId = ids.join('_');

    // Update UI immediately - don't use setTimeout
    chatUserName.textContent = contactName || 'Contact';
    chatStatus.textContent = 'Online';

    // Force display style changes
    contactsContainer.classList.add('hidden');
    contactsContainer.style.display = 'none';

    messagesContainerWrapper.classList.remove('hidden');
    messagesContainerWrapper.style.display = 'block';

    backToContactsBtn.classList.remove('hidden');

    console.log("View switched to messages. Display states:", {
        contacts: contactsContainer.style.display,
        messages: messagesContainerWrapper.style.display
    });

    // Load messages for this conversation
    loadMessages(currentConversationId);
}

// Updated loadMessages function:
function loadMessages(conversationId) {
    messagesContainer.innerHTML = `<div class="flex justify-center p-4"><p class="text-gray-500">Loading messages...</p></div>`;

    if (unsubscribeMessages) {
        unsubscribeMessages();
    }

    const convRef = db.collection('conversations').doc(conversationId);
    convRef.get()
        .then(doc => {
            if (!doc.exists) {
                return convRef.set({
                    participants: [auth.currentUser.uid, currentContactId],
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastMessage: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        })
        .then(() => {
            messageInput.disabled = false;
            messageForm.querySelector('button').disabled = false;
            messageInput.focus();
            unsubscribeMessages = convRef.collection('messages')
                .orderBy('timestamp', 'asc')
                .onSnapshot(snapshot => {
                    if (snapshot.empty) {
                        messagesContainer.innerHTML = `<div class="flex justify-center"><p class="text-gray-500">No messages yet. Start the conversation!</p></div>`;
                        return;
                    }
                    let lastEl = null;
                    snapshot.docChanges().forEach(change => {
                        if (change.type === 'added') {
                            const msg = change.doc.data();
                            const msgEl = createMessageElement(msg);
                            messagesContainer.appendChild(msgEl);
                            lastEl = msgEl;
                        }
                    });
                    if (lastEl) {
                        lastEl.scrollIntoView({ behavior: 'smooth' });
                    }
                }, error => {
                    console.error("Error loading messages:", error);
                    messagesContainer.innerHTML = `<div class="flex justify-center"><p class="text-red-500">Error loading messages: ${error.message}</p></div>`;
                });
        })
        .catch(error => {
            console.error("Error in loadMessages:", error);
            messagesContainer.innerHTML = `<div class="flex justify-center"><p class="text-red-500">Error: ${error.message}</p></div>`;
        });
}


function createMessageElement(message) {
    const currentUser = auth.currentUser;
    const isOwnMessage = currentUser && message.senderId === currentUser.uid;

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
        nameElement.textContent = message.senderName || 'Anonymous';
        messageContent.appendChild(nameElement);
    }

    const flexContainer = document.createElement('div');
    flexContainer.className = 'flex items-end space-x-2';

    if (!isOwnMessage) {
        const avatar = document.createElement('img');
        avatar.src = message.senderPhoto || 'images/Blank_pfp.png';
        avatar.alt = 'Avatar';
        avatar.className = 'w-8 h-8 rounded-full';
        flexContainer.appendChild(avatar);
    }

    flexContainer.appendChild(messageContent);
    messageDiv.appendChild(flexContainer);

    return messageDiv;
}


function showContactsView() {
    // Reset conversation state
    currentContactId = null;
    currentConversationId = null;

    // Update UI with both class and style property
    contactsContainer.classList.remove('hidden');
    contactsContainer.style.display = 'block';

    messagesContainerWrapper.classList.add('hidden');
    messagesContainerWrapper.style.display = 'none';

    backToContactsBtn.classList.add('hidden');

    chatUserName.textContent = 'Contacts';
    chatStatus.textContent = 'Select a contact to chat';

    console.log("Contacts view activated",
        {
            contacts: contactsContainer.style.display,
            messages: messagesContainerWrapper.style.display
        });
}

function showMessagesView() {
    // Ensure proper hiding/showing with both class and style property
    contactsContainer.classList.add('hidden');
    contactsContainer.style.display = 'none';

    messagesContainerWrapper.classList.remove('hidden');
    messagesContainerWrapper.style.display = 'block';

    backToContactsBtn.classList.remove('hidden');

    console.log("Messages view activated",
        {
            contacts: contactsContainer.style.display,
            messages: messagesContainerWrapper.style.display
        });
}


backToContactsBtn.addEventListener('click', () => {
    showContactsView();


    if (unsubscribeMessages) {
        unsubscribeMessages();
        unsubscribeMessages = null;
    }

    currentContactId = null;
    currentConversationId = null;
});


function initChatView() {

    showContactsView();
}


initChatView();

// Expose functions globally to ensure they're accessible
window.loadContacts = loadContacts;
window.selectContact = selectContact;
window.showMessagesView = showMessagesView;
window.showContactsView = showContactsView;

// Assume currentChatId is set when a chat session is opened.
let currentChatId = 'defaultChatId'; // Replace with actual chat room id logic
let messageIds = new Set();

// Render a message element without clearing previous messages.
function renderMessage(msgData) {
    const div = document.createElement('div');
    div.className = 'message-item p-2 border-b';
    div.innerHTML = `
        <p><strong>${msgData.senderName}:</strong> ${msgData.text}</p>
        <small class="text-gray-500">${new Date(msgData.timestamp).toLocaleTimeString()}</small>
    `;
    return div;
}

// Re-write the chat refreshing system:
// Remove any code that clears messagesContainer.innerHTML completely before updating.
// Instead, listen for new document changes and append only new messages.
if (typeof unsubscribeMessages === 'function') {
    unsubscribeMessages();
}

unsubscribeMessages = firebase.firestore().collection('chats')
    .doc(currentChatId)
    .collection('messages')
    .orderBy('timestamp')
    .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            const msgId = change.doc.id;
            const msgData = change.doc.data();
            // Only process added messages which have not been rendered
            if (change.type === 'added' && !messageIds.has(msgId)) {
                messageIds.add(msgId);
                const msgElement = renderMessage(msgData);
                messagesContainer.appendChild(msgElement);
                // Auto-scroll to latest message
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
            // Optionally handle 'modified' or 'removed' changes if needed.
        });
    });