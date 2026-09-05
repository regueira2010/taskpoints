// src/components/dashboard/KanbanColumn.jsx
import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';

const KanbanColumn = ({ tasks, level, provided }) => {
  return (
    <div className="d-flex flex-column gap-3">
      {tasks.length === 0 ? (
        <div className="text-center text-muted py-4">
          <small>No hay tareas</small>
        </div>
      ) : (
        tasks.map((task, index) => (
          <Draggable key={task.id} draggableId={task.id} index={index}>
            {(providedDraggable, snapshot) => (
              <div
                ref={providedDraggable.innerRef}
                {...providedDraggable.draggableProps}
                {...providedDraggable.dragHandleProps}
                className={`task-card ${snapshot.isDragging ? 'dragging' : ''}`}
              >
                <TaskCard task={task} />
              </div>
            )}
          </Draggable>
        ))
      )}
    </div>
  );
};

export default KanbanColumn;