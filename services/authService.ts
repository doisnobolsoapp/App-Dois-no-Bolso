// import { User } from '../types'; // Comentado - tipo não existe

// Simulação de serviço de autenticação
export const authService = {
  login: async (email: string, password: string) => {
    // Simulação de chamada API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: '1',
          name: 'Usuário Demo',
          email: email,
          token: 'mock-jwt-token'
        });
      }, 1000);
    });
  },

  logout: async () => {
    // Simulação de logout
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 500);
    });
  },

  getCurrentUser: () => {
    // Retorna usuário mock para demonstração
    return {
      id: '1',
      name: 'Usuário Demo',
      email: 'demo@doisnobolso.com'
    };
  }
};
