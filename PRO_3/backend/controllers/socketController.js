const Chat = require('../models/chatModel');

module.exports = (io) => {
  const activeRooms = new Map();
  const getRoomName = (problemId) => `problem_${problemId}`;

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    socket.emit('test_event', { msg: 'Hello from server' });

    // Join user's notification room
    socket.on('join_notifications', ({ userId }) => {
      if (!userId) {
        console.error('join_notifications: Missing userId');
        return;
      }
      const notificationRoom = `user_${userId}`;
      socket.join(notificationRoom);
      console.log(`User joined notification room: ${notificationRoom}`);
    });

    // Join problem room
    socket.on('join_problem', ({ problemId, userId, userName }) => {
      if (!problemId) {
        console.error('join_problem: Missing problemId');
        return;
      }

      const roomName = getRoomName(problemId);
      socket.join(roomName);
      console.log('Socket joined rooms:', Array.from(socket.rooms));

      if (!activeRooms.has(roomName)) {
        activeRooms.set(roomName, {
          users: new Map(), // Changed to Map to store user details
          code: '',
          chat: []
        });
      }

      const roomData = activeRooms.get(roomName);
      // Store user info including userId and userName
      roomData.users.set(socket.id, { userId, userName });

      socket.emit('current_code', roomData.code);
      socket.emit('chat_history', roomData.chat);

      // Send the current user count directly to the joining user
      socket.emit('user_joined', {
        userId: socket.id,
        totalUsers: roomData.users.size
      });

      // Emit to all users in the room (including the joining user)
      io.to(roomName).emit('user_joined', {
        userId: socket.id,
        userName: userName,
        totalUsers: roomData.users.size
      });
      console.log(`[DEBUG] user_joined: ${socket.id} joined ${roomName}, total users: ${roomData.users.size}`);

      console.log(`User joined problem room: ${roomName}, Total users: ${roomData.users.size}`);
    });

    // Code updates
    socket.on('code_change', ({ problemId, code }) => {
      const roomName = getRoomName(problemId);
      if (activeRooms.has(roomName)) {
        const roomData = activeRooms.get(roomName);
        roomData.code = code;
      }
      socket.to(roomName).emit('code_update', code);
    });

    // New solution
    socket.on('new_solution', ({ problemId, solution }) => {
      const roomName = getRoomName(problemId);
      socket.to(roomName).emit('solution_received', solution);
    });

    // Solution votes
    socket.on('solution_vote', ({ problemId, solutionId, votes }) => {
      const roomName = getRoomName(problemId)