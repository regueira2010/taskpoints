import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const { user, reloadUser, logout } = useAuth();
  const [checking, setChecking] = useState(false);
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  const handleCheckVerification = async () => {
    setChecking(true);
    try {
      const refreshedUser = await reloadUser();
      if (refreshedUser && refreshedUser.emailVerified) {
        toast.success('¡Correo verificado con éxito! Bienvenido.');
        navigate('/dashboard');
      } else {
        toast.error('El correo aún no ha sido verificado. Revisa tu bandeja de entrada o spam.');
      }
    } catch (error) {
      console.error('Error reloading user:', error);
      toast.error('Error al comprobar la verificación.');
    }
    setChecking(false);
  };

  const handleResendEmail = async () => {
    setSending(true);
    setTimeout(() => {
      toast.success('Enlace de verificación enviado a tu correo.');
      setSending(false);
    }, 600);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Container className="min-vh-100 d-flex align-items-center justify-content-center">
      <Row className="w-100 justify-content-center">
        <Col md={8} lg={5}>
          <Card className="shadow border-0 rounded-4">
            <Card.Body className="p-4 text-center">
              <div className="mb-4">
                <span className="material-symbols-outlined text-warning" style={{ fontSize: '64px' }}>
                  mark_email_read
                </span>
              </div>
              
              <h2 className="fw-bold mb-3">Verifica tu correo</h2>
              <p className="text-muted mb-4">
                Hemos enviado un enlace de confirmación a: <br />
                <strong className="text-dark">{user?.email}</strong>
              </p>

              <Alert variant="info" className="small text-start mb-4">
                Debes confirmar tu correo electrónico antes de poder acceder al tablero de TaskPoints. Si no lo encuentras, revisa la carpeta de <strong>Correo no deseado (Spam)</strong>.
              </Alert>

              <div className="d-grid gap-2 mb-3">
                <Button 
                  variant="primary" 
                  onClick={handleCheckVerification} 
                  disabled={checking || sending}
                  className="py-2 fw-semibold rounded-pill"
                >
                  {checking ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Comprobando...
                    </>
                  ) : (
                    'Ya verifiqué mi correo'
                  )}
                </Button>
                
                <Button 
                  variant="outline-secondary" 
                  onClick={handleResendEmail} 
                  disabled={checking || sending}
                  className="py-2 rounded-pill"
                >
                  {sending ? 'Reenviando...' : 'Reenviar enlace de verificación'}
                </Button>
              </div>

              <div className="mt-3 border-top pt-3">
                <Button 
                  variant="link" 
                  onClick={handleLogout}
                  className="text-danger text-decoration-none"
                >
                  Cerrar Sesión / Usar otra cuenta
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default VerifyEmail;
