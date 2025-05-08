// controllers/socketController.js
module.exports = (io) => {
  // Store active collaboration rooms
  const activeRooms = new Map();

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // Join a collaboration room for a specific problem
    socket.on('join_problem', ({ problemId }) => {
      socket.join(problemId);
      
      if (!activeRooms.has(problemId)) {
        activeRooms.set(problemId, { 
          users: new Set(), 
          code: '',
          chat: []
        });
      }
      
      // Add user to the room
      const roomData = activeRooms.get(problemId);
      roomData.users.add(socket.id);
      
      // Send current code to the new user
      socket.emit('current_code', roomData.code);
      
      // Send chat history to the new user
      socket.emit('chat_history', roomData.chat);
      
      // Notify others about new user
      socket.to(problemId).emit('user_joined', {
        userId: socket.id,
        totalUsers: roomData.users.size
      });

      console.log(`User joined problem room: ${problemId}, Total users: ${roomData.users.size}`);
    });
    
    // Handle code updates
    socket.on('code_change', ({ problemId, code }) => {
      // Update the stored code
      if (activeRooms.has(problemId)) {
        const roomData = activeRooms.get(problemId);
        roomData.code = code;
      }
      
      // Broadcast to others in the room
      socket.to(problemId).emit('code_update', code);
    });

    // Handle solution submissions (from your existing server.js)
    socket.on('new_solution', (data) => {
      socket.to(data.problemId).emit('solution_received', data.solution);
    });

    // Handle solution votes
    socket.on('solution_vote', (data) => {
      socket.to(data.problemId).emit('vote_updated', {
        solutionId: data.solutionId,
        votes: data.votes
      });
    });

    // Handle solution acceptance
    socket.on('solution_accepted', (data) => {
      socket.to(data.problemId).emit('acceptance_updated', {
        solutionId: data.solutionId,
        isAccepted: true
      });
    });

    // Handle chat messages
    socket.on('chat_message', (data) => {
      const { problemId, message } = data;
      
      if (activeRooms.has(problemId)) {
        const roomData = activeRooms.get(problemId);
        const chatMessage = {
          userId: socket.id,
          message,
          timestamp: new Date().toISOString()
        };
        
        // Store message in room history
        roomData.chat.push(chatMessage);
        
        // Limit chat history to most recent 100 messages
        if (roomData.chat.length > 100) {
          roomData.chat.shift();
        }
        
        // Broadcast to everyone in the room including sender
        io.to(problemId).emit('new_chat_message', chatMessage);
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      
      // Remove user from all rooms they were in
      activeRooms.forEach((roomData, problemId) => {
        if (roomData.users.has(socket.id)) {
          roomData.users.delete(socket.id);
          
          // Notify others in the room
          io.to(problemId).emit('user_left', {
            userId: socket.id,
            totalUsers: roomData.users.size
          });
          
          // Clean up empty rooms
          if (roomData.users.size === 0) {
            activeRooms.delete(problemId);
          }
        }
      });
    });
  });
};