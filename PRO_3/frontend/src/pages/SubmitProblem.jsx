import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function SubmitProblem() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get token from localStorage
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      navigate('/login');
      return;
    }
    
    const { token } = JSON.parse(userInfo);
    
    setSubmitting(true);
    setError('');
    
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      
      const { data } = await axios.post(
        'http://localhost:5000/api/problems',
        { title, description, tags },
        config
      );
      
      setSubmitting(false);
      navigate(`/problems/${data._id}`);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit problem');
      setSubmitting(false);
    }
  };

  return (
    <div className="submit-problem-container">
      <h1>Submit a New Problem</h1>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Problem Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a descriptive title"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            rows="10"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your problem in detail. Include any relevant code, error messages, and context."
            required
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="tags">Tags</label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Enter tags separated by commas (e.g. javascript, react, api)"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={submitting}
          className="btn-primary"
        >
          {submitting ? 'Submitting...' : 'Submit Problem'}
        </button>
      </form>
    </div>
  );
}

export default SubmitProblem;