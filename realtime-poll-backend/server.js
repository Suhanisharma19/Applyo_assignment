const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const connectDB = require('./config/db');
const testRoutes = require('./routes/testRoutes');
const pollsRoutes = require('./routes/pollsRoutes');

// Export Socket.IO instance for use in controllers
let ioInstance;
module.exports = { getIO: () => ioInstance };

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.IO configuration with CORS
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for development
    methods: ["GET", "POST"]
  }
});

// Store the io instance for use in controllers
ioInstance = io;

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join poll room event
  socket.on('joinPoll', (pollId) => {
    console.log(`Client ${socket.id} joining poll room: ${pollId}`);
    
    // Join the room named after the pollId
    socket.join(pollId);
    
    // Emit confirmation back to the client
    socket.emit('joinedPoll', {
      success: true,
      message: `Successfully joined poll room ${pollId}`,
      pollId: pollId,
      socketId: socket.id
    });
  });

  // Handle client disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Routes
console.log('Registering routes...');
app.use('/api/polls', pollsRoutes);
console.log('Registered /api/polls routes');
// app.use('/api/test', testRoutes); // Temporarily disable
app.get('/api/test', (req, res) => {
  console.log('Direct GET /api/test called');
  res.json({ message: 'Direct test route works!' });
});
console.log('Registered GET /api/test route');
app.post('/api/test/create-test-poll', async (req, res) => {
  console.log('Direct POST /api/test/create-test-poll called');
  try {
    const Poll = require('./models/Poll');
    const poll = new Poll({
      question: 'Direct test poll question?',
      options: [
        { text: 'Option 1', votes: 0 },
        { text: 'Option 2', votes: 0 }
      ]
    });
    
    await poll.save();
    
    res.status(201).json({
      success: true,
      message: 'Direct test poll created',
      data: poll
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});
console.log('Registered POST /api/test/create-test-poll route');
app.get('/test-simple', (req, res) => {
  res.json({ message: 'Simple test route works!' });
});
console.log('Registered /test-simple route');

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log('Socket.IO server initialized');
  console.log('Available routes:');
  console.log('GET  / - Test route');
  console.log('GET  /health - Health check');
  console.log('POST /api/polls - Create poll');
  console.log('GET  /api/polls - Get all polls');
  console.log('GET  /api/polls/:id - Get poll by ID');
  console.log('POST /api/polls/vote - Vote on poll');
  console.log('Socket Events:');
  console.log('joinPoll - Join a poll room by pollId');
});