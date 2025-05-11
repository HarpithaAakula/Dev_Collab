import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { initSocket, disconnectSocket } from '../services/socketService';
import CodeCollaborationComponent from '../components/CodeCollaborationComponent';
import ChatComponent from '../components/ChatComponent';
import axios from 'axios';
import { Container, Row, Col, Card, ListGroup } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import UserPointsDisplay from '../components/gamification/UserPointsDisplay';
import { FaUser, FaStar } from 'react-icons/fa';

const CollaborationPage = () => {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);
  const { userPoints } = useGamification();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);

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

  useEffect(() => {
    // This would be replaced with actual socket connection and user list updates
    const mockUsers = [
      { id: 1, name: 'User 1', points: 1000, badges: ['problem_solver'] },
      { id: 2, name: 'User 2', points: 800, badges: ['chatty'] },
      // Add more mock users as needed
    ];
    setUsers(mockUsers);
    setLoading(false);
  }, []);

  const UserList = () => (
    <Card>
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">Active Users</h5>
      </Card.Header>
      <ListGroup variant="flush">
        {users.map((user) => (
          <ListGroup.Item key={user.id}>
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <FaUser className="me-2" />
                <span>{user.name}</span>
              </div>
              <div className="d-flex align-items-center">
                <FaStar className="text-warning me-1" />
                <span>{user.points}</span>
              </div>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Card>
  );

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
    <Container fluid>
      <Row>
        <Col md={9}>
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
        </Col>
        <Col md={3}>
          <div className="sticky-top" style={{ top: '20px' }}>
            <Card className="mb-3">
              <Card.Body>
                <h5 className="card-title">Your Status</h5>
                <UserPointsDisplay />
              </Card.Body>
            </Card>
            <UserList />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default CollaborationPage;