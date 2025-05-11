import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { initSocket, disconnectSocket } from '../services/socketService';
import CodeCollaborationComponent from '../components/CodeCollaborationComponent';
import ChatComponent from '../components/ChatComponent';
import axios from 'axios';

const CollaborationPage = () => {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize socket and fetch problem details
  useEffect(() => {
    // Initialize socket connection
    initSocket();
    
    // Fetch problem details
    const fetchProblem = async () => {
      try {
        const response = await axios.get(`/api/problems/${problemId}`);
        setProblem(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching problem:', err);
        setError('Failed to load problem details');
        setLoading(false);
      }
    };
    
    fetchProblem();
    
    // Cleanup socket on unmount
    return () => {
      disconnectSocket();
    };
  }, [problemId]);

  if (loading) {
    return <div className="loading-container">Loading problem details...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/problems')}>
          Back to Problems
        </button>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="not-found-container">
        <h2>Problem Not Found</h2>
        <p>The problem you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/problems')}>
          Back to Problems
        </button>
      </div>
    );
  }

  return (
    <div className="collaboration-page">
      <div className="problem-header">
        <h1>{problem.title}</h1>
        <p className="problem-description">{problem.description}</p>
        <div className="problem-metadata">
          <span className="difficulty-level">Difficulty: {problem.difficulty}</span>
          <span className="separator">•</span>
          <span className="category">Category: {problem.category}</span>
        </div>
      </div>
      
      <div className="collaboration-area">
        <div className="code-section">
          <h2>Code Collaboration</h2>
          <CodeCollaborationComponent problemId={problemId} />
        </div>
        
        <div className="chat-section">
          <ChatComponent problemId={problemId} />
        </div>
      </div>
      
      <div className="action-buttons">
        <button 
          className="action-button view-solutions"
          onClick={() => navigate(`/problems/${problemId}`)}
        >
          View Solutions
        </button>
        <button 
          className="action-button back-to-problems"
          onClick={() => navigate('/problems')}
        >
          Back to Problems
        </button>
      </div>
    </div>
  );
};

export default CollaborationPage;