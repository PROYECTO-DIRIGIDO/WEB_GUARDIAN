import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, FileDown, CirclePlus, Activity } from 'lucide-react';

const PatientManagement = ({ user }) => {
  const [patients, setPatients] = useState([]);
  const [studyCode, setStudyCode] = useState('');
  const [message, setMessage] = useState('');

  const fetchPatients = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/researcher/patients', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPatients(response.data);
    } catch (err) {
      console.error("Error al cargar pacientes");
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/researcher/patients', { studyCode }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMessage(`Paciente ${studyCode} registrado con éxito`);
      setStudyCode('');
      fetchPatients();
    } catch (err) {
      setMessage("Error al registrar paciente");
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Panel de Investigación</h1>
          <p className="text-slate-500 font-medium">Control y seguimiento de HRV por participante</p>
        </div>
        {user.canExport && (
          <button className="flex items-center space-x-2 bg-white border-2 border-teal-500 text-teal-600 px-6 py-3 rounded-2xl font-bold hover:bg-teal-50 transition shadow-sm active:scale-95">
            <FileDown size={20} />
            <span>Exportar Dataset</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-sm border border-white flex items-center space-x-4">
          <div className="p-4 bg-teal-100 rounded-2xl text-teal-600">
            <Users size={28} />
          </div>
          <div>
            <span className="block text-3xl font-black text-slate-800">{patients.length}</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Participantes Activos</span>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-sm border border-white flex items-center space-x-4">
          <div className="p-4 bg-cyan-100 rounded-2xl text-cyan-600">
            <Activity size={28} />
          </div>
          <div>
            <span className="block text-3xl font-black text-slate-800">0</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alertas de Riesgo</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white/80 backdrop-blur-md p-10 rounded-[2.5rem] shadow-sm border border-white h-fit">
          <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center space-x-3">
             <CirclePlus className="text-teal-500" />
             <span>Nuevo Participante</span>
          </h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Código de Estudio</label>
              <input 
                type="text" 
                placeholder="Ex: PAC-2026-001"
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-teal-500 outline-none transition placeholder:text-slate-300"
                value={studyCode}
                onChange={(e) => setStudyCode(e.target.value)}
                required
              />
            </div>
            <button className="w-full bg-teal-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-teal-600/20 hover:bg-teal-700 transition active:scale-95">
              Registrar en el Estudio
            </button>
            {message && <p className="text-center text-[10px] font-bold text-teal-600 uppercase mt-2">{message}</p>}
          </form>
        </div>

        <div className="lg:col-span-2 bg-white/80 backdrop-blur-md p-10 rounded-[2.5rem] shadow-sm border border-white">
          <h2 className="text-xl font-black text-slate-800 mb-6 underline decoration-teal-300 decoration-4 underline-offset-8 text-center lg:text-left">Lista de Participantes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {patients.map(p => (
              <div key={p.id} className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 flex justify-between items-center group hover:bg-white hover:border-teal-200 transition-all cursor-pointer shadow-sm hover:shadow-md">
                <div>
                  <span className="block font-black text-slate-700 text-lg">{p.studyCode}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Registrado: {new Date(p.registrationDate).toLocaleDateString()}</span>
                </div>
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 group-hover:scale-110 transition">
                  <Activity size={18} />
                </div>
              </div>
            ))}
            {patients.length === 0 && (
              <div className="col-span-2 py-10 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                 <p className="text-slate-400 font-medium">Aún no has registrado participantes.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientManagement;
