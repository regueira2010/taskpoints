// src/store/useTaskStore.js
import { create } from 'zustand';
import toast from 'react-hot-toast';

// Fixture con 3 usuarios limpios (sin tareas y sin progreso previo)
export const INITIAL_DATA = {
  users: [
    {
      uid: "user-ana-001",
      email: "ana@ejemplo.com",
      displayName: "Ana García",
      password: "password123",
      points: 0,
      level: { name: "Bronce", icon: "🥉", color: "#cd7f32", minPoints: 0 },
      streak: 0,
      maxStreak: 0,
      totalTasksCompleted: 0,
      emailVerified: true
    },
    {
      uid: "user-carlos-002",
      email: "carlos@ejemplo.com",
      displayName: "Carlos Méndez",
      password: "password123",
      points: 0,
      level: { name: "Bronce", icon: "🥉", color: "#cd7f32", minPoints: 0 },
      streak: 0,
      maxStreak: 0,
      totalTasksCompleted: 0,
      emailVerified: true
    },
    {
      uid: "user-lucia-003",
      email: "lucia@ejemplo.com",
      displayName: "Lucía Fernández",
      password: "password123",
      points: 0,
      level: { name: "Bronce", icon: "🥉", color: "#cd7f32", minPoints: 0 },
      streak: 0,
      maxStreak: 0,
      totalTasksCompleted: 0,
      emailVerified: true
    }
  ],
  tasks: []
};

export const getUserLevel = (points) => {
  if (points >= 5000) return { name: 'Diamante', icon: '💎', color: '#00b4d8', minPoints: 5000 };
  if (points >= 2000) return { name: 'Oro', icon: '🥇', color: '#ffd700', minPoints: 2000 };
  if (points >= 500) return { name: 'Plata', icon: '🥈', color: '#c0c0c0', minPoints: 500 };
  return { name: 'Bronce', icon: '🥉', color: '#cd7f32', minPoints: 0 };
};

// Constantes de persistencia y sincronización (v2 para descartar datos viejos)
export const SHARED_DB_STORAGE_KEY = 'taskpoints_shared_db_v2';
export const SESSION_STORAGE_KEY = 'taskpoints_session_user';
export const SYNC_CHANNEL_NAME = 'taskpoints_realtime_sync';

// Identificador único por pestaña en memoria para evitar ecos
const TAB_INSTANCE_ID = typeof window !== 'undefined'
  ? (window.__tabInstanceId || (window.__tabInstanceId = `tab-${Math.random().toString(36).substring(2, 9)}`))
  : 'node-env';

// Canal de Broadcast nativo (baja latencia sub-milisegundo)
let syncBroadcastChannel = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    syncBroadcastChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
  } catch (e) {
    console.warn('BroadcastChannel no disponible:', e);
  }
}

// Helpers de persistencia en localStorage de la BD compartida
export const saveSharedDb = (tasks, users, senderId = TAB_INSTANCE_ID) => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const payload = {
      tasks,
      users,
      senderId,
      timestamp: Date.now()
    };
    localStorage.setItem(SHARED_DB_STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('Error guardando en localStorage:', e);
  }
};

export const loadSharedDb = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { users: INITIAL_DATA.users, tasks: INITIAL_DATA.tasks };
  }
  try {
    // Purgar versiones legacy v1 si existían
    if (localStorage.getItem('taskpoints_shared_db_v1')) {
      localStorage.removeItem('taskpoints_shared_db_v1');
    }
    const raw = localStorage.getItem(SHARED_DB_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const data = parsed.state || parsed;
      if (Array.isArray(data.tasks) && Array.isArray(data.users)) {
        return { tasks: data.tasks, users: data.users };
      }
    }
  } catch (e) {
    console.warn('Error leyendo localStorage:', e);
  }
  // Inicializar almacenamiento por defecto
  saveSharedDb(INITIAL_DATA.tasks, INITIAL_DATA.users);
  return { users: INITIAL_DATA.users, tasks: INITIAL_DATA.tasks };
};

// Helpers de sesión por pestaña (sessionStorage)
export const loadSessionUser = (usersList = []) => {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return null;
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.uid) return null;
    const fresh = (usersList || []).find((u) => u.uid === parsed.uid);
    return fresh || parsed;
  } catch (e) {
    console.warn('Error leyendo sessionStorage:', e);
    return null;
  }
};

export const saveSessionUser = (user) => {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return;
    if (user) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch (e) {
    console.warn('Error guardando sessionStorage:', e);
  }
};

// Selector puro de tareas para el usuario activo en sesión
export const selectUserTasks = (state, customUser = null) => {
  const activeUser = customUser || state.currentUser || loadSessionUser(state.users);
  if (!activeUser?.uid) return [];

  const uid = activeUser.uid;
  const email = activeUser.email?.toLowerCase();

  return (state.tasks || []).filter((task) => {
    const isOwner = task.userId === uid;
    const isDelegatee =
      task.delegatedToUid === uid ||
      Boolean(email && task.delegatedToEmail && task.delegatedToEmail.toLowerCase() === email);
    return isOwner || isDelegatee;
  });
};

// Despacho de sincronización garantizado (localStorage + BroadcastChannel)
export const broadcastSync = (tasks, users, meta = {}) => {
  // 1. Escribir síncronamente en localStorage (dispara evento storage en otras ventanas)
  saveSharedDb(tasks, users, TAB_INSTANCE_ID);

  // 2. Emitir por BroadcastChannel (entrega instantánea en pestañas del mismo navegador)
  if (syncBroadcastChannel) {
    try {
      syncBroadcastChannel.postMessage({
        tasks,
        users,
        meta,
        senderId: TAB_INSTANCE_ID,
        timestamp: Date.now()
      });
    } catch (e) {
      console.warn('Error enviando por BroadcastChannel:', e);
    }
  }
};

// Carga inicial
const initialShared = loadSharedDb();
const initialUser = loadSessionUser(initialShared.users);

export const useTaskStore = create((set, get) => ({
  users: initialShared.users,
  tasks: initialShared.tasks,
  currentUser: initialUser,
  isLocalMode: true,
  loading: false,

  // --- ASIGNAR SESIÓN ---
  setCurrentUserFromSession: (user) => {
    saveSessionUser(user);
    set({ currentUser: user });
  },

  // --- SELECTOR DE TAREAS DEL USUARIO ACTIVO ---
  getUserTasks: (customUser = null) => {
    return selectUserTasks(get(), customUser);
  },

  // --- APLICAR SINCRONIZACIÓN EXTERNA ---
  applyExternalSync: (newTasks, newUsers, meta = {}, senderId) => {
    // Ignorar si el evento fue originado por esta misma pestaña
    if (senderId && senderId === TAB_INSTANCE_ID) {
      return;
    }

    const state = get();
    // Si tanto las tareas como los usuarios son idénticos, descartar para evitar re-renders
    if (
      JSON.stringify(state.tasks) === JSON.stringify(newTasks) &&
      JSON.stringify(state.users) === JSON.stringify(newUsers)
    ) {
      return;
    }

    const currentUid = state.currentUser?.uid;

    if (currentUid && Array.isArray(newTasks)) {
      // 1. Nueva tarea delegada a mí recibida
      const newDelegations = newTasks.filter(
        (nt) =>
          nt.delegatedToUid === currentUid &&
          nt.delegationStatus === 'pending' &&
          !state.tasks.some((ot) => ot.id === nt.id)
      );
      newDelegations.forEach((task) => {
        const senderName = task.delegatedByName || task.delegatedByEmail || 'Un compañero';
        toast(`📬 ¡${senderName} te delegó: "${task.title}"!`, {
          icon: '👥',
          duration: 5000,
        });
      });

      // 2. Mi tarea delegada fue completada por el compañero
      const completedByPartner = newTasks.filter(
        (nt) =>
          nt.userId === currentUid &&
          nt.delegatedToUid &&
          nt.status === 'completed' &&
          state.tasks.some((ot) => ot.id === nt.id && ot.status === 'active')
      );
      completedByPartner.forEach((task) => {
        const partner = (newUsers || []).find((u) => u.uid === task.delegatedToUid);
        toast.success(`🎉 ¡${partner?.displayName || 'El compañero'} completó "${task.title}"! Bono de +5 pts 💎`);
      });

      // 3. Mi tarea delegada fue aceptada por el compañero
      const acceptedByPartner = newTasks.filter(
        (nt) =>
          nt.userId === currentUid &&
          nt.delegationStatus === 'accepted' &&
          state.tasks.some((ot) => ot.id === nt.id && ot.delegationStatus === 'pending')
      );
      acceptedByPartner.forEach((task) => {
        const partner = (newUsers || []).find((u) => u.uid === task.delegatedToUid);
        toast.success(`✓ ${partner?.displayName || 'El compañero'} aceptó tu tarea: "${task.title}"`);
      });

      // 4. Mi tarea delegada fue rechazada por el compañero
      const rejectedByPartner = newTasks.filter(
        (nt) =>
          nt.userId === currentUid &&
          nt.level === 'hacer' &&
          state.tasks.some((ot) => ot.id === nt.id && ot.delegatedToUid)
      );
      rejectedByPartner.forEach((task) => {
        toast.error(`✗ Un compañero rechazó la tarea "${task.title}". Ha regresado a tu columna Hacer (+15 pts reembolsados)`);
      });
    }

    // Refrescar perfil del usuario logueado en esta pestaña si cambiaron puntos/nivel
    let updatedCurrent = state.currentUser;
    if (currentUid && Array.isArray(newUsers)) {
      const fresh = newUsers.find((u) => u.uid === currentUid);
      if (fresh) {
        updatedCurrent = { ...state.currentUser, ...fresh };
        saveSessionUser(updatedCurrent);
      }
    }

    set({
      tasks: newTasks,
      users: newUsers,
      currentUser: updatedCurrent,
    });
  },

  // --- AUTENTICACIÓN LOCAL AISLADA POR PESTAÑA ---
  login: async (email, password) => {
    const latestDb = loadSharedDb();
    const cleanEmail = email.trim().toLowerCase();
    const found = latestDb.users.find((u) => u.email.toLowerCase() === cleanEmail) || get().users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!found) {
      toast.error('Usuario no encontrado');
      return { success: false, error: 'Usuario no encontrado' };
    }

    if (found.password && found.password !== password) {
      toast.error('Contraseña incorrecta');
      return { success: false, error: 'Contraseña incorrecta' };
    }

    saveSessionUser(found);
    set({
      tasks: latestDb.tasks,
      users: latestDb.users,
      currentUser: found
    });
    toast.success(`¡Bienvenido de nuevo, ${found.displayName}!`);
    return { success: true, user: found };
  },

  loginWithGoogle: async () => {
    const demoUser = get().users[0];
    saveSessionUser(demoUser);
    set({ currentUser: demoUser });
    toast.success(`Iniciaste sesión demo como ${demoUser.displayName} 💎`);
    return { success: true, user: demoUser };
  },

  register: async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    if (get().users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      toast.error('Este correo ya está registrado');
      return { success: false, error: 'Este correo ya está registrado' };
    }

    const newUser = {
      uid: `user-${Date.now()}`,
      email: cleanEmail,
      displayName: cleanEmail.split('@')[0],
      password,
      points: 100,
      level: getUserLevel(100),
      streak: 1,
      maxStreak: 1,
      totalTasksCompleted: 0,
      emailVerified: true
    };

    const nextUsers = [...get().users, newUser];
    saveSessionUser(newUser);
    set({ users: nextUsers, currentUser: newUser });
    broadcastSync(get().tasks, nextUsers, { action: 'register', user: newUser });
    toast.success('🎉 ¡Cuenta creada con 100 puntos de bienvenida!');
    return { success: true, user: newUser };
  },

  // --- LOGOUT LIMPIO Y SELECCIÓN AISLADA ---
  logout: async ({ clearSharedStorage = false } = {}) => {
    saveSessionUser(null);

    if (clearSharedStorage) {
      try {
        localStorage.removeItem(SHARED_DB_STORAGE_KEY);
      } catch (e) {
        console.warn('Error al limpiar localStorage:', e);
      }
      set({
        currentUser: null,
        tasks: INITIAL_DATA.tasks,
        users: INITIAL_DATA.users,
      });
      broadcastSync(INITIAL_DATA.tasks, INITIAL_DATA.users, { action: 'logout_reset' });
    } else {
      set({ currentUser: null });
    }

    toast.success('Sesión cerrada correctamente');
    return { success: true };
  },

  reloadUser: async () => {
    const current = get().currentUser;
    if (!current) return null;
    const fresh = get().users.find((u) => u.uid === current.uid) || current;
    saveSessionUser(fresh);
    set({ currentUser: fresh });
    return fresh;
  },

  resetToDemoData: () => {
    saveSessionUser(null);
    try {
      localStorage.removeItem(SHARED_DB_STORAGE_KEY);
      localStorage.removeItem('taskpoints_shared_db_v1');
    } catch (e) {
      console.warn('Error limpiando almacenamiento:', e);
    }
    set({
      users: INITIAL_DATA.users,
      tasks: INITIAL_DATA.tasks,
      currentUser: null
    });
    broadcastSync(INITIAL_DATA.tasks, INITIAL_DATA.users, { action: 'reset' });
    toast.success('🔄 Datos reiniciados a valores iniciales limpios');
  },

  clearAllTasks: () => {
    const nextTasks = [];
    set({ tasks: nextTasks });
    broadcastSync(nextTasks, get().users, { action: 'clearAllTasks' });
    toast.success('Todas las tareas han sido eliminadas');
  },

  // --- PUNTOS Y RACHAS ---
  updateUserPoints: async (uid, newPoints) => {
    const safePoints = Math.max(0, newPoints);
    const newLevel = getUserLevel(safePoints);
    let updatedSessionUser = null;

    set((state) => {
      const updatedUsers = state.users.map((u) => 
        u.uid === uid ? { ...u, points: safePoints, level: newLevel } : u
      );
      let updatedCurrent = state.currentUser;
      if (state.currentUser?.uid === uid) {
        updatedCurrent = { ...state.currentUser, points: safePoints, level: newLevel };
        updatedSessionUser = updatedCurrent;
      }
      return { users: updatedUsers, currentUser: updatedCurrent };
    });

    if (updatedSessionUser) {
      saveSessionUser(updatedSessionUser);
    }

    broadcastSync(get().tasks, get().users, { action: 'updateUserPoints', uid, newPoints: safePoints });
    return { success: true };
  },

  // --- ACCIONES DE TAREAS Y DELEGACIÓN REACTIVA ---
  createTask: async (taskData) => {
    const user = get().currentUser;
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    let delegatedToUid = null;
    let delegatedToEmail = null;

    if (taskData.level === 'delegar') {
      if (!taskData.delegatedEmail) {
        return { success: false, error: 'Debes seleccionar un compañero para delegar' };
      }
      if (taskData.delegatedEmail.toLowerCase() === user.email.toLowerCase()) {
        return { success: false, error: 'No puedes delegarte una tarea a ti mismo' };
      }

      const target = get().users.find((u) => u.email.toLowerCase() === taskData.delegatedEmail.trim().toLowerCase());
      if (!target) {
        return {
          success: false,
          error: 'Usuario seleccionado no encontrado en el sistema.'
        };
      }

      if (user.points < 15) {
        return { success: false, error: 'Puntos insuficientes para delegar (requiere 15 pts)' };
      }

      delegatedToUid = target.uid;
      delegatedToEmail = target.email;
    }

    const deadlineDays = { hacer: 1, programar: 7, delegar: 3, eliminar: 14 }[taskData.level] || 1;
    const deadline = new Date(Date.now() + deadlineDays * 24 * 60 * 60 * 1000).toISOString();

    const newTask = {
      id: `task-${Date.now()}`,
      title: taskData.title,
      description: taskData.description || '',
      level: taskData.level,
      userId: user.uid,
      createdAt: new Date().toISOString(),
      deadline,
      status: 'active',
      retryCount: 0,
      delegatedByName: user.displayName,
      delegatedByEmail: user.email,
      delegatedToUid,
      delegatedToEmail,
      delegationStatus: taskData.level === 'delegar' ? 'pending' : null,
      pointsEarned: 0
    };

    let updatedUsers = get().users;
    let updatedCurrent = user;

    if (taskData.level === 'delegar' && delegatedToUid) {
      const newPoints = Math.max(0, user.points - 15);
      const newLevel = getUserLevel(newPoints);
      updatedCurrent = { ...user, points: newPoints, level: newLevel };
      updatedUsers = get().users.map((u) => (u.uid === user.uid ? updatedCurrent : u));
      saveSessionUser(updatedCurrent);
    }

    const nextTasks = [newTask, ...get().tasks];
    set({ tasks: nextTasks, users: updatedUsers, currentUser: updatedCurrent });

    // Sincronizar inmediatamente en tiempo real
    broadcastSync(nextTasks, updatedUsers, { action: 'createTask', taskId: newTask.id });

    if (taskData.level === 'delegar' && delegatedToUid) {
      toast.success(`Tarea delegada a ${delegatedToEmail} (-15 pts)`);
    } else {
      toast.success('Tarea creada exitosamente');
    }

    return { success: true, id: newTask.id };
  },

  completeTask: async (taskId, task) => {
    const user = get().currentUser;
    if (!user) return { success: false };

    // Si la tarea está delegada, solo el usuario asignado (delegatee) puede completarla
    if (task.delegatedToUid && task.delegatedToUid !== user.uid) {
      toast.error('Solo el compañero asignado puede completar esta tarea.');
      return { success: false, error: 'No autorizado' };
    }

    const pointsMap = { hacer: 20, programar: 10, delegar: 10, eliminar: 0 };
    const pointsToAdd = pointsMap[task.level] || 0;

    const nextTasks = get().tasks.map((t) =>
      t.id === taskId 
        ? { ...t, status: 'completed', completedAt: new Date().toISOString(), pointsEarned: pointsToAdd } 
        : t
    );

    let updatedUsers = get().users;
    let updatedCurrent = user;

    // Sumar puntos a quien completó la tarea y actualizar racha diaria
    if (pointsToAdd > 0) {
      const userNewPoints = Math.max(0, user.points + pointsToAdd);
      const userNewLevel = getUserLevel(userNewPoints);

      const today = new Date().toDateString();
      const lastActive = user.lastActiveDate;
      let newStreak = user.streak || 0;
      let newMaxStreak = user.maxStreak || 0;

      if (!lastActive) {
        newStreak = 1;
        newMaxStreak = Math.max(newMaxStreak, 1);
      } else if (lastActive !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastActive === yesterday.toDateString()) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
        newMaxStreak = Math.max(newMaxStreak, newStreak);
      }

      updatedCurrent = { 
        ...user, 
        points: userNewPoints, 
        level: userNewLevel, 
        streak: newStreak,
        maxStreak: newMaxStreak,
        lastActiveDate: today,
        totalTasksCompleted: (user.totalTasksCompleted || 0) + 1 
      };
      updatedUsers = updatedUsers.map((u) => (u.uid === user.uid ? updatedCurrent : u));
      saveSessionUser(updatedCurrent);
    }

    // Bonificación del 25% (+5 pts) para el creador original si fue delegada y completada
    if (task.level === 'delegar' && task.delegatedToUid === user.uid && task.userId !== user.uid) {
      const delegator = updatedUsers.find((u) => u.uid === task.userId);
      if (delegator) {
        const delegatorNewPoints = Math.max(0, delegator.points + 5);
        const delegatorNewLevel = getUserLevel(delegatorNewPoints);
        updatedUsers = updatedUsers.map((u) =>
          u.uid === delegator.uid
            ? { ...u, points: delegatorNewPoints, level: delegatorNewLevel }
            : u
        );
      }
    }

    set({ tasks: nextTasks, users: updatedUsers, currentUser: updatedCurrent });
    broadcastSync(nextTasks, updatedUsers, { action: 'completeTask', taskId });

    if (pointsToAdd > 0) {
      toast.success(`¡Tarea completada! +${pointsToAdd} pts`);
    }

    return { success: true };
  },

  redoTask: async (taskId, task) => {
    const user = get().currentUser;
    if (!user) return { success: false };
    if (task.retryCount >= 3) return { success: false, error: 'Máximo de reintentos alcanzado (3)' };
    if (user.points < 5) return { success: false, error: 'Puntos insuficientes (cuesta 5 pts)' };

    const newDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    const nextTasks = get().tasks.map((t) =>
      t.id === taskId 
        ? { 
            ...t, 
            status: 'active', 
            deadline: newDeadline, 
            retryCount: (t.retryCount || 0) + 1,
            delegatedToUid: null,
            delegatedToEmail: null,
            delegationStatus: null,
            level: 'hacer'
          } 
        : t
    );

    const newPoints = Math.max(0, user.points - 5);
    const newLevel = getUserLevel(newPoints);
    const updatedCurrent = { ...user, points: newPoints, level: newLevel };
    const updatedUsers = get().users.map((u) => (u.uid === user.uid ? updatedCurrent : u));
    saveSessionUser(updatedCurrent);

    set({ tasks: nextTasks, users: updatedUsers, currentUser: updatedCurrent });
    broadcastSync(nextTasks, updatedUsers, { action: 'redoTask', taskId });

    toast.success('Tarea reactivada por 24h en tu columna Hacer (-5 pts)');
    return { success: true };
  },

  deleteTask: async (taskId, reason) => {
    const user = get().currentUser;
    if (!user) return { success: false };
    if (user.points < 5) return { success: false, error: 'Puntos insuficientes (cuesta 5 pts)' };

    const nextTasks = get().tasks.map((t) =>
      t.id === taskId 
        ? { ...t, status: 'deleted', deletedReason: reason, deletedAt: new Date().toISOString() } 
        : t
    );

    const newPoints = Math.max(0, user.points - 5);
    const newLevel = getUserLevel(newPoints);
    const updatedCurrent = { ...user, points: newPoints, level: newLevel };
    const updatedUsers = get().users.map((u) => (u.uid === user.uid ? updatedCurrent : u));
    saveSessionUser(updatedCurrent);

    set({ tasks: nextTasks, users: updatedUsers, currentUser: updatedCurrent });
    broadcastSync(nextTasks, updatedUsers, { action: 'deleteTask', taskId });

    toast.success('Tarea eliminada (-5 pts)');
    return { success: true };
  },

  respondToDelegation: async (taskId, accept) => {
    const user = get().currentUser;
    if (!user) return { success: false };
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return { success: false };

    let nextTasks;
    let updatedUsers = get().users;
    let updatedCurrent = user;

    if (accept) {
      // B acepta la tarea: se activa en su tablero
      nextTasks = get().tasks.map((t) => 
        t.id === taskId ? { ...t, delegationStatus: 'accepted', status: 'active' } : t
      );
      toast.success('¡Delegación aceptada! La tarea ahora está asignada a ti.');
    } else {
      // B rechaza la tarea: regresa automáticamente al flujo del creador original A
      const delegator = updatedUsers.find((u) => u.uid === task.userId);
      if (delegator) {
        const refundPoints = delegator.points + 15;
        const refundLevel = getUserLevel(refundPoints);
        updatedUsers = updatedUsers.map((u) =>
          u.uid === delegator.uid
            ? { ...u, points: refundPoints, level: refundLevel }
            : u
        );
        if (user.uid === delegator.uid) {
          updatedCurrent = { ...user, points: refundPoints, level: refundLevel };
          saveSessionUser(updatedCurrent);
        }
      }

      nextTasks = get().tasks.map((t) => 
        t.id === taskId 
          ? { 
              ...t, 
              delegatedToUid: null, 
              delegatedToEmail: null, 
              delegationStatus: null,
              level: 'hacer', // Regresa a columna Hacer para el creador
              status: 'active' 
            } 
          : t
      );
      toast.info('Delegación rechazada. La tarea regresó al creador original (+15 pts reembolsados).');
    }

    set({ tasks: nextTasks, users: updatedUsers, currentUser: updatedCurrent });
    broadcastSync(nextTasks, updatedUsers, { action: 'respondToDelegation', taskId, accept });

    return { success: true };
  },

  updateTaskLevel: async (taskId, newLevel) => {
    const nextTasks = get().tasks.map((t) =>
      t.id === taskId ? { ...t, level: newLevel, updatedAt: new Date().toISOString() } : t
    );
    set({ tasks: nextTasks });
    broadcastSync(nextTasks, get().users, { action: 'updateTaskLevel', taskId, newLevel });
    return { success: true };
  }
}));

// --- MECANISMO MULTI-CAPA DE SINCRONIZACIÓN EN TIEMPO REAL ---

// Helper de sincronización periódica y ante cambios de foco de ventana (Fallback blindado)
export const checkAndSyncFromStorage = () => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const raw = localStorage.getItem(SHARED_DB_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const { tasks, users, senderId, meta } = parsed;
    if (senderId === TAB_INSTANCE_ID) return;
    if (Array.isArray(tasks) && Array.isArray(users)) {
      useTaskStore.getState().applyExternalSync(tasks, users, meta || { source: 'poll' }, senderId);
    }
  } catch (e) {
    console.warn('Error en checkAndSyncFromStorage:', e);
  }
};

// 1. BroadcastChannel (Mensajería nativa reactiva instantánea sub-milisegundo)
if (syncBroadcastChannel) {
  syncBroadcastChannel.onmessage = (event) => {
    const { tasks, users, meta, senderId } = event.data || {};
    if (senderId === TAB_INSTANCE_ID) return;
    if (Array.isArray(tasks) && Array.isArray(users)) {
      useTaskStore.getState().applyExternalSync(tasks, users, meta, senderId);
    }
  };
}

// 2. Evento Storage del navegador (Para ventanas desacopladas en el mismo origen)
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === SHARED_DB_STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        const { tasks, users, senderId, meta } = parsed;
        if (senderId === TAB_INSTANCE_ID) return;
        if (Array.isArray(tasks) && Array.isArray(users)) {
          useTaskStore.getState().applyExternalSync(tasks, users, meta || { source: 'storage' }, senderId);
        }
      } catch (e) {
        console.warn('Error en storage listener:', e);
      }
    }
  });

  // 3. Resincronización al alternar de ventana o hacer clic en la pestaña
  window.addEventListener('focus', checkAndSyncFromStorage);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkAndSyncFromStorage();
    }
  });

  // 4. Heartbeat continuo (1s) para garantizar sincronización en tableros simultáneos
  setInterval(checkAndSyncFromStorage, 1000);
}
