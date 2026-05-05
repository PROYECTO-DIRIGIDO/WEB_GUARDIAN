import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Usamos la configuración central de la API
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
        password
      });
      onLogin(response.data);
    } catch (err) {
      setError('Credenciales incorrectas o servidor fuera de línea');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-sans px-4">
      <div className="bg-white/70 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl w-full max-w-[26rem] text-center border border-white/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-cyan-500"></div>
        <img src="/logo.png" alt="Logo Guardian" className="mx-auto w-28 mb-8 drop-shadow-lg" />
        <h2 className="text-3xl font-extrabold text-teal-900 mb-2 tracking-tight">Sistema <span className="text-cyan-600">GUARDIAN</span></h2>
        <p className="text-gray-500 mb-10 text-sm font-medium">Investigación y Prevención de Conductas de Riesgo</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <input
              type="text"
              placeholder="Usuario"
              className="w-full px-5 py-4 rounded-2xl bg-white/50 border border-teal-100 focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all placeholder:text-gray-400"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="relative">
            <input
              type="password"
              placeholder="Contraseña"
              className="w-full px-5 py-4 rounded-2xl bg-white/50 border border-teal-100 focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all placeholder:text-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="w-full bg-gradient-to-r from-teal-600 to-teal-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-teal-600/20 hover:shadow-teal-600/40 hover:-translate-y-1 transition-all active:scale-95">
            Ingresar al Panel
          </button>
        </form>
        {error && <p className="text-red-500 mt-6 text-xs bg-red-50/50 p-3 rounded-xl border border-red-100">{error}</p>}
        <div className="mt-10 text-[10px] text-teal-800/40 font-bold uppercase tracking-[0.2em]">
          PROPIEDAD INTELECTUAL JUAN • TESIS 2026
        </div>
      </div>
    </div>
  );
};

export default Login;
