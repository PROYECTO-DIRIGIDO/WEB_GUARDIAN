import React, { useState } from 'react';
import Login from './components/Login';
import UserManagement from './components/UserManagement';
import PatientManagement from './components/PatientManagement';

const App = () => {
  const [user, setUser] = useState(null);

  if (!user) {
    return <Login onLogin={(u) => {
      if (u.role === 'PATIENT') {
        alert("Acceso denegado: Los participantes solo pueden iniciar sesión en la Aplicación Móvil.");
        return;
      }
      setUser(u);
    }} />;
  }

  return (
    <div className="min-h-screen bg-[#f4f8f7] flex flex-col font-sans">
      {/* Barra de Navegación Premium */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <img src="/logo.png" alt="Logo" className="w-8" />
          <span className="font-extrabold text-teal-900 tracking-tight text-xl">GUARDIAN <span className="text-cyan-500 font-light tracking-widest text-sm ml-1 uppercase">Research Suite</span></span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-teal-50 px-4 py-2 rounded-2xl flex items-center space-x-2 border border-teal-100">
             <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black text-teal-700 uppercase tracking-widest">{user.role}</span>
          </div>
          <button 
            onClick={() => setUser(null)}
            className="text-slate-400 hover:text-red-500 transition text-sm font-bold flex items-center space-x-1"
          >
            <span>Salir</span>
          </button>
        </div>
      </nav>

      {/* Contenido Dinámico por Rol con Animación */}
      <main className="p-8 flex-grow max-w-7xl mx-auto w-full">
        {user.role === 'ADMIN' ? (
          <UserManagement user={user} />
        ) : (
          <PatientManagement user={user} />
        )}
      </main>
      
      <footer className="p-8 text-center">
          <div className="flex flex-col items-center space-y-2 opacity-30">
            <img src="/logo.png" alt="Footer Logo" className="w-6 grayscale" />
            <p className="text-[9px] font-bold text-slate-800 uppercase tracking-[0.3em]">
                Guardian Research Ecosystem &copy; 2026 • Powered by Juan
            </p>
          </div>
      </footer>
    </div>
  );
};

export default App;
