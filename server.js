// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage for waiting users and active chats
const waitingUsers = new Map(); // Key: socket.id, Value: user data
const activePairs = new Map();  // Key: socket.id, Value: partner's socket.id

// Handle socket connections
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle when a user is ready to chat with their preferences
    socket.on('user-ready', (userData) => {
        const { gender, preference } = userData;
        
        // Store user data
        const userInfo = { 
            socketId: socket.id, 
            gender, 
            preference,
            targetGenders: calculateTargetGenders(gender, preference)
        };
        
        waitingUsers.set(socket.id, userInfo);
        console.log('User ready:', userInfo);

        // Try to find a match
        findMatch(socket.id, userInfo);
    });

    // Handle sending messages
    socket.on('send-message', (data) => {
        const partnerId = activePairs.get(socket.id);
        if (partnerId) {
            socket.to(partnerId).emit('receive-message', {
                message: data.message,
                senderId: socket.id
            });
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        // Remove from waiting list
        waitingUsers.delete(socket.id);
        
        // Notify partner and clean up active pair
        const partnerId = activePairs.get(socket.id);
        if (partnerId) {
            socket.to(partnerId).emit('partner-disconnected');
            activePairs.delete(partnerId);
        }
        activePairs.delete(socket.id);
    });

    // Handle request to find new partner
    socket.on('find-new-partner', () => {
        // Remove from current pair
        const partnerId = activePairs.get(socket.id);
        if (partnerId) {
            socket.to(partnerId).emit('partner-disconnected');
            activePairs.delete(partnerId);
            activePairs.delete(socket.id);
        }

        // Add back to waiting pool
        const userInfo = waitingUsers.get(socket.id);
        if (userInfo) {
            findMatch(socket.id, userInfo);
        }
    });
});

// Calculate target genders based on preference
function calculateTargetGenders(gender, preference) {
    switch(preference) {
        case 'straight-male': return ['female'];
        case 'straight-female': return ['male'];
        case 'gay-male': return ['male'];
        case 'gay-female': return ['female'];
        case 'bisexual': return ['male', 'female'];
        default: return [];
    }
}

// Find a match for the user
function findMatch(userId, userInfo) {
    for (let [waitingId, waitingUser] of waitingUsers) {
        if (waitingId !== userId && 
            userInfo.targetGenders.includes(waitingUser.gender) &&
            waitingUser.targetGenders.includes(userInfo.gender)) {
            
            // Found a match!
            const userSocket = io.sockets.sockets.get(userId);
            const waitingSocket = io.sockets.sockets.get(waitingId);
            
            if (userSocket && waitingSocket) {
                // Pair them up
                activePairs.set(userId, waitingId);
                activePairs.set(waitingId, userId);
                
                // Remove from waiting list
                waitingUsers.delete(userId);
                waitingUsers.delete(waitingId);
                
                // Notify both users
                userSocket.emit('chat-started');
                waitingSocket.emit('chat-started');
                
                console.log(`Matched ${userId} with ${waitingId}`);
            }
            break;
        }
    }
}

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});