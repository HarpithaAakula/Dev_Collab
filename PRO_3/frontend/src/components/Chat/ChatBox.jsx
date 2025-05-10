import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { getSocket, joinProblemRoom } from '../../services/socketService.js';

const ChatBox = ({ problemId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Get user info from localStorage
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const token = userInfo?.token;
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let isMounted = true;
    
    // Get socket instance
    const socket = getSocket();
    console.log('Socket instance:', socket);
    
    // Fetch messages when component mounts
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/chat/${problemId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        if (isMounted) {
          setMessages(data);
          console.log('Fetched messages:', data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching messages:', err);
          setError('Failed to load messages');
          setLoading(false);
        }
      }
    };

    if (problemId) {
      fetchMessages();
      // Join the problem room
      joinProblemRoom(problemId);
    }
      
    const handleNewMessage = (message) => {
      console.log('Received new message via socket:', message);
      setMessages((prevMessages) => [...prevMessages, message]);
    };
    socket.on('new_chat_message', handleNewMessage);

    // Attach test listener for built-in event
    const handleConnect = () => {
      console.log('Socket connected event received in ChatBox:', socket.id);
    };
    socket.on('connect', handleConnect);

    const handleTestEvent = (data) => {
      console.log('Test event received:', data);
    };
    socket.on('test_event', handleTestEvent);
    
    // Clean up on unmount
    return () => {
      isMounted = false;
      socket.off('new_chat_message', handleNewMessage);
      socket.off('connect', handleConnect);
      socket.off('test_event', handleTestEvent);
    };
  }, [problemId, token]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !userInfo) return;

    try {
      const socket = getSocket();
      
      // Send message via REST API
      const response = await axios.post(
        `http://localhost:5000/api/chat/${problemId}`,
        { content: newMessage },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        }
      );
      
      // Also emit via socket for real-time updates
      socket.emit('chat_message', {
        problemId,
        message: newMessage,
        userId: userInfo._id,
        userName: userInfo.name
      });
      
      setNewMessage('');
      setError(null);
      // The new message will be added via socket event
    } catch (error) {
      console.error('Error sending message:', error);
      if (!messages.some(msg => msg.content === newMessage)) {
        setError('Failed to send message');
      }
    }
  };

  if (!userInfo?.token) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-center mt-6">
        Please <a href="/login" className="text-blue-500 hover:underline">login</a> to join the discussion.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">Discussion</h2>
      
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <div className="border rounded-lg mb-4 h-64 overflow-y-auto p-4">
        {loading ? (
          <p className="text-center">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet. Start the conversation!</p>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div 
                key={message._id}
                className={`p-2 rounded-lg ${
                  message.user === userInfo._id 
                    ? 'bg-blue-100 ml-auto max-w-3/4' 
                    : 'bg-gray-100 max-w-3/4'
                }`}
              >
                <p className="text-sm font-semibold">{message.userName}</p>
                <p>{message.content}</p>
                <p className="text-xs text-gray-500 text-right">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow p-2 border rounded"
          placeholder="Type your message..."
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={!newMessage.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBox;