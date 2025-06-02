const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const socketController = require('./controllers/socketController');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: 'http://localhost:5173', // frontend URL
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true, // Allow credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify the methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Specify the allowed headers
}));
app.use(express.json());

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/problems', require('./routes/problemRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/gamification', require('./routes/gamificationRoutes'));

// Socket.io connection
socketController(io);

// Make io instance available to routes
app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));