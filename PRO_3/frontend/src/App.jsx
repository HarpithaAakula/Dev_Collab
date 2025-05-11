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
import Notifications from './pages/Notifications';
import Leaderboard from './pages/Leaderboard';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/notificationContext';
import { initSocket, disconnectSocket } from './services/socketService';
import CollaborationPage from './pages/CollaborationPage'
import 'bootstrap/dist/css/bootstrap.min.css';
import { GamificationProvider } from './context/GamificationContext';

// Import gamification components
import UserPointsDisplay from './components/gamification/UserPointsDisplay';
import UserBadgesList from './components/gamification/UserBadgesList';

function App() {
  useEffect(() => {
    // Initialize socket connection when the app mounts
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      initSocket(token);
    }
    else{
      initSocket();
    }

    // Clean up socket connection when the app unmounts
    return () => {
      disconnectSocket();
    };
  }, []);

  return (
    <AuthProvider>
      <GamificationProvider>
        <NotificationProvider>
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
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
              </Route>
            </Routes>
          </Router>
        </NotificationProvider>
      </GamificationProvider>
    </AuthProvider>
  );
}

export default App;