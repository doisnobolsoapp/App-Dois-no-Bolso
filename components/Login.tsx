
import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Users, ArrowRight, CheckCircle } from 'lucide-react';
import { registerUser, loginUser, loginGuest } from '../services/authService';
import { User as UserType } from '../types';
import { Logo } from './Logo';

interface LoginProps {
  onLoginSuccess: (user: UserType) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'INDIVIDUAL' | 'COUPLE'>('INDIVIDUAL');

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Por favor, insira um e-mail válido.');
      return;
    }

    if (password.length < 4) {
      setError('A senha deve ter pelo menos 4 caracteres.');
      return;
    }

    try {
      let user;
      if (isRegistering) {
        if (!name) {
            setError('Por favor, digite seu nome.');
            return;
        }
        user = registerUser(email, password, name, mode);
      } else {
        user = loginUser(email, password);
      }
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro. Tente novamente.');
    }
  };

  const handleGuest = () => {
      const user = loginGuest();
      onLoginSuccess(user);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-b from-white to-slate-50 p-8 pb-6 text-center border-b border-slate-100">
          <Logo size="lg" showText={true} />
          <p className="text-slate-500 font-medium mt-2 text-sm">
             Organizando seu bolso — {isRegistering && mode === 'COUPLE' ? 'a dois' : 'sozinho ou a dois'}.
          </p>
        </div>

        <div className="p-8 pt-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center">
               <span className="mr-2">⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {isRegistering && (
                <div className="space-y-4 animate-fade-in">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Como você quer ser chamado?</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <User size={18} />
                            </div>
                            <input 
                                type="text"
                                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                placeholder="Seu nome"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Uso</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setMode('INDIVIDUAL')}
                                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${mode === 'INDIVIDUAL' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                            >
                                <User size={20} className="mb-1"/>
                                <span className="text-xs font-bold">Individual</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('COUPLE')}
                                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${mode === 'COUPLE' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                            >
                                <Users size={20} className="mb-1"/>
                                <span className="text-xs font-bold">Casal</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input 
                  type="email"
                  autoComplete="email"
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-700">Senha</label>
                {!isRegistering && (
                    <a href="#" onClick={(e) => {e.preventDefault(); alert("Funcionalidade simulada: Verifique seu e-mail.")}} className="text-xs text-brand-600 hover:text-brand-700">Esqueci minha senha</a>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  autoComplete={isRegistering ? 'new-password' : 'current-password'}
                  className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-lg shadow-lg shadow-brand-500/30 transition-all transform active:scale-[0.98] flex items-center justify-center"
            >
              {isRegistering ? (
                  <>Criar Conta <CheckCircle size={18} className="ml-2" /></>
              ) : (
                  <>Entrar <ArrowRight size={18} className="ml-2" /></>
              )}
            </button>
          </form>

          {/* Switcher */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              {isRegistering ? 'Já tem uma conta?' : 'Ainda não tem conta?'}
              <button 
                onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                className="ml-1 font-bold text-brand-600 hover:text-brand-800 transition-colors"
              >
                {isRegistering ? 'Fazer Login' : 'Criar agora'}
              </button>
            </p>
          </div>
          
          {/* Guest Mode */}
          {!isRegistering && (
             <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                 <button onClick={handleGuest} className="text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors">
                     Acessar como Convidado
                 </button>
                 <p className="text-[10px] text-slate-300 mt-1">Modo convidado — dados salvos apenas localmente.</p>
             </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
           <p className="text-[10px] text-slate-400">
               Ao entrar, você concorda com nossos Termos de Uso e Política de Privacidade.
           </p>
        </div>
      </div>
    </div>
  );
};
