import React, { createContext, useContext, useMemo } from 'react';
import { useTaskStore, selectUserTasks } from '../store/useTaskStore';
import { useAuth } from './AuthContext';

const TasksContext = createContext();

export const useTasks = () => useContext(TasksContext);

export const TasksProvider = ({ children }) => {
  const store = useTaskStore();
  const { user } = useAuth();

  // Filtrar tareas que pertenecen estrictamente al usuario activo de la sesión actual
  const userTasks = useMemo(() => {
    const activeUser = user || store.currentUser;
    if (!activeUser?.uid) return [];

    return selectUserTasks(store, activeUser).map((t) => ({
      ...t,
      deadline: t.deadline ? new Date(t.deadline) : null,
      createdAt: t.createdAt ? new Date(t.createdAt) : null,
      completedAt: t.completedAt ? new Date(t.completedAt) : null,
    }));
  }, [store.tasks, user, store.currentUser]);

  const value = {
    tasks: userTasks,
    allTasks: store.tasks,
    loading: false,
    createTask: store.createTask,
    completeTask: store.completeTask,
    redoTask: store.redoTask,
    deleteTask: store.deleteTask,
    respondToDelegation: store.respondToDelegation,
    updateTaskLevel: store.updateTaskLevel,
    getUserTasks: store.getUserTasks,
  };

  return (
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  );
};

export default TasksContext;