// src/App.tsx - VERSÃO GARANTIDA
import React, { useState, useEffect } from 'react';

function App() {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('✅ React App carregado com sucesso!');
    
    // Simular carregamento
    const timer = setTimeout(() => {
      setUser({ name: 'João Silva' });
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Tela de Loading
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center'
      }}>
        <div>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid white',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>Dois no Bolso</h1>
          <p>Carregando seu app financeiro...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // App Principal
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        padding: '16px',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: 0
          }}>
            💰 Dois no Bolso
          </h1>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ color: '#374151' }}>Olá, {user?.name}</span>
            <button 
              onClick={() => setUser(null)}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 16px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '40px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '24px'
          }}>
            🎉
          </div>
          
          <h2 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            Tudo Funcionando!
          </h2>
          
          <p style={{
            fontSize: '18px',
            color: '#6b7280',
            marginBottom: '32px',
            lineHeight: '1.6'
          }}>
            Seu aplicativo <strong>Dois no Bolso</strong> está rodando perfeitamente!
          </p>
          
          <div style={{
            background: '#10b981',
            color: 'white',
            padding: '16px 32px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            display: 'inline-block'
          }}>
            ✅ Build Bem-Sucedida
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb',
        padding: '24px 16px',
        marginTop: '48px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '14px'
        }}>
          <p>Dois no Bolso {new Date().getFullYear()} - Controle financeiro pessoal</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
