import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SubmitProblem.css';

function SubmitProblem() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [media, setMedia] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setMedia(files);
  };

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
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('tags', tags);
      
      // Append each media file
      media.forEach((file) => {
        formData.append('media', file);
      });
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      };
      
      const { data } = await axios.post(
        'http://localhost:5000/api/problems',
        formData,
        config
      );
      
      setSubmitting(false);
      navigate(`/problems/${data._id}`);
    } catch (error) {
      let errorMessage = 'Failed to submit problem';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = error.response.data.message || error.response.data.error || errorMessage;
        
        // Handle specific error cases
        if (error.response.status === 413) {
          errorMessage = 'File size too large. Maximum size is 50MB per file.';
        } else if (error.response.status === 415) {
          errorMessage = 'Invalid file type. Only images and videos are allowed.';
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your internet connection.';
      }
      
      setError(errorMessage);
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

        <div className="form-group">
          <label htmlFor="media">Media Files (Images/Videos)</label>
          <input
            type="file"
            id="media"
            onChange={handleFileChange}
            multiple
            accept="image/*,video/*"
            className="file-input"
          />
          <small className="file-info">
            You can upload up to 5 files. Supported formats: JPG, PNG, GIF, MP4, MOV, AVI. Max size: 50MB per file.
          </small>
          {media.length > 0 && (
            <div className="selected-files">
              <p>Selected files ({media.length}):</p>
              <ul>
                {media.map((file, index) => (
                  <li key={index}>
                    {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </li>
                ))}
              </ul>
            </div>
          )}
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