import { io } from 'socket.io-client';

let socket;

export const initSocket = () => {
  // Add error handling and connection event logging
  socket = io('http://localhost:5000', {
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
  
  socket.on('connect', () => {
    console.log('Socket connected successfully:', socket.id);
  });
  
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });
  
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};

export const joinProblemRoom = (problemId) => {
  const currentSocket = getSocket();
  console.log(`Joining problem room: ${problemId}`);
  currentSocket.emit('join_problem', { problemId });
};

// Real-time code collaboration
export const sendCodeChange = (problemId, code) => {
  const currentSocket = getSocket();
  currentSocket.emit('code_change', { problemId, code });
};

// Solution management
export const sendNewSolution = (problemId, solution) => {
  const currentSocket = getSocket();
  currentSocket.emit('new_solution', { problemId, solution });
};

export const sendSolutionVote = (problemId, solutionId, votes) => {
  const currentSocket = getSocket();
  currentSocket.emit('solution_vote', { problemId, solutionId, votes });
};

export const sendSolutionAccepted = (problemId, solutionId) => {
  const currentSocket = getSocket();
  currentSocket.emit('solution_accepted', { problemId, solutionId });
};

// Chat functionality
export const sendChatMessage = (problemId, message) => {
  const currentSocket = getSocket();
  currentSocket.emit('chat_message', { problemId, message });
};

// Socket event listeners
export const onCodeUpdate = (callback) => {
  const currentSocket = getSocket();
  currentSocket.on('code_update', callback);
  return () => currentSocket.off('code_update', callback);
};

export const onCurrentCode = (callback) => {
  const currentSocket = getSocket();
  currentSocket.on('current_code', callback);
  return () => currentSocket.off('current_code', callback);
};

export const onChatMessage = (callback) => {
  const currentSocket = getSocket();
  currentSocket.on('new_chat_message', callback);
  return () => currentSocket.off('new_chat_message', callback);
};

export const onChatHistory = (callback) => {
  const currentSocket = getSocket();
  currentSocket.on('chat_history', callback);
  return () => currentSocket.off('chat_history', callback);
};

export const onUserJoined = (callback) => {
  const currentSocket = getSocket();
  currentSocket.on('user_joined', callback);
  return () => currentSocket.off('user_joined', callback);
};

export const onUserLeft = (callback) => {
  const currentSocket = getSocket();
  currentSocket.on('user_left', callback);
  return () => currentSocket.off('user_left', callback);
};

export const onSolutionReceived = (callback) => {
  const currentSocket = getSocket();
  currentSocket.on('solution_received', callback);
  return () => currentSocket.off('solution_received', callback);
};

export const onVoteUpdated = (callback) => {
  const currentSocket = getSocket();
  currentSocket.on('vote_updated', callback);
  return () => currentSocket.off('vote_updated', callback);
};

export const onAcceptanceUpdated = (callback) => {
  const currentSocket = getSocket();
  currentSocket.on('acceptance_updated', callback);
  return () => currentSocket.off('acceptance_updated', callback);
};