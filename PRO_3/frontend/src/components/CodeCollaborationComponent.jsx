import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@monaco-editor/react';
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
  const editorRef = useRef(null);

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
    console.log('[DEBUG] user_joined event received:', data);
    setActiveUsers(data.totalUsers);
    setStatusMessage(`A new user has joined. Total users: ${data.totalUsers}`);
    setTimeout(() => {
      setStatusMessage('');
    }, 3000);
  };

  // Handle user left notifications
  const handleUserLeft = (data) => {
    console.log('[DEBUG] user_left event received:', data);
    setActiveUsers(data.totalUsers);
    setStatusMessage(`A user has left. Total users: ${data.totalUsers}`);
    setTimeout(() => {
      setStatusMessage('');
    }, 3000);
  };

  // Handle editor mount
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  // Debounce code changes to avoid flooding the server
  const handleCodeChange = (value) => {
    setCode(value);
    
    // Clear any existing timeout
    if (codeChangeTimeout.current) {
      clearTimeout(codeChangeTimeout.current);
    }
    
    // Set a new timeout to send the change after 500ms of inactivity
    codeChangeTimeout.current = setTimeout(() => {
      sendCodeChange(problemId, value);
    }, 500);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  // Map language selection to Monaco language ID
  const getMonacoLanguage = (lang) => {
    const languageMap = {
      javascript: 'javascript',
      python: 'python',
      java: 'java',
      csharp: 'csharp',
      cpp: 'cpp'
    };
    return languageMap[lang] || 'javascript';
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
      
      <div className="monaco-editor-container" style={{ height: '500px', border: '1px solid #ccc' }}>
        <Editor
          height="100%"
          defaultLanguage={getMonacoLanguage(language)}
          language={getMonacoLanguage(language)}
          value={code}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            tabSize: 2,
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible'
            }
          }}
        />
      </div>
      
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