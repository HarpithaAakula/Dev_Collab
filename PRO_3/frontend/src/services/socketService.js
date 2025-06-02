import { io } from 'socket.io-client';

let socket;
let currentRoom = null;

export const initSocket = (token) => {
  if (socket?.connected) {
    return socket;
  }

  // Always connect to the backend using the full URL
  socket = io('http://localhost:5000', {
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    // Force websocket transport for reliability
    auth: {
      token // Include the auth token for socket authentication
    }
  });
  
  socket.on('connect', () => {
    console.log('Socket connected successfully:', socket.id);
    
    // Join user's notification room for gamification updates
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    if (userInfo._id) {
      socket.emit('join_notifications', { userId: userInfo._id });
    }
  });
  
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });
  
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo?.token) {
      socket = initSocket(userInfo.token);
    }
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    if (currentRoom) {
      socket.emit('leave_problem', { problemId: currentRoom });
      currentRoom = null;
    }
    socket.disconnect();
  }
};

export const joinProblemRoom = (problemId, language = null) => {
  const currentSocket = getSocket();
  if (!currentSocket) return;
  
  // If we're already in this room, don't join again
  if (currentRoom === problemId) {
    return;
  }
  
  // If we're in a different room, leave it first
  if (currentRoom) {
    currentSocket.emit('leave_problem', { problemId: currentRoom });
  }
  
  // Get current user data
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  
  console.log(`Joining problem room: ${problemId}`);
  currentSocket.emit('join_problem', { 
    problemId, 
    userId: userInfo._id, 
    userName: userInfo.name,
    language: language // Pass language for gamification tracking
  });
  currentRoom = problemId;
};

// Real-time code collaboration
export const sendCodeChange = (problemId, code) => {
  const currentSocket = getSocket();
  if (!currentSocket) return;
  currentSocket.emit('code_change', { problemId, code });
};

// Solution management
export const sendNewSolution = (problemId, solution) => {
  const currentSocket = getSocket();
  if (!currentSocket) return;
  currentSocket.emit('new_solution', { problemId, solution });
};

export const sendSolutionVote = (problemId, solutionId, votes) => {
  const currentSocket = getSocket();
  if (!currentSocket) return;
  currentSocket.emit('solution_vote', { problemId, solutionId, votes });
};

export const sendSolutionAccepted = (problemId, solutionId) => {
  const currentSocket = getSocket();
  if (!currentSocket) return;
  currentSocket.emit('solution_accepted', { problemId, solutionId });
};

// Chat functionality
export const sendChatMessage = (problemId, message, messageId) => {
  const currentSocket = getSocket();
  if (!currentSocket) return;
  
  // Get current user data
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  
  currentSocket.emit('chat_message', { 
    problemId, 
    message,
    messageId,
    userId: userInfo._id,
    userName: userInfo.name,
    timestamp: new Date().toISOString()
  });
};

// Socket event listeners
export const onCodeUpdate = (callback) => {
  const currentSocket = getSocket();
  if (!currentSocket) return () => {};
  currentSocket.on('code_update', callback);
  return () => currentSocket.off('code_update', callback);
};

export const onCurrentCode = (callback) => {
  const currentSocket = getSocket();
  if (!currentSocket) return () => {};
  currentSocket.on('current_code', callback);
  return () => currentSocket.off('current_code', callback);
};

export const onNewMessage = (callback) => {
  const currentSocket = getSocket();
  if (!currentSocket) return () => {};
  currentSocket.on('new_chat_message', callback);
  return () => currentSocket.off('new_chat_message', callback);
};

// Adding onChatMessage for backwards compatibility with your components
export const onChatMessage = (callback) => {
  const currentSocket = getSocket();
  if (!currentSocket) return () => {};
  currentSocket.on('new_chat_message', callback);
  return () => currentSocket.off('new_chat_message', callback);
};

export const onChatHistory = (callback) => {
  const currentSocket = getSocket();
  if (!currentSocket) return () => {};
  currentSocket.on('chat_history', callback);
  return () => currentSocket.off('chat_history', callback);
};

export const onUserJoined = (callback) => {
  const currentSocket = getSocket();
  if (!currentSocket) return () => {};
  currentSocket.on('user_joined', callback);
  return () => currentSocket.off('user_joined', callback);
};

export const onUserLeft = (callback) => {
  const currentSocket = getSocket();
  if (!currentSocket) return () => {};
  currentSocket.on('user_left', callback);
  return () => currentSocket.off('user_left', callback);
};

export const onSolutionReceived = (callback) => {
  const currentSocket = getSocket();
  if (!currentSocket) return () => {};
  currentSocket.on('solution_received', callback);
  return () => currentSocket.off('solution_received', callback);
};

export const onVoteUpdated = (callback) => {
  const currentSocket = getSocket();
  if (!currentSocket) return () => {};
  currentSocket.on('vote_updated', callback);
  return () => currentSocket.off('vote_updated', callback);
};

export const onAcceptanceUpdated = (callback) => {
  const currentSocket = getSocket();
  if (!currentSocket) return () => {};
  currentSocket.on('acceptance_updated', callback);
  return () => currentSocket.off('acceptance_updated', callback);
};

// Gamification event listeners
export const onGamificationUpdate = (callback) => {
  const currentSocket = getSocket();
  if (!currentSocket) return () => {};
  currentSocket.on('gamification_update', callback);
  return () => currentSocket.off('gamification_update', callback);
};

export const onPointsUpdated = (callback) => {
  const currentSocket = getSocket();
  if (!currentSocket) return () => {};
  currentSocket.on('points_updated', callback);
  return () => currentSocket.off('points_updated', callback);
};

export const onBadgesEarned = (callback) => {
  const currentSocket = getSocket();
  if (!currentSocket) return () => {};
  currentSocket.on('badges_earned', callback);
  return () => currentSocket.off('badges_earned', callback);
};

// Notification event listeners
export const onNotification = (callback) => {
  const currentSocket = getSocket();
  if (!currentSocket) return () => {};
  currentSocket.on('notification', callback);
  return () => currentSocket.off('notification', callback);
};