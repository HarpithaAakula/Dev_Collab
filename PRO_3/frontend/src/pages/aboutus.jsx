import React from 'react';
import { Carousel } from 'react-bootstrap';
import image1 from './img/image1.jpg';
import image2 from './img/image2.jpg';
import image3 from './img/image3.jpg';
import '../App.css';

function AboutUs() {
  return (
    <div className="about-us-container">
      {/* Carousel Section - Moved to top */}
      <div className="carousel-section">
        <Carousel>
          <Carousel.Item>
            <div className="carousel-content">
              <div className="carousel-text">
                <h3>Real-Time Collaboration</h3>
                <p>Experience seamless collaboration with our advanced real-time editing and communication tools.</p>
              </div>
              <div className="carousel-image">
                <img src={image1} alt="Real-Time Collaboration" />
              </div>
            </div>
          </Carousel.Item>
          <Carousel.Item>
            <div className="carousel-content">
              <div className="carousel-text">
                <h3>Problem Solving</h3>
                <p>Join a community of problem-solvers and get help with your technical challenges.</p>
              </div>
              <div className="carousel-image">
                <img src={image2} alt="Problem Solving" />
              </div>
            </div>
          </Carousel.Item>
          <Carousel.Item>
            <div className="carousel-content">
              <div className="carousel-text">
                <h3>Knowledge Base</h3>
                <p>Access our comprehensive knowledge base of solutions and best practices.</p>
              </div>
              <div className="carousel-image">
                <img src={image3} alt="Knowledge Base" />
              </div>
            </div>
          </Carousel.Item>
        </Carousel>
      </div>

      {/* Hero Section */}
      <div className="about-hero-section">
        <h1>About Our Platform</h1>
        <p className="subtitle">
          Empowering developers to collaborate, innovate, and grow together
        </p>
      </div>

      {/* Mission Section */}
      <div className="mission-section">
        <h2>Our Mission</h2>
        <p>
          We are dedicated to creating a vibrant ecosystem where developers can connect, collaborate, 
          and create amazing solutions together. Our platform bridges the gap between developers, 
          enabling knowledge sharing, problem-solving, and professional growth in a supportive environment.
        </p>
      </div>

      {/* Vision Section */}
      <div className="vision-section">
        <h2>Our Vision</h2>
        <p>
          We envision a world where every developer has access to a supportive community, 
          where knowledge flows freely, and where collaboration leads to innovation. 
          Our platform aims to be the catalyst for this transformation, making software 
          development more accessible, collaborative, and rewarding for everyone.
        </p>
      </div>

      {/* Core Values */}
      <div className="values-section">
        <h2>Our Core Values</h2>
        <div className="values-grid">
          <div className="value-card">
            <h3>Collaboration</h3>
            <p>We believe in the power of working together to achieve greater results.</p>
          </div>
          <div className="value-card">
            <h3>Innovation</h3>
            <p>We encourage creative thinking and continuous improvement.</p>
          </div>
          <div className="value-card">
            <h3>Community</h3>
            <p>We foster a supportive environment where everyone can grow and succeed.</p>
          </div>
          <div className="value-card">
            <h3>Excellence</h3>
            <p>We strive for the highest quality in everything we do.</p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="team-section">
        <h2>Our Team</h2>
        <p>
          We are a diverse team of passionate developers, designers, and technology enthusiasts 
          committed to building the best platform for developer collaboration. Our team brings 
          together decades of combined experience in software development, community building, 
          and platform architecture.
        </p>
      </div>

      {/* Enhanced Contact Section */}
      <div className="contact-section">
        <h2>Get in Touch</h2>
        <div className="contact-grid">
          <div className="contact-info">
            <h3>Contact Information</h3>
            <div className="contact-item">
              <i className="fas fa-envelope"></i>
              <p>Email: support@devcollab.com</p>
            </div>
            <div className="contact-item">
              <i className="fas fa-phone"></i>
              <p>Phone: +91 xxx 123-4567</p>
            </div>
            <div className="contact-item">
              <i className="fas fa-map-marker-alt"></i>
              <p>Address: BMSIT,Bengaluru,IN 560064</p>
            </div>
          </div>
          <div className="contact-hours">
            <h3>Business Hours</h3>
            <p>Monday - Friday: 9:00 AM - 6:00 PM PST</p>
            <p>Saturday: 10:00 AM - 4:00 PM PST</p>
            <p>Sunday: Closed</p>
          </div>
        </div>
        <div className="contact-social">
          <h3>Follow Us</h3>
          <div className="social-links">
            <a href="https://twitter.com/devcollab" target="_blank" rel="noopener noreferrer">Twitter</a>
            <a href="https://linkedin.com/company/devcollab" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="https://github.com/HarpithaAakula/Dev_Collab" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;