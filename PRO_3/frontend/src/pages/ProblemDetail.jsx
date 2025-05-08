import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ChatBox from '../components/Chat/ChatBox';
import { getSocket, joinProblemRoom, sendNewSolution, sendSolutionVote, sendSolutionAccepted } from '../services/socketService';
import { Link } from 'react-router-dom';


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

  if (loading) return <div className="text-center p-5">Loading...</div>;
  if (error) return <div className="text-center p-5 text-red-500">{error}</div>;
  if (!problem) return <div className="text-center p-5">Problem not found</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">{problem.title}</h1>
        <p className="text-gray-700 mb-4">{problem.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {problem.tags.map((tag, index) => (
            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              {tag}
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-500">
          Posted by {problem.user.name} on {new Date(problem.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Solutions ({problem.solutions.length})</h2>
        {problem.solutions.length === 0 ? (
          <p className="text-gray-500">No solutions yet. Be the first to provide a solution!</p>
        ) : (
          <div className="space-y-4">
            {problem.solutions.map((sol) => (
              <div 
                key={sol._id} 
                className={`p-4 border rounded-lg ${sol.isAccepted ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
              >
                <p className="mb-2">{sol.content}</p>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    By {sol.user.name} on {new Date(sol.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                  <Link to={`/collaborate/${problem._id}`} className="collaborate-button">
                      Collaborate
                    </Link>
                    </div>
                  <div className="flex items-center gap-2">
                  
                    <span className="text-gray-700">Votes: {sol.votes}</span>
                    
                    <button 
                      onClick={() => handleVote(sol._id, 'upvote')}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
                    >
                      👍
                    </button>
                    <button 
                      onClick={() => handleVote(sol._id, 'downvote')}
                      className="bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200"
                    >
                      👎
                    </button>
                    {userInfo && problem.user._id === userInfo._id && !sol.isAccepted && (
                      <button 
                        onClick={() => handleAccept(sol._id)}
                        className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                      >
                        Accept
                      </button>
                    )}
                    {sol.isAccepted && (
                      <span className="bg-green-500 text-white px-2 py-1 rounded">
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
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Add Your Solution</h2>
          <form onSubmit={handleSubmitSolution}>
            <textarea
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              className="w-full p-2 border rounded-lg mb-4 min-h-[120px]"
              placeholder="Share your solution..."
              required
            ></textarea>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Submit Solution
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-center">
          Please <a href="/login" className="text-blue-500 hover:underline">login</a> to submit a solution.
        </div>
      )}

      {/* Chat Component */}
      <ChatBox problemId={id} />
    </div>
  );
};

export default ProblemDetail;