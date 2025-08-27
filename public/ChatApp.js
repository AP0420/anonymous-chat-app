// public/ChatApp.js
// Connect using the URL from config.js
const socket = io(window.CHAT_SERVER_URL, { autoConnect: true });
let currentScreen = 'welcome-screen';

// Show specific screen and hide others
function showScreen(screenId) {
    document.getElementById(currentScreen).classList.remove('active');
    document.getElementById(screenId).classList.add('active');
    currentScreen = screenId;
}

function showPreferenceScreen() {
    showScreen('preference-screen');
}

// Start chat with selected preferences
function startChat() {
    const gender = document.getElementById('user-gender').value;
    const preference = document.getElementById('user-preference').value;
    
    showScreen('loading-screen');
    
    // Send preferences to server
    socket.emit('user-ready', {
        gender: gender,
        preference: preference
    });
}

function cancelSearch() {
    showScreen('preference-screen');
}

// Send message
function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    
    if (message) {
        socket.emit('send-message', { message: message });
        
        // Add my message to chat
        addMessage(message, 'my-message');
        
        // Clear input
        messageInput.value = '';
    }
}

// Add message to chat display
function addMessage(message, messageClass) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', messageClass);
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Find new partner
function findNewPartner() {
    socket.emit('find-new-partner');
    showScreen('loading-screen');
}

// Socket event handlers
socket.on('chat-started', () => {
    showScreen('chat-screen');
    document.getElementById('chat-messages').innerHTML = '';
});

socket.on('receive-message', (data) => {
    addMessage(data.message, 'their-message');
});

socket.on('partner-disconnected', () => {
    alert('Your chat partner has disconnected. Finding a new partner...');
    findNewPartner();
});

// Handle Enter key for sending messages
document.getElementById('message-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
