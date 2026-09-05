// src/components/dashboard/Dashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Card, Badge, Spinner } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useConfetti } from "../../hooks/useConfetti";
import Navbar from "../layout/Navbar";
import KanbanBoard from "./KanbanBoard";
import ProductivityChart from "./ProductivityChart";

const Dashboard = () => {
  const { user, userPoints, userLevel, userStreak, maxStreak, loading } = useAuth();
  const { darkMode } = useTheme();
  const { triggerConfetti } = useConfetti();
  const [nextLevel, setNextLevel] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const prevPoints = useRef(null);

  useEffect(() => {
    // Calcular puntos para siguiente nivel
    const levels = [
      { name: "Plata", minPoints: 500 },
      { name: "Oro", minPoints: 2000 },
      { name: "Diamante", minPoints: 5000 },
    ];

    const next = levels.find((l) => l.minPoints > userPoints);
    if (next) {
      const remaining = next.minPoints - userPoints;
      setNextLevel({ name: next.name, remaining });
    } else {
      setNextLevel(null);
    }
  }, [userPoints]);

  // Sincronizar el estado de carga inicial y guardar puntos base
  useEffect(() => {
    if (!loading && !hasLoaded) {
      setHasLoaded(true);
      prevPoints.current = userPoints;
    }
  }, [loading, userPoints, hasLoaded]);

  // Mostrar confeti solo cuando los puntos aumenten tras la carga inicial
  useEffect(() => {
    if (hasLoaded && prevPoints.current !== null && userPoints > prevPoints.current) {
      triggerConfetti();
    }
    if (hasLoaded) {
      prevPoints.current = userPoints;
    }
  }, [userPoints, hasLoaded, triggerConfetti]);

  return (
    <div className={darkMode ? "dark-mode" : ""}>
      <Navbar />

      <Container fluid className="mt-3 px-4">
        {/* Tarjeta de Estadísticas del Usuario */}
        <Row className="mb-4">
          <Col md={3} sm={6} className="mb-3">
            <Card className="shadow-sm h-100">
              <Card.Body className="text-center">
                <div className="display-4">{userLevel.icon}</div>
                <h5 className="mb-0">{userLevel.name}</h5>
                <small className="text-muted">Nivel</small>
                <div className="mt-2">
                  <div className="progress" style={{ height: "8px" }}>
                    <div
                      className="progress-bar"
                      style={{
                        width: `${Math.min(100, ((userPoints - userLevel.minPoints) / (nextLevel?.remaining ? nextLevel.remaining + userPoints - userLevel.minPoints : 1)) * 100)}%`,
                        backgroundColor: userLevel.color,
                      }}
                    />
                  </div>
                  <small className="text-muted">
                    {nextLevel
                      ? `${nextLevel.remaining} pts para ${nextLevel.name}`
                      : "¡Nivel máximo!"}
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} sm={6} className="mb-3">
            <Card className="shadow-sm h-100">
              <Card.Body className="text-center">
                <div className="display-4">⚡</div>
                <h5 className="mb-0">{userPoints}</h5>
                <small className="text-muted">Puntos Totales</small>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} sm={6} className="mb-3">
            <Card className="shadow-sm h-100">
              <Card.Body className="text-center">
                <div className="display-4">🔥</div>
                <h5 className="mb-0">{userStreak}</h5>
                <small className="text-muted">Racha actual</small>
                {maxStreak > 0 && (
                  <div>
                    <small className="text-muted">
                      Máxima: {maxStreak} días
                    </small>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} sm={6} className="mb-3">
            <Card className="shadow-sm h-100">
              <Card.Body className="text-center">
                <div className="display-4">📅</div>
                <h5 className="mb-0">Productividad</h5>
                <small className="text-muted">Últimos 7 días</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        {/* Gráfico de Productividad */}
        <Row className="mb-4">
          <Col xs={12}>
            <ProductivityChart />
          </Col>
        </Row>
        {/* Kanban Board */}
        <KanbanBoard />
      </Container>
    </div>
  );
};

export default Dashboard;
