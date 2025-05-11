import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function Home() {
    const { userInfo } = useContext(AuthContext);

    return (
      <div className="home-container">
        <div className="hero-section">
          <h1>Developer Collaboration Platform</h1>
          <p>
            Connect with fellow developers, solve problems together, and build amazing solutions
          </p>
          {!userInfo && (
            <div className="cta-buttons">
              <a href="/register" className="cta-button primary">
                Get Started
              </a>
              <a href="/login" className="cta-button secondary">
                Sign In
              </a>
            </div>
          )}
        </div>
        
        <div className="features-section">
          <h2>Platform Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Real-Time Collaboration</h3>
              <p>
                Work together with other developers in real-time on code, whiteboards, and more
              </p>
            </div>
            <div className="feature-card">
              <h3>Problem Solving</h3>
              <p>
                Submit technical challenges and get help from the community
              </p>
            </div>
            <div className="feature-card">
              <h3>Knowledge Base</h3>
              <p>
                Access a searchable database of solved problems and solutions
              </p>
            </div>
            <div className="feature-card">
              <h3>Recognition System</h3>
              <p>
                Earn points and badges for your contributions to the community
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  export default Home;