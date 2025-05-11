import React, { useContext } from 'react';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationIcon from './notifications/NotificationIcon';
import UserPointsDisplay from './gamification/UserPointsDisplay';
import './Layout.css';

const Layout = () => {
  const { userInfo, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">CodeCollab</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/aboutus">About Us</Nav.Link>
              <Nav.Link as={Link} to="/leaderboard">Leaderboard</Nav.Link>
              {userInfo ? (
                <>
                  <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                  <Nav.Link as={Link} to="/problems">Problems</Nav.Link>
                  <Nav.Link as={Link} to="/submit-problem">Submit Problem</Nav.Link>
                </>
              ) : null}
            </Nav>
            <Nav>
              {userInfo ? (
                <>
                  <UserPointsDisplay className="me-3" />
                  <Nav.Link as={Link} to="/notifications">Notifications</Nav.Link>
                  <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login">Login</Nav.Link>
                  <Nav.Link as={Link} to="/register">Register</Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
      <main>
        <Outlet />
      </main>
      
      <footer className="text-center py-4 mt-4 bg-light">
        <Container>
          <p>&copy; {new Date().getFullYear()} Problem Solver Hub. All rights reserved.</p>
        </Container>
      </footer>
    </>
  );
};

export default Layout;