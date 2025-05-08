import React, { useState, useEffect, useRef } from 'react';
import { 
  getSocket, 
  joinProblemRoom, 
  sendCodeChange, 
  onCodeUpdate, 
  onCurrentCode,
  onUserJoined,
  onUserLeft
} from '../services/socketService';

const CodeCollaborationComponent = ({ problemId }) => {
  const [code, setCode] = useState('');
  const [activeUsers, setActiveUsers] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [language, setLanguage] = useState('javascript');
  const codeChangeTimeout = useRef(null);

  // Join the room when component mounts
  useEffect(() => {
    joinProblemRoom(problemId);
    
    // Set up listeners
    const codeUpdateCleanup = onCodeUpdate(handleCodeUpdate);
    const currentCodeCleanup = onCurrentCode(handleCurrentCode);
    const userJoinedCleanup = onUserJoined(handleUserJoined);
    const userLeftCleanup = onUserLeft(handleUserLeft);
    
    // Cleanup listeners when component unmounts
    return () => {
      codeUpdateCleanup();
      currentCodeCleanup();
      userJoinedCleanup();
      userLeftCleanup();
      
      // Clear any pending timeouts
      if (codeChangeTimeout.current) {
        clearTimeout(codeChangeTimeout.current);
      }
    };
  }, [problemId]);

  // Handle when another user updates the code
  const handleCodeUpdate = (newCode) => {
    setCode(newCode);
    setStatusMessage('Code updated by another user');
    
    // Clear status message after 3 seconds
    setTimeout(() => {
      setStatusMessage('');
    }, 3000);
  };

  // Handle receiving initial code when joining
  const handleCurrentCode = (currentCode) => {
    setCode(currentCode);
    if (currentCode) {
      setStatusMessage('Loaded existing code from the collaboration session');
      setTimeout(() => {
        setStatusMessage('');
      }, 3000);
    }
  };

  // Handle user joined notifications
  const handleUserJoined = (data) => {
    setActiveUsers(data.totalUsers);
    setStatusMessage(`A new user has joined. Total users: ${data.totalUsers}`);
    setTimeout(() => {
      setStatusMessage('');
    }, 3000);
  };

  // Handle user left notifications
  const handleUserLeft = (data) => {
    setActiveUsers(data.totalUsers);
    setStatusMessage(`A user has left. Total users: ${data.totalUsers}`);
    setTimeout(() => {
      setStatusMessage('');
    }, 3000);
  };

  // Debounce code changes to avoid flooding the server
  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);
    
    // Clear any existing timeout
    if (codeChangeTimeout.current) {
      clearTimeout(codeChangeTimeout.current);
    }
    
    // Set a new timeout to send the change after 500ms of inactivity
    codeChangeTimeout.current = setTimeout(() => {
      sendCodeChange(problemId, newCode);
    }, 500);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  return (
    <div className="code-collaboration-container">
      <div className="code-header">
        <div className="code-status">
          <span className="active-users">
            {activeUsers} active {activeUsers === 1 ? 'user' : 'users'}
          </span>
          {statusMessage && (
            <span className="status-message">{statusMessage}</span>
          )}
        </div>
        <div className="language-selector">
          <label htmlFor="language-select">Language:</label>
          <select 
            id="language-select" 
            value={language} 
            onChange={handleLanguageChange}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="csharp">C#</option>
            <option value="cpp">C++</option>
          </select>
        </div>
      </div>
      
      <textarea
        className="code-editor"
        value={code}
        onChange={handleCodeChange}
        placeholder="Write your code here. It will be synchronized with other users in real-time."
        spellCheck="false"
      />
      
      <div className="collaboration-tips">
        <h4>Collaboration Tips</h4>
        <ul>
          <li>Changes are sent automatically as you type</li>
          <li>Use comments to communicate with collaborators in the code</li>
          <li>The chat panel can be used for discussions</li>
        </ul>
      </div>
    </div>
  );
};

export default CodeCollaborationComponent;