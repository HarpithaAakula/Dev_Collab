import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { getSocket, joinProblemRoom, sendChatMessage, onChatMessage } from '../../services/socketService.js';

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
    console.log('Socket instance:', socket?.id || 'No socket connection');
    
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
      
    // Listen for new messages via socket
    const handleNewMessage = (message) => {
      console.log('Received new message via socket:', message);
      // Prevent duplicate messages
      setMessages((prevMessages) => {
        // Check if message already exists in the array by _id
        if (message._id && !prevMessages.some(msg => msg._id === message._id)) {
          return [...prevMessages, message];
        }
        return prevMessages;
      });
    };
    
    // Set up socket event listener for new messages
    const cleanup = onChatMessage(handleNewMessage);

    // Attach test listener for built-in event
    const handleConnect = () => {
      console.log('Socket connected event received in ChatBox:', socket?.id);
    };
    
    if (socket) {
      socket.on('connect', handleConnect);

      const handleTestEvent = (data) => {
        console.log('Test event received:', data);
      };
      socket.on('test_event', handleTestEvent);
      
      // Clean up on unmount
      return () => {
        isMounted = false;
        cleanup(); // Clean up the new message listener
        socket.off('connect', handleConnect);
        socket.off('test_event', handleTestEvent);
      };
    }
    
    return () => {
      isMounted = false;
      cleanup(); // Still clean up even if no socket
    };
  }, [problemId, token]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !userInfo?.token) return;

    try {
      // Send message via REST API
      const response = await axios.post(
        `http://localhost:5000/api/chat/${problemId}`,
        { content: newMessage },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        }
      );
      
      // Get the created message from the response
      const newMessageData = response.data;
      console.log('Message sent via API, response:', newMessageData);
      
      // Add the message to the UI immediately (don't wait for socket)
      setMessages(prevMessages => [...prevMessages, newMessageData]);
      
      // Now that we have the message ID from the database, notify other clients via socket
      sendChatMessage(
        problemId,
        newMessage,
        newMessageData._id // Pass the ID from the created message
      );
      
      setNewMessage('');
      setError(null);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
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
                key={message._id || `temp-${Date.now()}`}
                className={`p-2 rounded-lg bg-gray-100 max-w-3/4 text-left`}
                style={{ marginLeft: 0 }}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{message.userName}</span>
                    <span className="text-sm font-semibold">:</span>
                    <span className="text-base ml-1">{message.content}</span>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                    {message.createdAt ? new Date(message.createdAt).toLocaleTimeString() : 'just now'}
                  </span>
                </div>
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