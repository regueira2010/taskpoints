// src/components/dashboard/KanbanBoard.jsx
import React, { useState } from 'react';
import { Row, Col, Button, Modal, Form, Alert } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import KanbanColumn from './KanbanColumn';
import NewTaskModal from './NewTaskModal';
import { useTasks } from '../../contexts/TasksContext';
import { useAuth } from '../../contexts/AuthContext';


const KanbanBoard = () => {
  const { tasks, createTask, updateTaskLevel } = useTasks();
  const { user } = useAuth();
  const [showNewTask, setShowNewTask] = useState(false);
  const [error, setError] = useState('');

  const levels = ['hacer', 'programar', 'delegar', 'eliminar'];
  const levelNames = {
    hacer: { name: '⚡ Hacer', color: 'danger' },
    programar: { name: '📅 Programar', color: 'info' },
    delegar: { name: '👥 Delegar', color: 'success' },
    eliminar: { name: '🗑️ Eliminar', color: 'secondary' },
  };

  // Filtrar tareas por nivel
  const getTasksByLevel = (level) => {
    return tasks.filter(task => task.level === level && task.status === 'active');
  };

  // Manejar drag & drop
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // Si no hay destino o es el mismo lugar
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newLevel = destination.droppableId;
    const task = tasks.find(t => t.id === draggableId);

    if (!task) return;

    // Validar que el usuario es el dueño de la tarea
    if (task.userId !== user.uid) {
      setError('Solo el propietario de la tarea puede moverla');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Validar que no sea una tarea delegada pendiente o en curso
    if (task.delegationStatus === 'pending') {
      setError('No puedes mover una tarea pendiente de delegación');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (task.delegatedToUid && task.delegationStatus === 'accepted') {
      setError('No puedes mover una tarea que está siendo ejecutada por un compañero');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      // Actualizar a través del contexto (esto actualiza Firestore)
      await updateTaskLevel(task.id, newLevel);
    } catch (error) {
      console.error('Error moving task:', error);
      setError('Error al mover la tarea');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCreateTask = async (taskData) => {
    const result = await createTask(taskData);
    if (result.success) {
      setShowNewTask(false);
      setError('');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="p-4 kanban-board-wrapper" style={{ minHeight: 'calc(100vh - 60px)' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Tablero Estratégico</h2>
          <p className="text-muted small">Arrastra tareas entre columnas para cambiar su nivel estratégico</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setShowNewTask(true)}
          className="rounded-pill px-4 py-2 fw-semibold"
          style={{ backgroundColor: '#0057cd' }}
        >
          + Nueva Tarea
        </Button>
      </div>

      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Row className="g-3">
          {levels.map(level => (
            <Col key={level} lg={3} md={6} sm={12}>
              <Droppable droppableId={level}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`kanban-column p-3 ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-3 px-2">
                      <h5 className={`fw-bold mb-0 text-${levelNames[level].color}`}>
                        {levelNames[level].name}
                      </h5>
                      <span className="badge bg-secondary rounded-pill">
                        {getTasksByLevel(level).length}
                      </span>
                    </div>
                    
                    <KanbanColumn 
                      tasks={getTasksByLevel(level)}
                      level={level}
                      provided={provided}
                    />
                    
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Col>
          ))}
        </Row>
      </DragDropContext>

      <NewTaskModal 
        show={showNewTask}
        onHide={() => setShowNewTask(false)}
        onCreate={handleCreateTask}
      />
    </div>
  );
};

export default KanbanBoard;