// src/components/dashboard/TaskCard.jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Form, Alert } from 'react-bootstrap';
import { useTasks } from '../../contexts/TasksContext';
import { useAuth } from '../../contexts/AuthContext';

const TaskCard = ({ task }) => {
  const { completeTask, redoTask, deleteTask, respondToDelegation } = useTasks();
  const { user, userPoints } = useAuth();
  const [timeLeft, setTimeLeft] = useState('');
  const [showDeleteReason, setShowDeleteReason] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  // Identificación de roles en la tarea
  const isCreator = task.userId === user?.uid;
  const isDelegatee = task.delegatedToUid === user?.uid || (Boolean(user?.email && task.delegatedToEmail && task.delegatedToEmail.toLowerCase() === user?.email.toLowerCase()));
  const isDelegatedTask = Boolean(task.delegatedToUid || task.delegatedToEmail);
  const isPendingDelegation = isDelegatedTask && task.delegationStatus === 'pending';
  const isAcceptedDelegation = isDelegatedTask && task.delegationStatus === 'accepted';

  const isExpired = task.deadline && new Date(task.deadline) < new Date();
  const isUrgent = task.deadline && (new Date(task.deadline) - new Date()) < 2 * 60 * 60 * 1000 && !isExpired;

  // 1. Solo el asignado puede aceptar o rechazar si la delegación está pendiente
  const canRespondDelegation = isPendingDelegation && isDelegatee;

  // 2. ¿Quién puede completar la tarea?
  // - Si NO está delegada: el creador original.
  // - Si ESTÁ delegada y aceptada: ÚNICAMENTE el asignado (isDelegatee).
  // - El creador original NUNCA puede completarla mientras esté delegada a otra persona.
  const canComplete = 
    task.status === 'active' && 
    !isExpired && 
    (
      (!isDelegatedTask && isCreator) || 
      (isAcceptedDelegation && isDelegatee)
    );

  // 3. Rehacer tareas vencidas: el creador original puede rehacer y traer de vuelta la tarea
  const canRedo = isExpired && task.status === 'active' && task.retryCount < 3 && isCreator;

  // 4. Eliminar tareas: solo el creador en el cuadrante eliminar
  const canDelete = isCreator && task.level === 'eliminar' && task.status === 'active';

  // Contador de tiempo restante
  useEffect(() => {
    const updateTimer = () => {
      if (!task.deadline) return;
      
      const now = new Date();
      const deadline = new Date(task.deadline);
      const diff = deadline - now;
      
      if (diff <= 0) {
        setTimeLeft('Expirada');
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      
      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [task.deadline]);

  const getLevelClass = () => {
    switch (task.level) {
      case 'hacer': return 'level-hacer';
      case 'programar': return 'level-programar';
      case 'delegar': return 'level-delegar';
      case 'eliminar': return 'level-eliminar';
      default: return '';
    }
  };

  const getPointsColor = () => {
    switch (task.level) {
      case 'hacer': return 'text-danger';
      case 'programar': return 'text-info';
      case 'delegar': return 'text-success';
      default: return 'text-secondary';
    }
  };

  const handleComplete = async () => {
    await completeTask(task.id, task);
  };

  const handleRedo = async () => {
    if (userPoints < 5) {
      alert('No tienes suficientes puntos para rehacer (cuesta 5 pts)');
      return;
    }
    await redoTask(task.id, task);
  };

  const handleDelete = async () => {
    if (!deleteReason.trim()) {
      alert('Por favor, explica el motivo de eliminación');
      return;
    }
    await deleteTask(task.id, deleteReason);
    setShowDeleteReason(false);
    setDeleteReason('');
  };

  const handleDelegationResponse = async (accept) => {
    await respondToDelegation(task.id, accept);
  };

  const getCardClass = () => {
    let classes = '';
    if (isExpired) classes = 'task-expired';
    else if (isUrgent) classes = 'task-urgent';
    return classes;
  };

  return (
    <Card className={`task-card shadow-sm border-0 ${getCardClass()}`}>
      <Card.Body className="p-3">
        {/* Header: Badges + Puntos */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="d-flex gap-1 flex-wrap">
            <span className={`level-badge ${getLevelClass()}`}>
              {task.level.toUpperCase()}
            </span>
            {isExpired && <span className="level-badge bg-danger">EXPIRADO</span>}
            {isUrgent && <span className="level-badge bg-warning text-dark">URGENTE</span>}
            {task.delegationStatus === 'pending' && <span className="level-badge bg-secondary">PENDIENTE</span>}
            {task.delegationStatus === 'accepted' && <span className="level-badge bg-success">ACEPTADA</span>}
          </div>
          <span className={`fw-bold small ${getPointsColor()}`}>
            +{task.pointsEarned || (task.level === 'hacer' ? 20 : task.level === 'programar' ? 10 : 10)} PTS
          </span>
        </div>

        {/* Título y Descripción */}
        <h6 className="fw-bold mb-1">{task.title}</h6>
        {task.description && (
          <p className="text-muted small mb-2">{task.description}</p>
        )}

        {/* Contador Regresivo */}
        <div className={`countdown mb-2 ${isExpired ? 'countdown-danger' : ''}`}>
          <span className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle' }}>schedule</span>
          {' '}{timeLeft}
        </div>

        {/* Estado de Delegación Visual */}
        {isDelegatedTask && (
          <div className="mt-2 p-2 bg-light rounded small border delegation-box">
            {isCreator && !isDelegatee && (
              <div>
                <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>DELEGADA A:</span>
                <strong className="text-body">{task.delegatedToEmail || task.delegatedToUid}</strong>
                {isPendingDelegation && <div className="text-warning small mt-1">⏳ Esperando que el compañero acepte</div>}
                {isAcceptedDelegation && <div className="text-success small mt-1">✓ Aceptada por el compañero (en curso)</div>}
              </div>
            )}

            {isDelegatee && (
              <div>
                <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>DELEGADA POR:</span>
                <strong className="text-body">{task.delegatedByName || task.delegatedByEmail || 'Un compañero'}</strong>
                {isPendingDelegation && <div className="text-primary small fw-semibold mt-1">⏳ Pendiente de tu aprobación</div>}
                {isAcceptedDelegation && <div className="text-success small fw-semibold mt-1">✓ Aceptada por ti (en curso)</div>}
              </div>
            )}
          </div>
        )}

        {/* Reintentos */}
        <div className="d-flex justify-content-between align-items-center mt-2">
          <small className="text-muted" style={{ fontSize: '0.75rem' }}>
            🔄 Reintentos: {task.retryCount || 0}/3
          </small>
        </div>

        {/* 1. Acciones para el destinatario de una tarea delegada */}
        {canRespondDelegation && (
          <div className="mt-3">
            <Alert variant="info" className="p-2 small mb-2 text-center">
              Esta tarea te fue delegada. ¿La aceptas?
            </Alert>
            <div className="d-flex gap-2">
              <Button size="sm" variant="success" onClick={() => handleDelegationResponse(true)} className="flex-1 fw-semibold">
                ✓ Aceptar
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleDelegationResponse(false)} className="flex-1 fw-semibold">
                ✗ Rechazar
              </Button>
            </div>
          </div>
        )}

        {/* 2. Botón de Completar (Habilitado solo si tiene derecho a completarla) */}
        {canComplete && (
          <div className="mt-3 d-flex gap-2">
            <Button size="sm" variant="success" onClick={handleComplete} className="flex-1 fw-semibold">
              ✓ Completar
            </Button>
            {canDelete && (
              <Button size="sm" variant="outline-danger" onClick={() => setShowDeleteReason(true)}>
                🗑️
              </Button>
            )}
          </div>
        )}

        {/* 3. Bloqueo explícito para el creador original mientras esté delegada a otra persona */}
        {isDelegatedTask && isCreator && !isDelegatee && task.status === 'active' && !isExpired && (
          <div className="mt-2 text-center text-muted small border-top pt-2">
            <em>🔒 Bloqueado: solo el compañero asignado puede completarla</em>
          </div>
        )}

        {/* 4. Rehacer tareas vencidas (solo creador original) */}
        {canRedo && (
          <div className="mt-3">
            <Button size="sm" variant="warning" onClick={handleRedo} className="w-100 fw-semibold">
              ↺ Rehacer y recuperar a Hacer (-5 pts)
            </Button>
          </div>
        )}

        {/* Modal inline para confirmar eliminación */}
        {showDeleteReason && (
          <div className="mt-2 p-2 border rounded bg-white">
            <Form.Control
              type="text"
              placeholder="Motivo de eliminación..."
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              className="mb-2"
              size="sm"
            />
            <div className="d-flex gap-2">
              <Button size="sm" variant="danger" onClick={handleDelete} className="flex-1">
                Confirmar (-5 pts)
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setShowDeleteReason(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default TaskCard;