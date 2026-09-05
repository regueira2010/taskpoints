// src/components/dashboard/NewTaskModal.jsx
import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';

const NewTaskModal = ({ show, onHide, onCreate }) => {
  const { user, users } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('hacer');
  const [delegatedEmail, setDelegatedEmail] = useState('');
  const [error, setError] = useState('');

  // Filtrar todos los usuarios disponibles excepto el usuario logueado actualmente
  const availableUsers = (users || []).filter(
    (u) => u.email.toLowerCase() !== user?.email?.toLowerCase()
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('El título es requerido');
      return;
    }

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      level,
    };

    if (level === 'delegar') {
      if (!delegatedEmail.trim()) {
        setError('Debes seleccionar un compañero para delegar la tarea');
        return;
      }
      taskData.delegatedEmail = delegatedEmail.trim().toLowerCase();
    }

    const result = await onCreate(taskData);
    if (result && result.success !== false) {
      setTitle('');
      setDescription('');
      setLevel('hacer');
      setDelegatedEmail('');
      setError('');
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">Nueva Tarea</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger" className="small">{error}</Alert>}
          
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small">Título *</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Revisar documentación de arquitectura"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small">Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles adicionales, enlaces o contexto..."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small">Cuadrante de Eisenhower</Form.Label>
            <Form.Select value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="hacer">⚡ Hacer (Urgente e Importante) - 24 horas (+20 pts)</option>
              <option value="programar">📅 Programar (Importante, No Urgente) - 7 días (+10 pts)</option>
              <option value="delegar">👥 Delegar (Urgente, No Importante) - Costo 15 pts</option>
              <option value="eliminar">🗑️ Eliminar (Ni Urgente ni Importante) - Costo 5 pts</option>
            </Form.Select>
            <Form.Text className="text-muted small">
              {level === 'hacer' && 'Tarea prioritaria. Debe completarse en menos de 24h.'}
              {level === 'programar' && 'Planificación estratégica. Deadline de 7 días.'}
              {level === 'delegar' && 'Transfiere la tarea a un compañero del equipo. Deduce 15 puntos.'}
              {level === 'eliminar' && 'Tarea prescindible que consume tiempo innecesario.'}
            </Form.Text>
          </Form.Group>

          {/* Selector desplegable de usuarios disponibles en el store */}
          {level === 'delegar' && (
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small text-success">
                👥 Asignar a compañero *
              </Form.Label>
              <Form.Select
                value={delegatedEmail}
                onChange={(e) => setDelegatedEmail(e.target.value)}
                required
              >
                <option value="">-- Selecciona un compañero registrado --</option>
                {availableUsers.map((u) => (
                  <option key={u.uid} value={u.email}>
                    {u.displayName} ({u.email}) — Nivel {u.level?.name} {u.level?.icon}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted small">
                Al crear la tarea, se descontarán 15 puntos de tu saldo y se enviará al tablero del compañero.
              </Form.Text>
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" className="px-4 fw-semibold">
            Crear Tarea
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default NewTaskModal;