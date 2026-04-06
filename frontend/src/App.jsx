import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import UserManagement from './components/UserManagement';
import PatientManagement from './components/PatientManagement';
import SurveyManagement from './components/SurveyManagement';
import PatientDashboard from './components/PatientDashboard';
import ProfileSettings from './components/ProfileSettings';
import { Menu, X } from 'lucide-react';

const App = () => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('guardian_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [researcherTab, setResearcherTab] = useState(() => {
    return localStorage.getItem('guardian_tab') || 'patients';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('guardian_tab', researcherTab);
  }, [researcherTab]);

  const handleLogin = (u) => {
    setUser(u);
    localStorage.setItem('guardian_user', JSON.stringify(u));
    if (u.role === 'PATIENT') {
      setResearcherTab('surveys');
    } else if (u.role === 'ADMIN') {
      setResearcherTab('patients');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('guardian_user');
    localStorage.removeItem('guardian_tab');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen animated-bg-app flex flex-col font-sans">
      {/* Barra de Navegación Premium */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <img src="/logo.png" alt="Logo" className="w-8" />
          <span className="font-extrabold text-teal-900 tracking-tight text-lg md:text-xl">GUARDIAN <span className="text-cyan-500 font-light tracking-widest text-xs md:text-sm ml-1 uppercase">Research Suite</span></span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-6">
          <div className="bg-teal-50 px-4 py-2 rounded-2xl flex items-center space-x-2 border border-teal-100">
             <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black text-teal-700 uppercase tracking-widest">{user.role}</span>
          </div>
          
          {user.role !== 'ADMIN' && (
            <button 
              onClick={() => setResearcherTab('profile')}
              className={`flex items-center space-x-2 p-1 rounded-2xl border-2 transition ${researcherTab === 'profile' ? 'border-teal-500 bg-teal-50' : 'border-transparent hover:bg-slate-50'}`}
            >
               <img 
                 src={`https://ui-avatars.com/api/?name=${user.username}&background=008080&color=fff`} 
                 alt="User" 
                 className="w-8 h-8 rounded-xl object-cover"
               />
            </button>
          )}

          <button 
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-500 transition text-sm font-bold"
          >
            Salir
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-b shadow-lg px-6 py-4 flex flex-col space-y-4 sticky top-[73px] z-40">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-teal-700 uppercase tracking-widest">{user.role}</span>
          </div>
          {user.role !== 'ADMIN' && (
            <button 
              onClick={() => { setResearcherTab('profile'); setMobileMenuOpen(false); }}
              className="flex items-center space-x-3 text-sm font-bold text-slate-600 hover:text-teal-600 transition"
            >
              <img src={`https://ui-avatars.com/api/?name=${user.username}&background=008080&color=fff`} alt="User" className="w-8 h-8 rounded-xl" />
              <span>Mi Perfil</span>
            </button>
          )}
          <button 
            onClick={handleLogout}
            className="text-left text-sm font-bold text-red-400 hover:text-red-600 transition"
          >
            Cerrar Sesión
          </button>
        </div>
      )}

      {/* Contenido Dinámico por Rol */}
      <main className="p-4 md:p-8 flex-grow max-w-7xl mx-auto w-full">
        {user.role === 'ADMIN' ? (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-red-600 font-black text-xs uppercase tracking-widest">Panel de Control: Modo Administrador</span>
              <span className="text-red-400 text-[10px] font-bold">Identificado como: {user.username} (ROLE: {user.role})</span>
            </div>
            <UserManagement user={user} />
          </div>
        ) : user.role === 'PATIENT' ? (
          <div className="space-y-8">
            <div className="flex overflow-x-auto border-b border-white/20 bg-white/10 backdrop-blur-md rounded-t-2xl px-4">
               <button 
                 onClick={() => setResearcherTab('surveys')}
                 className={`pb-4 px-4 md:px-6 text-xs md:text-sm font-black transition-all whitespace-nowrap ${researcherTab === 'surveys' ? 'border-b-4 border-teal-400 text-white' : 'text-white/50 hover:text-white/80'}`}
               >
                 MIS ENCUESTAS
               </button>
               <button 
                 onClick={() => setResearcherTab('profile')}
                 className={`pb-4 px-4 md:px-6 text-xs md:text-sm font-black transition-all whitespace-nowrap ${researcherTab === 'profile' ? 'border-b-4 border-teal-400 text-white' : 'text-white/50 hover:text-white/80'}`}
               >
                 MI PERFIL
               </button>
            </div>
            {researcherTab === 'profile' ? <ProfileSettings user={user} /> : <PatientDashboard user={user} />}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex overflow-x-auto border-b border-white/20 bg-white/10 backdrop-blur-md rounded-t-2xl px-4">
              <button 
                onClick={() => setResearcherTab('patients')}
                className={`pb-4 px-4 md:px-6 text-xs md:text-sm font-black transition-all whitespace-nowrap ${researcherTab === 'patients' ? 'border-b-4 border-teal-400 text-white' : 'text-white/50 hover:text-white/80'}`}
              >
                GESTIÓN DE PACIENTES
              </button>
              <button 
                onClick={() => setResearcherTab('surveys')}
                className={`pb-4 px-4 md:px-6 text-xs md:text-sm font-black transition-all whitespace-nowrap ${researcherTab === 'surveys' ? 'border-b-4 border-teal-400 text-white' : 'text-white/50 hover:text-white/80'}`}
              >
                DISEÑO DE ENCUESTAS
              </button>
            </div>

            {researcherTab === 'patients' ? (
              <PatientManagement user={user} />
            ) : researcherTab === 'surveys' ? (
              <SurveyManagement user={user} />
            ) : (
              <ProfileSettings user={user} />
            )}
          </div>
        )}
      </main>
      
      <footer className="p-6 md:p-8 text-center">
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
