import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// import img from './img/image1.jpg'
import img1 from './img/down.png';
function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    
    if (!userInfo) {
      navigate('/login');
      return;
    }
    
    const fetchProfile = async () => {
      try {
        const { token } = JSON.parse(userInfo);
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        
        const { data } = await axios.get('http://localhost:5000/api/users/profile', config);
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        localStorage.removeItem('userInfo');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <h2>Welcome, {user?.name}</h2>
      
      <div className="user-profile">
        <h3>Your Profile</h3>
        <img src={img1} alt="Your Image" ></img>
        <p><strong>Email :</strong> {user?.email}</p>
        <p><strong>Role :</strong> {user?.role}</p>
        <p><strong>Points :</strong> {user?.points}</p>
        {user?.bio && (
          <div className="bio-section">
            <h4>Bio</h4>
            <p>{user.bio}</p>
          </div>
        )}
        
        {user?.expertise && user.expertise.length > 0 && (
          <div className="expertise-section">
            <h4>Expertise</h4>
            <ul>
              {user.expertise.map((skill, index) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
    </div>
  );
}

export default Dashboard;