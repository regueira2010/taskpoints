// src/contexts/AuthContext.jsx
import React, { createContext, useContext } from 'react';
import { useTaskStore, getUserLevel } from '../store/useTaskStore';

// Crear el contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export { getUserLevel };

// Proveedor de Autenticación
export const AuthProvider = ({ children }) => {
  const store = useTaskStore();

  const value = {
    user: store.currentUser,
    loading: store.loading,
    userPoints: store.currentUser?.points || 0,
    userLevel: store.currentUser?.level || getUserLevel(0),
    userStreak: store.currentUser?.streak || 0,
    maxStreak: store.currentUser?.maxStreak || 0,
    register: store.register,
    login: store.login,
    loginWithGoogle: store.loginWithGoogle,
    logout: store.logout,
    updateUserPoints: store.updateUserPoints,
    loadUserPoints: async () => store.currentUser?.points || 0,
    incrementCompletedTasks: store.incrementCompletedTasks,
    getUserLevel,
    reloadUser: store.reloadUser,
    switchUser: store.switchUser,
    resetToDemoData: store.resetToDemoData,
    users: store.users,
    isLocalMode: true,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;