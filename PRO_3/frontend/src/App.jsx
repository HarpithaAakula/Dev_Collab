import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Carousel from 'react-bootstrap/Carousel';
// import ExampleCarouselImage from 'components/ExampleCarouselImage';
import Layout from './components/Layout';
import Home from './pages/Home';
import Aboutus from './pages/aboutus';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProblemList from './pages/ProblemList';
import ProblemDetail from './pages/ProblemDetail';
import SubmitProblem from './pages/SubmitProblem';
import { AuthProvider } from './context/AuthContext';
import { initSocket, disconnectSocket } from './services/socketService';
import CollaborationPage from './pages/CollaborationPage'
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  useEffect(() => {
    // Initialize socket connection when the app mounts
    initSocket();

    // Clean up socket connection when the app unmounts
    return () => {
      disconnectSocket();
    };
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/aboutus" element={<Aboutus />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/problems" element={<ProblemList />} />
            <Route path="/collaborate/:problemId" element={<CollaborationPage />} />
            <Route path="/problems/:id" element={<ProblemDetail />} />
            <Route path="/submit-problem" element={<SubmitProblem />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;