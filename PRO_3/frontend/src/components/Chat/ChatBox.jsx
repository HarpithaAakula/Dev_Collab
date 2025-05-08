import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getSocket, joinProblemRoom } from '../../services/socketService.js';

const ChatBox = ({ problemId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/chat/${problemId}`, {
          headers: userInfo ? { Authorization: `Bearer ${userInfo.token}` } : {}
        });
        setMessages(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setError('Failed to load messages');
        setLoading(false);
      }
    };

    if (problemId) {
      fetchMessages();
    }

    // Join the problem chat room
    const socket = getSocket();
    joinProblemRoom(problemId);

    // Listen for new messages
    socket.on('new_message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('new_message');
    };
  }, [problemId, userInfo]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !userInfo) return;

    try {
      const response = await axios.post(
        `http://localhost:5000/api/chat/${problemId}`,
        { content: newMessage },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        }
      );
      
      setNewMessage('');
      // The new message will be added via socket event
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  if (!userInfo) {
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
                    ? 'bg-blue-100 ml-auto max-w-[75%]' 
                    : 'bg-gray-100 max-w-[75%]'
                }`}
              >
                <p className="text-sm font-semibold">{message.userName}</p>
                <p>{message.content}</p>
                <p className="text-xs text-gray-500 text-right">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </p>
              </div>
            ))}
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
          // value style="margin-bottom: 10px;"
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