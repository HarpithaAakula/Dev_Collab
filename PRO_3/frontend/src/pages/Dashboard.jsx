import React from 'react';
import { Container, Row, Col, Card, ProgressBar } from 'react-bootstrap';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import UserBadgesList from '../components/gamification/UserBadgesList';
import UserPointsDisplay from '../components/gamification/UserPointsDisplay';
import { Link } from 'react-router-dom';
import { FaTrophy, FaMedal, FaAward } from 'react-icons/fa';

const Dashboard = () => {
  const { userInfo } = useContext(AuthContext);
  const { userPoints, userBadges, getUserRank } = useGamification();
  const [userRank, setUserRank] = React.useState(null);

  React.useEffect(() => {
    const fetchRank = async () => {
      const rank = await getUserRank();
      setUserRank(rank);
    };
    fetchRank();
  }, [getUserRank]);

  const getNextBadgeProgress = () => {
    // This is a placeholder - you might want to implement actual progress calculation
    return 65;
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>Dashboard</h1>
        </Col>
        <Col xs="auto">
          <Link to="/leaderboard" className="btn btn-outline-primary">
            View Leaderboard
          </Link>
        </Col>
      </Row>

      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <h5 className="card-title">Welcome, {userInfo?.name}!</h5>
              <div className="mt-3">
                <UserPointsDisplay className="mb-3" />
                {userRank && (
                  <div className="text-center mt-2">
                    <small className="text-muted">Current Rank</small>
                    <h4 className="mb-0">#{userRank}</h4>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Body>
              <h5 className="card-title">Progress to Next Badge</h5>
              <ProgressBar 
                now={getNextBadgeProgress()} 
                label={`${getNextBadgeProgress()}%`}
                className="mb-2"
              />
              <small className="text-muted">
                Keep participating to earn more badges!
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Your Achievements</h5>
                <div className="badge bg-primary">
                  {userBadges.length} Badges
                </div>
              </div>
              <UserBadgesList layout="grid" size="medium" />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Body>
              <h5 className="card-title">Recent Activity</h5>
              <div className="activity-list">
                {/* This would be populated with actual activity data */}
                <div className="activity-item d-flex align-items-center mb-3">
                  <FaTrophy className="text-warning me-3" />
                  <div>
                    <strong>Earned 100 points</strong>
                    <br />
                    <small className="text-muted">2 hours ago</small>
                  </div>
                </div>
                <div className="activity-item d-flex align-items-center mb-3">
                  <FaMedal className="text-secondary me-3" />
                  <div>
                    <strong>Earned "Problem Solver" badge</strong>
                    <br />
                    <small className="text-muted">Yesterday</small>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;