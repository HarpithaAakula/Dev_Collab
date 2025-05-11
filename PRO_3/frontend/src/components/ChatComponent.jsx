import React, { useState, useEffect, useRef } from 'react';
import { 
  sendChatMessage, 
  onChatMessage, 
  onChatHistory,
  getSocket,
  joinProblemRoom
} from '../services/socketService';

const ChatComponent = ({ problemId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Set up chat listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Join the problem room
    joinProblemRoom(problemId);

    const chatMessageCleanup = onChatMessage((message) => {
      console.log('Received chat message:', message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    
    const chatHistoryCleanup = onChatHistory((history) => {
      console.log('Received chat history:', history);
      setMessages(history);
    });
    
    return () => {
      chatMessageCleanup();
      chatHistoryCleanup();
    };
  }, [problemId]);

  // Scroll to bottom of chat when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const socket = getSocket();
      if (!socket) return;

      sendChatMessage(problemId, newMessage.trim());
      setNewMessage('');
    }
  };

  // Format timestamp to display time only
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Collaboration Chat</h3>
      </div>
      
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={index} 
              className={`chat-message ${msg.userId === getSocket()?.id ? 'own-message' : 'other-message'}`}
            >
              <div className="message-header">
                <span className="user-id">{msg.userId === getSocket()?.id ? 'You' : `User ${msg.userId?.substring(0, 5)}...`}</span>
                <span className="timestamp">{formatTime(msg.timestamp)}</span>
              </div>
              <p className="message-content">{msg.message}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form className="message-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={!newMessage.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatComponent;