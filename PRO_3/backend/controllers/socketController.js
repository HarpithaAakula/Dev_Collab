const Chat = require('../models/chatModel');

module.exports = (io) => {
  const activeRooms = new Map();
  const getRoomName = (problemId) => `problem_${problemId}`;

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    socket.emit('test_event', { msg: 'Hello from server' });

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

      socket.to(roomName).emit('user_joined', {
        userId: socket.id,
        totalUsers: roomData.users.size
      });

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

    // Chat messages
    socket.on('chat_message', async ({ problemId, message, userId, userName }) => {
      const roomName = getRoomName(problemId);
      console.log('Socket server: emitting new_chat_message to', roomName, 'with message:', message);

      if (!problemId || !userId || !userName || !message) {
        console.error('chat_message: Missing required fields');
        return;
      }

      try {
        // Updated to use 'problem' instead of 'problemId' to match the schema
        const savedMessage = await Chat.create({
          problem: problemId,
          user: userId,
          userName,
          content: message
        });

        if (activeRooms.has(roomName)) {
          const roomData = activeRooms.get(roomName);
          roomData.chat.push(savedMessage);
          if (roomData.chat.length > 100) {
            roomData.chat.shift();
          }
        }

        io.to(roomName).emit('new_chat_message', savedMessage);
      } catch (err) {
        console.error('Error saving chat message to DB:', err);
      }
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

          if (roomData.users.size === 0) {
            activeRooms.delete(roomName);
          }
        }
      });
    });
  });
};