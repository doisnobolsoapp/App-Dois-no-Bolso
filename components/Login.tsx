import React, { useState } from 'react';
// import { User as UserType } from '../types'; // Comentado - tipo não existe

interface LoginProps {
  onLogin: (user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de login - em produção, isso seria uma chamada API
    const mockUser = {
      id: '1',
      name: 'Usuário Demo',
      email: email
    };
    onLogin(mockUser);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Dois no Bolso</h1>
          <p className="text-slate-500">Faça login para acessar sua conta</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="seu@email.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="Sua senha"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-lg font-bold transition-colors"
          >
            Entrar
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Ainda não tem conta?{' '}
            <button className="text-brand-600 hover:text-brand-700 font-medium">
              Cadastre-se
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
