const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const userRoutes = require('./routes/userRoutes');
const problemRoutes = require('./routes/problemRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { protect } = require('./middleware/authMiddleware');

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);

// Initialize socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.io middleware for authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  // Verify token (simplified, use your actual auth method)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (error) {
    return next(new Error('Authentication error'));
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}, User: ${socket.userId}`);
  
  // Join user's personal room for direct notifications
  socket.join(`user_${socket.userId}`);
  
  // Handle joining problem rooms
  socket.on('join_problem', ({ problemId }) => {
    socket.join(`problem_${problemId}`);
    console.log(`User ${socket.userId} joined room: problem_${problemId}`);
    
    // Notify others in the room
    socket.to(`problem_${problemId}`).emit('user_joined', {
      userId: socket.userId,
      socketId: socket.id
    });
  });
  
  // Handle leaving problem rooms
  socket.on('leave_problem', ({ problemId }) => {
    socket.leave(`problem_${problemId}`);
    console.log(`User ${socket.userId} left room: problem_${problemId}`);
    
    // Notify others in the room
    socket.to(`problem_${problemId}`).emit('user_left', {
      userId: socket.userId,
      socketId: socket.id
    });
  });
  
  // Handle code collaboration
  socket.on('code_change', ({ problemId, code }) => {
    socket.to(`problem_${problemId}`).emit('code_update', { code });
  });
  
  // Handle chat messages
  socket.on('chat_message', async ({ problemId, message }) => {
    // Message handling is done in chatController
  });
  
  // Handle solution events
  socket.on('new_solution', ({ problemId, solution }) => {
    socket.to(`problem_${problemId}`).emit('solution_received', solution);
  });
  
  socket.on('solution_vote', ({ problemId, solutionId, votes }) => {
    socket.to(`problem_${problemId}`).emit('vote_updated', { solutionId, votes });
  });
  
  socket.on('solution_accepted', ({ problemId, solutionId }) => {
    socket.to(`problem_${problemId}`).emit('acceptance_updated', { solutionId });
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Make io available in req object
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});