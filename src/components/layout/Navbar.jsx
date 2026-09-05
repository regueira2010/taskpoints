// src/components/layout/Navbar.jsx
import React from 'react';
import { Navbar as BootstrapNavbar, Container, Button, Badge } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, userPoints, userLevel, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <BootstrapNavbar className={`${darkMode ? 'navbar-dark bg-dark border-bottom border-secondary' : 'bg-white'} shadow-sm py-2 sticky-top`}>
      <Container fluid className="px-4">
        <div className="d-flex align-items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '32px', fontVariationSettings: "'FILL' 1" }}>
            bolt
          </span>
          <BootstrapNavbar.Brand className="fw-bold text-primary fs-4 mb-0">
            TaskPoints Pro
          </BootstrapNavbar.Brand>
          
          <div className="ms-2">
            <span className="points-badge">
              ⚡ {userPoints} pts
            </span>
          </div>

          {userLevel && (
            <Badge bg={darkMode ? 'dark' : 'light'} text={darkMode ? 'light' : 'dark'} className="border ms-2 d-none d-sm-inline-block">
              {userLevel.icon} {userLevel.name}
            </Badge>
          )}
        </div>
        
        <div className="d-flex align-items-center gap-3">
          <span className={`${darkMode ? 'text-light' : 'text-secondary'} small d-none d-md-inline`}>
            {user?.displayName ? `${user.displayName} (${user.email})` : user?.email}
          </span>

          <Button 
            variant="outline-secondary" 
            size="sm" 
            onClick={toggleDarkMode}
            className="rounded-circle"
            title="Alternar modo oscuro"
          >
            {darkMode ? '☀️' : '🌙'}
          </Button>

          <Button 
            variant="outline-danger" 
            size="sm" 
            onClick={handleLogout}
            className="rounded-pill px-3 fw-semibold"
          >
            Cerrar Sesión
          </Button>
        </div>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;