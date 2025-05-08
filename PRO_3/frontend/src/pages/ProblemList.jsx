import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function ProblemList() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/problems');
        setProblems(data.problems);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch problems');
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      // If search is empty, fetch all problems
      try {
        const { data } = await axios.get('http://localhost:5000/api/problems');
        setProblems(data.problems);
      } catch (error) {
        setError('Failed to fetch problems');
      }
      return;
    }
    
    try {
      const { data } = await axios.get(`http://localhost:5000/api/problems/search?q=${searchTerm}`);
      setProblems(data);
    } catch (error) {
      setError('Search failed');
    }
  };

  return (
    <div className="problems-container">
      <div className="problems-header">
        <h1>Technical Problems</h1>
        <Link to="/submit-problem" className="btn-primary">
          Submit New Problem
        </Link>
      </div>

      <div className="search-bar">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search problems..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="problems-list">
          {problems.length === 0 ? (
            <p>No problems found. Be the first to submit one!</p>
          ) : (
            problems.map((problem) => (
              <div key={problem._id} className="problem-card">
                <h3>
                  <Link to={`/problems/${problem._id}`}>{problem.title}</Link>
                </h3>
                <div className="problem-meta">
                  <span className={`status-badge ${problem.status}`}>
                    {problem.status}
                  </span>
                  <span className="solutions-count">
                    {problem.solutions?.length || 0} solutions
                  </span>
                  <span className="views-count">
                    {problem.viewCount} views
                  </span>
                </div>
                <div className="problem-tags">
                  {problem.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="problem-submitter">
                  Posted by {problem.user?.name || 'Anonymous'}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default ProblemList;