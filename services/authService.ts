export const authService = {
  getCurrentUser: () => {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  },
  
  login: (email: string, _password: string) => { // Use _password para indicar que não é usado
    // Simulação de login
    const user = {
      id: '1',
      name: 'Usuário Demo',
      email: email,
      token: 'demo-token'
    };
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  },
  
  logout: () => {
    localStorage.removeItem('currentUser');
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('currentUser');
  }
};
