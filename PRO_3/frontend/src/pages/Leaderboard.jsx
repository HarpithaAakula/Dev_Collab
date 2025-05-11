import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Spinner, Button } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { FaTrophy, FaMedal, FaAward } from 'react-icons/fa';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'chart'

  const fetchLeaderboard = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get(
        `http://localhost:5000/api/gamification/leaderboard?page=${pageNum}&limit=10`
      );
      setLeaderboardData(data.leaderboard);
      setTotalPages(data.pagination.pages);
      setPage(data.pagination.page);
    } catch (err) {
      setError('Failed to fetch leaderboard data');
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <FaTrophy className="text-warning" />;
      case 2:
        return <FaMedal className="text-secondary" />;
      case 3:
        return <FaAward className="text-danger" />;
      default:
        return null;
    }
  };

  const TableView = () => (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Rank</th>
          <th>User</th>
          <th>Points</th>
          <th>Badges</th>
        </tr>
      </thead>
      <tbody>
        {leaderboardData.map((user) => (
          <tr key={user.userId}>
            <td className="text-center">
              <div className="d-flex align-items-center justify-content-center">
                {getRankIcon(user.rank)}
                <span className="ms-2">{user.rank}</span>
              </div>
            </td>
            <td>
              <div className="d-flex align-items-center">
                {user.profileImage && (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="rounded-circle me-2"
                    style={{ width: '32px', height: '32px' }}
                  />
                )}
                {user.name}
              </div>
            </td>
            <td>{user.points.toLocaleString()}</td>
            <td>
              <div className="d-flex gap-1">
                {user.badges.map((badge) => (
                  <img
                    key={badge.id}
                    src={badge.icon}
                    alt={badge.name}
                    title={badge.name}
                    style={{ width: '24px', height: '24px' }}
                  />
                ))}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  const ChartView = () => (
    <div style={{ width: '100%', height: '400px' }}>
      <ResponsiveContainer>
        <BarChart
          data={leaderboardData.slice(0, 5)}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="points"
            fill="#8884d8"
            name="Points"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="text-center py-5">
        <div className="alert alert-danger">{error}</div>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>Leaderboard</h1>
        </Col>
        <Col xs="auto">
          <Button
            variant={viewMode === 'table' ? 'primary' : 'outline-primary'}
            className="me-2"
            onClick={() => setViewMode('table')}
          >
            Table View
          </Button>
          <Button
            variant={viewMode === 'chart' ? 'primary' : 'outline-primary'}
            onClick={() => setViewMode('chart')}
          >
            Chart View
          </Button>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          {viewMode === 'table' ? <TableView /> : <ChartView />}
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-center mt-4">
        <Button
          variant="outline-primary"
          onClick={() => fetchLeaderboard(page - 1)}
          disabled={page === 1}
          className="me-2"
        >
          Previous
        </Button>
        <span className="mx-3 align-self-center">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline-primary"
          onClick={() => fetchLeaderboard(page + 1)}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </div>
    </Container>
  );
};

export default Leaderboard; 