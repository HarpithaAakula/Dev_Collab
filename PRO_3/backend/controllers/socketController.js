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
          users: new Set(),
          code: '',
          chat: []
        });
      }

      const roomData = activeRooms.get(roomName);
      roomData.users.add(socket.id);

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
      const roomName = getRoomName(problemId);
      socket.to(roomName).emit('vote_updated', {
        solutionId,
        votes
      });
    });

    // Solution accepted
    socket.on('solution_accepted', ({ problemId, solutionId }) => {
      const roomName = getRoomName(problemId);
      socket.to(roomName).emit('acceptance_updated', {
        solutionId,
        isAccepted: true
      });
    });

    // Chat messages - Only relay messages, don't save them here
    socket.on('chat_message', ({ problemId, message, userId, userName, messageId }) => {
      const roomName = getRoomName(problemId);
      console.log('Socket server: relaying message to', roomName);

      // We're relaying a message that's already been saved via the REST API
      socket.to(roomName).emit('new_chat_message', {
        problem: problemId,
        user: userId,
        userName,
        content: message,
        _id: messageId, // Important: include the _id from the database
        createdAt: new Date().toISOString()
      });
    });

    // Leave room
    socket.on('leave_problem', ({ problemId }) => {
      const roomName = getRoomName(problemId);
      socket.leave(roomName);

      if (activeRooms.has(roomName)) {
        const roomData = activeRooms.get(roomName);
        roomData.users.delete(socket.id);

        io.to(roomName).emit('user_left', {
          userId: socket.id,
          totalUsers: roomData.users.size
        });
        console.log(`[DEBUG] user_left: ${socket.id} left ${roomName}, total users: ${roomData.users.size}`);

        if (roomData.users.size === 0) {
          activeRooms.delete(roomName);
        }
      }

      console.log(`User ${socket.id} left room ${roomName}`);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      activeRooms.forEach((roomData, roomName) => {
        if (roomData.users.has(socket.id)) {
          roomData.users.delete(socket.id);

          io.to(roomName).emit('user_left', {
            userId: socket.id,
            totalUsers: roomData.users.size
          });
          console.log(`[DEBUG] user_left (disconnect): ${socket.id} left ${roomName}, total users: ${roomData.users.size}`);

          if (roomData.users.size === 0) {
            activeRooms.delete(roomName);
          }
        }
      });
    });
  });
};