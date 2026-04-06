import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Trash2, ShieldCheck, ShieldAlert, CirclePlus, Activity, Calendar, Search, Users } from 'lucide-react';

const UserManagement = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [canExport, setCanExport] = useState(false);
  const [selectedResearcherId, setSelectedResearcherId] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [newPatientStudyCode, setNewPatientStudyCode] = useState('');
  const [newPatientPassword, setNewPatientPassword] = useState('');
  const [message, setMessage] = useState('');
  const [assignMessage, setAssignMessage] = useState('');
  const [patientMessage, setPatientMessage] = useState('');
  const [allPatients, setAllPatients] = useState([]);
  const [activeTab, setActiveTab] = useState('researchers');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      const uRes = await axios.get('http://localhost:8080/api/admin/users', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const pRes = await axios.get('http://localhost:8080/api/admin/patients', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setUsers(uRes.data);
      setAllPatients(pRes.data);
    } catch (err) {
      console.error("Error al cargar datos");
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.token]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/admin/users', {
        username,
        password,
        role: 'RESEARCHER',
        canExport
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMessage(`Usuario ${username} creado!`);
      setUsername('');
      setPassword('');
      setCanExport(false);
      fetchData();
    } catch (err) {
      setMessage("Error al crear usuario");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este investigador?")) {
      try {
        await axios.delete(`http://localhost:8080/api/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        fetchData();
      } catch (err) {
        alert("Error al eliminar");
      }
    }
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    setPatientMessage('');
    try {
      await axios.post('http://localhost:8080/api/admin/patients', {
        studyCode: newPatientStudyCode,
        password: newPatientPassword
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPatientMessage(`¡Éxito! Acceso para ${newPatientStudyCode} creado.`);
      setNewPatientStudyCode('');
      setNewPatientPassword('');
      fetchData();
    } catch (err) {
      const detail = err.response?.data || "Error al crear acceso";
      setPatientMessage(`Error: ${detail}`);
    }
  };

  const handleAssignPatient = async (e) => {
    e.preventDefault();
    if (!selectedResearcherId || !selectedPatientId) return alert("Selecciona ambos");
    try {
      await axios.post('http://localhost:8080/api/admin/assign-patient', {
        patientId: parseInt(selectedPatientId),
        researcherId: parseInt(selectedResearcherId)
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setAssignMessage(`Participante vinculado.`);
      setSelectedPatientId('');
      setSelectedResearcherId('');
      fetchData();
    } catch (err) {
      setAssignMessage("Error en la vinculación");
    }
  };

  const handleUnassignPatient = async (id) => {
    if (window.confirm("¿Deseas desvincular a este participante?")) {
      try {
        await axios.post(`http://localhost:8080/api/admin/unassign-patient/${id}`, {}, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        fetchData();
      } catch (err) {
        alert("Error al desvincular");
      }
    }
  };

  const filteredUsers = users.filter(u => 
    (u.role === 'ADMIN' || u.role === 'RESEARCHER') &&
    (u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredPatients = allPatients.filter(p => 
    p.studyCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.researcher?.username || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-white/80 backdrop-blur-md p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-white">
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-3 bg-teal-100 rounded-2xl text-teal-600">
            <UserPlus size={24} />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Registrar Investigador</h2>
        </div>
        
        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-2">Usuario</label>
            <input 
              type="text" 
              className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-teal-500 outline-none transition"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-2">Contraseña</label>
            <input 
              type="password" 
              className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-teal-500 outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center space-x-3 mb-3 ml-2">
            <input 
              type="checkbox" 
              className="w-5 h-5 accent-teal-600"
              checked={canExport}
              onChange={(e) => setCanExport(e.target.checked)}
            />
            <span className="text-sm font-bold text-slate-600">Permitir Exportar CSV</span>
          </div>
          <button className="bg-teal-600 text-white py-3 rounded-2xl font-bold hover:bg-teal-700 transition shadow-lg shadow-teal-600/20 active:scale-95">
            Guardar Usuario
          </button>
        </form>
        {message && <p className="mt-4 text-xs font-bold text-teal-600 bg-teal-50 p-3 rounded-xl">{message}</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SECCIÓN 1: CREACIÓN DE ACCESO */}
        <div className="bg-white/80 backdrop-blur-md p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-white">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-cyan-100 rounded-2xl text-cyan-600">
              <CirclePlus size={24} />
            </div>
            <h2 className="text-xl font-black text-slate-800">1. Crear Acceso de Paciente</h2>
          </div>
          
          <form onSubmit={handleCreatePatient} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Código de Estudio</label>
                <input 
                  type="text" 
                  placeholder="Ej: PAC-2026-X"
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-cyan-500 outline-none transition"
                  value={newPatientStudyCode}
                  onChange={(e) => setNewPatientStudyCode(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Asignar Contraseña (App)</label>
                <input 
                  type="password" 
                  placeholder="Contraseña para el paciente"
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-cyan-500 outline-none transition"
                  value={newPatientPassword}
                  onChange={(e) => setNewPatientPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <button className="w-full bg-cyan-600 text-white py-3 rounded-2xl font-bold hover:bg-cyan-700 transition shadow-lg shadow-cyan-600/20 active:scale-95">
              Crear Credenciales App
            </button>
          </form>
          {patientMessage && <p className="mt-4 text-xs font-bold text-cyan-600 bg-cyan-50 p-3 rounded-xl">{patientMessage}</p>}
        </div>

        {/* SECCIÓN 2: VINCULACIÓN */}
        <div className="bg-white/80 backdrop-blur-md p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-white">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600">
              <UserPlus size={24} />
            </div>
            <h2 className="text-xl font-black text-slate-800">2. Vincular a Investigador</h2>
          </div>
          
          <form onSubmit={handleAssignPatient} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-2">Seleccionar Paciente</label>
              <select 
                className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition appearance-none"
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                required
              >
                <option value="">-- Seleccione Participante --</option>
                {allPatients.map(p => (
                  <option key={p.id} value={p.id}>{p.studyCode}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-2">Asignar a Investigador</label>
              <select 
                className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition appearance-none"
                value={selectedResearcherId}
                onChange={(e) => setSelectedResearcherId(e.target.value)}
                required
              >
                <option value="">-- Seleccione Investigador --</option>
                {users.filter(u => u.role === 'RESEARCHER').map(u => (
                  <option key={u.id} value={u.id}>{u.username}</option>
                ))}
              </select>
            </div>
            <button className="w-full bg-indigo-600 text-white py-3 rounded-2xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20 active:scale-95">
              Confirmar Vinculación
            </button>
          </form>
          {assignMessage && <p className="mt-4 text-xs font-bold text-indigo-600 bg-indigo-50 p-3 rounded-xl">{assignMessage}</p>}
        </div>
      </div>

      {/* SECCIÓN DE LISTAS CON FILTRO Y PESTAÑAS */}
      <div className="bg-white/80 backdrop-blur-md p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
            <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
                <button 
                    onClick={() => setActiveTab('researchers')}
                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'researchers' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Investigadores ({users.length})
                </button>
                <button 
                    onClick={() => setActiveTab('patients')}
                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'patients' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Participantes ({allPatients.length})
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder={`Buscar en ${activeTab === 'researchers' ? 'investigadores' : 'participantes'}...`}
                    className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-teal-500 outline-none transition w-full md:w-80"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {activeTab === 'researchers' ? (
            <div className="overflow-x-auto overflow-hidden rounded-2xl border border-slate-100">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Usuario</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Rol</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Permisos</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredUsers.map(u => (
                            <tr key={u.id} className="hover:bg-slate-50/50 transition">
                                <td className="px-6 py-4 font-bold text-slate-700">{u.username}</td>
                                <td className="px-6 py-4">
                                    <span className={`text-[10px] px-2 py-1 rounded-full font-black ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {u.canExport ? 
                                        <div className="flex items-center text-teal-600 space-x-1"><ShieldCheck size={14} /><span className="text-xs font-bold">Exportación Activa</span></div> : 
                                        <div className="flex items-center text-slate-300 space-x-1"><ShieldAlert size={14} /><span className="text-xs font-bold">Solo Lectura</span></div>
                                    }
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {u.role !== 'ADMIN' && (
                                        <button 
                                            onClick={() => handleDelete(u.id)}
                                            className="text-slate-300 hover:text-red-500 transition p-2"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <div className="overflow-x-auto overflow-hidden rounded-3xl border border-slate-100">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Código Estudio</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Investigador</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha Registro</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredPatients.map(p => (
                            <tr key={p.id} className="hover:bg-indigo-50/30 transition group">
                                <td className="px-8 py-5">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                                        <span className="font-bold text-slate-700">{p.studyCode}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center space-x-2">
                                        <div className={`text-sm font-bold px-3 py-1 rounded-lg w-fit ${p.researcher ? 'bg-slate-100 text-slate-500' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                            {p.researcher ? `@${p.researcher.username}` : 'Sin Investigador'}
                                        </div>
                                        {p.researcher && (
                                            <button 
                                                onClick={() => handleUnassignPatient(p.id)}
                                                className="p-1 text-slate-300 hover:text-amber-500 transition tooltip"
                                                title="Desvincular"
                                            >
                                                <ShieldAlert size={14} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center text-xs font-bold text-slate-400">
                                        <Calendar size={14} className="mr-2" />
                                        {new Date(p.registrationDate).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-right space-x-2">
                                    <button 
                                        onClick={async () => {
                                            if (window.confirm(`¿Confirmas la eliminación definitiva del paciente ${p.studyCode}? Esto borrará también sus credenciales.`)) {
                                                await axios.delete(`http://localhost:8080/api/admin/patients/${p.id}`, {
                                                    headers: { Authorization: `Bearer ${user.token}` }
                                                });
                                                fetchPatients();
                                            }
                                        }}
                                        className="text-slate-300 hover:text-red-500 transition-all transform group-hover:scale-110"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredPatients.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center space-y-3 opacity-20">
                                        <Activity size={48} />
                                        <p className="text-sm font-black uppercase tracking-widest">No se encontraron resultados</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
