import React from 'react';
import { Carousel } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext'; // Import AuthContext
import image1 from './img/image1.jpg'; // Import your images
import image2 from './img/image2.jpg';
import image3 from './img/image3.jpg';
import '../App.css'; // Import CSS for styling
import { useContext } from 'react';

function Home() {
  const { userInfo } = useContext(AuthContext); // Get userInfo from AuthContext

  return (
    <div className="home-container">
      <div className="hero-section">
        {/* <h1>Developer Collaboration Platform</h1> */}
        <h1 style={{ fontSize: '2rem', fontWeight: '650' }}>Developer Collaboration Platform</h1>

        <p style={{ fontSize: '1rem'}}>
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

      {/* Carousel Section */}
      <div className="carousel-section">
        <Carousel>
          <Carousel.Item>
            <img className="d-block w-100" src={image1} alt="First slide" />
            <Carousel.Caption>
              <h3>Real-Time Collaboration</h3>
              <p>Work together with other developers in real-time on code, whiteboards, and more.</p>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item>
            <img className="d-block w-100" src={image2} alt="Second slide" />
            <Carousel.Caption>
              <h3>Problem Solving</h3>
              <p>Submit technical challenges and get help from the community.</p>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item>
            <img className="d-block w-100" src={image3} alt="Third slide" />
            <Carousel.Caption>
              <h3>Knowledge Base</h3>
              <p>Access a searchable database of solved problems and solutions.</p>
            </Carousel.Caption>
          </Carousel.Item>
        </Carousel>
      </div>

      {/* About Us Section */}
      <div className="about-us-section">
        <h2>About Us</h2>
        <p>
          We are a platform dedicated to helping developers collaborate, solve problems, and grow together. Our mission is to create a community where developers can share knowledge, work on projects, and earn recognition for their contributions.
        </p>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2>Platform Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Real-Time Collaboration</h3>
            <p>
              Work together with other developers in real-time on code, whiteboards, and more.
            </p>
          </div>
          <div className="feature-card">
            <h3>Problem Solving</h3>
            <p>
              Submit technical challenges and get help from the community.
            </p>
          </div>
          <div className="feature-card">
            <h3>Knowledge Base</h3>
            <p>
              Access a searchable database of solved problems and solutions.
            </p>
          </div>
          <div className="feature-card">
            <h3>Recognition System</h3>
            <p>
              Earn points and badges for your contributions to the community.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;