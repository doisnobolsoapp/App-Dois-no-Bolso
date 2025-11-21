
import { User } from '../types';

const USERS_KEY = 'dois_no_bolso_users';
const CURRENT_USER_KEY = 'dois_no_bolso_current_session';

export const registerUser = (email: string, password: string, name: string, mode: 'INDIVIDUAL' | 'COUPLE'): User => {
  const usersStr = localStorage.getItem(USERS_KEY);
  const users = usersStr ? JSON.parse(usersStr) : [];

  if (users.find((u: any) => u.email === email)) {
    throw new Error('E-mail já cadastrado.');
  }

  const newUser = {
    id: crypto.randomUUID(),
    email,
    password, // In a real app, never store plain text passwords!
    name,
    mode
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  // Auto login
  const { password: _, ...safeUser } = newUser;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
  return safeUser;
};

export const loginUser = (email: string, password: string): User => {
  const usersStr = localStorage.getItem(USERS_KEY);
  const users = usersStr ? JSON.parse(usersStr) : [];

  const user = users.find((u: any) => u.email === email && u.password === password);

  if (!user) {
    throw new Error('E-mail ou senha incorretos.');
  }

  const { password: _, ...safeUser } = user;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
  return safeUser;
};

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(CURRENT_USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

export const loginGuest = (): User => {
    const guestUser: User = {
        id: 'guest',
        email: 'guest@doisnobolso.app',
        name: 'Convidado',
        mode: 'INDIVIDUAL'
    };
    // Guest doesn't persist session across reloads usually, but for this App structure we set it
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(guestUser));
    return guestUser;
}
