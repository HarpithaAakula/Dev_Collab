import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ChatBox from '../components/Chat/ChatBox';
import { getSocket, joinProblemRoom, sendNewSolution, sendSolutionVote, sendSolutionAccepted } from '../services/socketService';
import { Link } from 'react-router-dom';
import './ProblemDetail.css';

const ProblemDetail = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [solution, setSolution] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const socket = getSocket();

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        console.log(`Fetching problem with ID: ${id}`);
        const response = await axios.get(`http://localhost:5000/api/problems/${id}`);
        console.log('Problem data received:', response.data);
        setProblem(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching problem:', err);
        setError(`Failed to load problem: ${err.message}`);
        setLoading(false);
      }
    };
  
    fetchProblem();

    const socket = getSocket();
    // Join the problem room for real-time updates
    joinProblemRoom(id);

    // Listen for real-time updates
    socket.on('solution_received', (newSolution) => {
      console.log('New solution received:', newSolution);
      setProblem((prevProblem) => ({
        ...prevProblem,
        solutions: [...prevProblem.solutions, newSolution]
      }));
    });

    socket.on('vote_updated', ({ solutionId, votes }) => {
      setProblem((prevProblem) => ({
        ...prevProblem,
        solutions: prevProblem.solutions.map(sol => 
          sol._id === solutionId ? { ...sol, votes } : sol
        )
      }));
    });

    socket.on('acceptance_updated', ({ solutionId }) => {
      setProblem((prevProblem) => ({
        ...prevProblem,
        solutions: prevProblem.solutions.map(sol => 
          sol._id === solutionId 
            ? { ...sol, isAccepted: true } 
            : { ...sol, isAccepted: false }
        )
      }));
    });

    return () => {
      socket.off('solution_received');
      socket.off('vote_updated');
      socket.off('acceptance_updated');
    };
  }, [id]);

  const handleSubmitSolution = async (e) => {
    e.preventDefault();
    if (!solution.trim() || !userInfo) return;

    try {
      const response = await axios.post(
        `http://localhost:5000/api/problems/${id}/solutions`,
        { content: solution },
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`
          }
        }
      );

      // Update local state
      setProblem({
        ...problem,
        solutions: [...problem.solutions, response.data]
      });

      // Emit to socket for real-time update
      sendNewSolution(id, response.data);
      
      setSolution('');
    } catch (err) {
      setError('Failed to submit solution');
    }
  };

  const handleVote = async (solutionId, voteType) => {
    if (!userInfo) return alert('Please login to vote.');

    try {
      const response = await axios.post(
        `http://localhost:5000/api/problems/${id}/solutions/${solutionId}/vote`,
        { voteType },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        }
      );

      // Update local state
      setProblem({
        ...problem,
        solutions: problem.solutions.map(sol => 
          sol._id === solutionId ? { ...sol, votes: response.data.solution.votes } : sol
        )
      });

      // Emit to socket for real-time update
      sendSolutionVote(id, solutionId, response.data.solution.votes);
    } catch (error) {
      alert(error.response?.data?.message || 'Vote failed.');
    }
  };

  const handleAccept = async (solutionId) => {
    if (!userInfo) return alert('Please login to accept a solution.');

    try {
      await axios.post(
        `http://localhost:5000/api/problems/${id}/solutions/${solutionId}/accept`,
        {},
        {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        }
      );

      // Update local state
      setProblem({
        ...problem,
        solutions: problem.solutions.map(sol => 
          sol._id === solutionId 
            ? { ...sol, isAccepted: true } 
            : { ...sol, isAccepted: false }
        )
      });

      // Emit to socket for real-time update
      sendSolutionAccepted(id, solutionId);
    } catch (error) {
      alert(error.response?.data?.message || 'Accept failed.');
    }
  };

  const renderMedia = (media) => {
    if (!media || (!media.images?.length && !media.videos?.length)) return null;
    return (
      <div className="media-section">
        <div className="media-grid">
          {media.images?.map((imageUrl, index) => (
            <div key={`image-${index}`} className="media-item">
              <img
                src={imageUrl}
                alt={`Problem image ${index + 1}`}
                className="media-image"
                onClick={() => window.open(imageUrl, '_blank')}
              />
            </div>
          ))}
          {media.videos?.map((videoUrl, index) => (
            <div key={`video-${index}`} className="media-item">
              <video
                src={videoUrl}
                controls
                className="media-video"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) return <div className="text-center p-5">Loading...</div>;
  if (error) return <div className="text-center p-5 text-red-500">{error}</div>;
  if (!problem) return <div className="text-center p-5">Problem not found</div>;

  return (
    <div className="problem-detail-container">
      <div className="problem-card">
        <h1 className="problem-title">{problem.title}</h1>
        <p className="problem-description">{problem.description}</p>
        {renderMedia(problem.media)}
        <div className="problem-tags">
          {problem.tags.map((tag, index) => (
            <span key={index} className="problem-tag">
              {tag}
            </span>
          ))}
        </div>
        <p className="problem-meta">
          Posted by {problem.user.name} on {new Date(problem.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="solutions-card">
        <h2 className="solutions-title">Solutions ({problem.solutions.length})</h2>
        {problem.solutions.length === 0 ? (
          <p className="solutions-empty">No solutions yet. Be the first to provide a solution!</p>
        ) : (
          <div className="solutions-list">
            {problem.solutions.map((sol) => (
              <div 
                key={sol._id} 
                className={`solution-item ${sol.isAccepted ? 'solution-accepted' : ''}`}
              >
                <p className="solution-content">{sol.content}</p>
                {renderMedia(sol.media)}
                <div className="solution-meta-row">
                  <div className="solution-meta">
                    By {sol.user.name} on {new Date(sol.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    <Link to={`/collaborate/${problem._id}`} className="collaborate-button">
                      Collaborate
                    </Link>
                  </div>
                  <div className="solution-actions">
                    <span className="solution-votes">Votes: {sol.votes}</span>
                    <button 
                      onClick={() => handleVote(sol._id, 'upvote')}
                      className="vote-btn upvote"
                    >
                      👍
                    </button>
                    <button 
                      onClick={() => handleVote(sol._id, 'downvote')}
                      className="vote-btn downvote"
                    >
                      👎
                    </button>
                    {userInfo && problem.user._id === userInfo._id && !sol.isAccepted && (
                      <button 
                        onClick={() => handleAccept(sol._id)}
                        className="accept-btn"
                      >
                        Accept
                      </button>
                    )}
                    {sol.isAccepted && (
                      <span className="accepted-label">
                        ✓ Accepted
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {userInfo ? (
        <div className="add-solution-card">
          <h2 className="add-solution-title">Add Your Solution</h2>
          <form onSubmit={handleSubmitSolution}>
            <textarea
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              className="add-solution-textarea"
              placeholder="Share your solution..."
              required
            ></textarea>
            <button
              type="submit"
              className="add-solution-btn"
            >
              Submit Solution
            </button>
          </form>
        </div>
      ) : (
        <div className="login-reminder">
          Please <a href="/login" className="login-link">login</a> to submit a solution.
        </div>
      )}

      {/* Chat Component */}
      <ChatBox problemId={id} />
    </div>
  );
};

export default ProblemDetail;