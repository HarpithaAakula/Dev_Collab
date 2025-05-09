import React, { useContext } from 'react';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { Link, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationIcon from './notifications/NotificationIcon';
import './Layout.css';

const Layout = () => {
  const { userInfo, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <Navbar bg="light" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/">Problem Solver Hub</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/problems">Problems</Nav.Link>
              <Nav.Link as={Link} to="/aboutus">About Us</Nav.Link>
            </Nav>
            <Nav>
              {userInfo ? (
                <>
                  {/* Notification Icon */}
                  <div className="nav-notification-icon">
                    <NotificationIcon />
                  </div>
                  
                  <NavDropdown title={userInfo.name} id="basic-nav-dropdown" align="end">
                    <NavDropdown.Item as={Link} to="/dashboard">Dashboard</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/submit-problem">Submit Problem</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/notifications">Notifications</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                  </NavDropdown>
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