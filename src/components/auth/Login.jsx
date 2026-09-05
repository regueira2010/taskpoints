import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Badge } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const DEMO_ACCOUNTS = [
  { name: 'Ana García', email: 'ana@ejemplo.com', password: 'password123', level: 'Bronce 🥉', points: 0 },
  { name: 'Carlos Méndez', email: 'carlos@ejemplo.com', password: 'password123', level: 'Bronce 🥉', points: 0 },
  { name: 'Lucía Fernández', email: 'lucia@ejemplo.com', password: 'password123', level: 'Bronce 🥉', points: 0 },
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, resetToDemoData } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Correo o contraseña incorrectos');
    }
    setLoading(false);
  };

  const fillDemoAccount = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <Container className="min-vh-100 d-flex align-items-center justify-content-center py-4">
      <Row className="w-100 justify-content-center">
        <Col md={8} lg={5}>
          <Card className="shadow-lg border-0 rounded-4">
            <Card.Body className="p-4 p-md-5">
              <div className="text-center mb-4">
                <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle mb-3" style={{ width: '64px', height: '64px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>bolt</span>
                </div>
                <h1 className="h3 fw-bold mb-1">TaskPoints</h1>
                <p className="text-muted small">Inicia sesión para acceder a tu matriz estratégica de tareas</p>
              </div>

              {error && <Alert variant="danger" className="small">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold">Correo Electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="ejemplo: ana@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="py-2"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="small fw-semibold">Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Contraseña (ej: password123)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="py-2"
                  />
                </Form.Group>

                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-100 py-2 fw-semibold rounded-pill mb-3"
                  disabled={loading}
                >
                  {loading ? 'Comprobando credenciales...' : 'Iniciar Sesión'}
                </Button>
              </Form>

              {/* Guía Rápida de Cuentas Demo Precargadas */}
              <div className="mt-4 pt-3 border-top">
                <p className="small text-muted fw-semibold mb-2">
                  👥 Cuentas de prueba precargadas (clic para rellenar):
                </p>
                <div className="d-flex flex-column gap-2">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => fillDemoAccount(acc.email, acc.password)}
                      className="btn btn-outline-light text-dark border text-start p-2 rounded-3 d-flex justify-content-between align-items-center hover-bg-light"
                      style={{ fontSize: '0.82rem' }}
                    >
                      <div>
                        <strong>{acc.name}</strong> <span className="text-muted">({acc.email})</span>
                        <div className="text-secondary small">Contraseña: <code>{acc.password}</code></div>
                      </div>
                      <Badge bg="primary" className="rounded-pill">{acc.level}</Badge>
                    </button>
                  ))}
                </div>
                <div className="text-center mt-2">
                  <button
                    type="button"
                    onClick={resetToDemoData}
                    className="btn btn-link text-muted p-0 text-decoration-none"
                    style={{ fontSize: '0.75rem' }}
                    title="Restaura usuarios y tareas a los valores limpios por defecto"
                  >
                    🔄 ¿Datos residuales? Restablecer datos de prueba
                  </button>
                </div>
              </div>

              <div className="text-center mt-4">
                <Link to="/register" className="text-decoration-none small text-muted">
                  ¿No tienes cuenta? <span className="text-primary fw-semibold">Regístrate</span>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;