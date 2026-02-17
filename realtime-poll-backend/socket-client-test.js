const io = require('socket.io-client');

// Connect to the Socket.IO server
const socket = io('http://localhost:3000');

console.log('Attempting to connect to Socket.IO server...');

socket.on('connect', () => {
    console.log('✅ Connected to server with ID:', socket.id);
    
    // Test joining a poll room
    const testPollId = '6991ea3f3d42fc904d541dc3';
    console.log(`📡 Sending joinPoll event for poll: ${testPollId}`);
    socket.emit('joinPoll', testPollId);
});

socket.on('joinedPoll', (data) => {
    console.log('✅ Received joinedPoll response:', data);
    console.log(`   Successfully joined poll room: ${data.pollId}`);
    console.log(`   Socket ID: ${data.socketId}`);
    
    // Close the connection after testing
    setTimeout(() => {
        console.log('🔌 Closing connection...');
        socket.disconnect();
    }, 1000);
});

socket.on('disconnect', () => {
    console.log('❌ Disconnected from server');
    process.exit(0);
});

// Handle connection errors
socket.on('connect_error', (error) => {
    console.log('❌ Connection error:', error.message);
    process.exit(1);
});

// Timeout if connection fails
setTimeout(() => {
    console.log('⏰ Connection timeout');
    process.exit(1);
}, 5000);