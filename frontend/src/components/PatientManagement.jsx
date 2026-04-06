import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, FileDown, Activity, ArrowLeft, FileText, HeartPulse, 
  Search, Info, TrendingUp, BarChart3, Database, ChevronRight, X, Loader2,
  Plus, MessageSquare, Smile, ListChecks, CheckCircle2, AlertCircle, Check
} from 'lucide-react';

const PatientManagement = ({ user }) => {
  const [patients, setPatients] = useState([]);
  const [studyCode, setStudyCode] = useState('');
  const [message, setMessage] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('glove'); // 'info', 'glove', 'history'
  const [history, setHistory] = useState({ glove: [], surveys: [], statistics: {} });
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [toast, setToast] = useState(null);


  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };



  const fetchPatients = async () => {
    try {
      const response = await axios.get('http://192.168.100.5:8080/api/researcher/patients', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPatients(response.data);
    } catch (err) {
      console.error("Error al cargar pacientes");
    }
  };

  const fetchPatientDetails = async (patient) => {
    setLoadingHistory(true);
    try {
      const historyRes = await axios.get(`http://192.168.100.5:8080/api/researcher/history/${patient.id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setHistory(historyRes.data || { glove: [], surveys: [], statistics: {} });
    } catch (err) {
      console.error("Error al cargar detalles");
      setHistory({ glove: [], surveys: [], statistics: {} });
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchPatientDetails(selectedPatient);
    }
  }, [selectedPatient]);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://192.168.100.5:8080/api/researcher/patients', { studyCode }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMessage(`Paciente ${studyCode} registrado`);
      setStudyCode('');
      fetchPatients();
    } catch (err) {
      setMessage("Error al registrar");
    }
  };

  const downloadExcel = async (type) => {
    try {
      const response = await axios.get(`http://192.168.100.5:8080/api/researcher/export/${type}/${selectedPatient.id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_${selectedPatient.studyCode}_Scientific.xlsx`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert("Error al descargar");
    }
  };

  if (selectedPatient) {
    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-500 relative">
        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-8 right-8 z-[200] flex items-center space-x-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right border ${toast.type === 'success' ? 'bg-white text-teal-600 border-teal-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
            {toast.type === 'success' ? <Check size={20} className="bg-teal-500 text-white rounded-full p-0.5" /> : <AlertCircle size={20} />}
            <span className="font-black text-[10px] uppercase tracking-widest">{toast.message}</span>
          </div>
        )}



        {/* Modal de Respuestas de Encuesta */}
        {selectedSurvey && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
               <div className="p-8 border-b flex justify-between items-center bg-teal-50/50">
                  <div>
                    <h3 className="text-xl font-black text-slate-800">{selectedSurvey.survey?.title || 'Protocolo'}</h3>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{selectedSurvey.timestamp}</p>
                  </div>
                  <button onClick={() => setSelectedSurvey(null)} className="p-2 hover:bg-white rounded-full transition text-slate-400">
                    <X size={24} />
                  </button>
               </div>
               <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {selectedSurvey.answers && Object.entries(selectedSurvey.answers).map(([q, a], idx) => (
                    <div key={idx} className="space-y-2 border-b border-slate-50 pb-4">
                       <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Pregunta {idx + 1}</p>
                       <p className="font-bold text-slate-800 leading-tight">{q}</p>
                       <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <p className="text-sm text-slate-600 font-medium">{a}</p>
                       </div>
                    </div>
                  ))}
                  {(!selectedSurvey.answers || Object.keys(selectedSurvey.answers).length === 0) && (
                    <p className="text-center text-slate-400 py-10 font-bold italic">No hay respuestas registradas.</p>
                  )}
               </div>
               <div className="p-6 bg-slate-50 text-center">
                  <button onClick={() => setSelectedSurvey(null)} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-slate-800 transition">
                    Cerrar Detalle
                  </button>
               </div>
            </div>
          </div>
        )}

        <button 
          onClick={() => setSelectedPatient(null)}
          className="flex items-center space-x-2 text-slate-400 hover:text-teal-600 font-black uppercase text-[10px] tracking-widest p-2 transition"
        >
          <ArrowLeft size={16} />
          <span>Volver al Dashboard</span>
        </button>

        <div className="bg-white/80 backdrop-blur-xl p-6 md:p-10 rounded-[3rem] shadow-sm border border-white relative overflow-hidden">
          {/* Header Científico */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 md:mb-10 gap-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img 
                  src={selectedPatient.profilePicture || `https://ui-avatars.com/api/?name=${selectedPatient.studyCode}&background=008080&color=fff`} 
                  alt="Avatar" 
                  className="w-24 h-24 rounded-[2.5rem] border-4 border-white shadow-2xl object-cover"
                />
                <div className="absolute -bottom-2 -right-2 bg-teal-500 text-white p-2 rounded-2xl shadow-lg border-2 border-white">
                  <Activity size={16} />
                </div>
              </div>
              <div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tight">{selectedPatient.fullName || selectedPatient.studyCode}</h2>
                <div className="flex items-center space-x-3 mt-2">
                  <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">ID: {selectedPatient.studyCode}</span>
                  <span className="px-3 py-1 bg-teal-50 rounded-full text-[10px] font-black text-teal-600 uppercase tracking-widest">Status: Activo</span>
                </div>
              </div>
            </div>

            <div className="flex bg-slate-100/50 p-1.5 rounded-[1.5rem] border border-slate-100">
               {['info', 'glove', 'history'].map(tab => (
                 <button 
                   key={tab}
                   onClick={() => setSelectedTab(tab)}
                   className={`px-6 py-3 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest ${selectedTab === tab ? 'bg-white text-teal-600 shadow-xl border border-slate-100 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                   {tab === 'info' ? 'Paciente' : tab === 'glove' ? 'Análisis Guante' : 'Encuestas'}
                 </button>
               ))}
            </div>
          </div>

          {loadingHistory ? (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
               <Loader2 className="text-teal-500 animate-spin mb-4" size={48} />
               <p className="text-slate-300 font-black uppercase tracking-[0.3em] text-xs">Cargando Datasets...</p>
            </div>
          ) : (
            <>
              {/* DASHBOARD CIENTÍFICO (Guante) */}
              {selectedTab === 'glove' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                   {/* Resumen de Medias Estadísticas */}
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <StatCard title="Mean HRV" value={`${history.statistics?.avgHrv ?? '--'}ms`} label="Media Global" icon={<HeartPulse size={20}/>} color="teal" />
                      <StatCard title="Mean Pulse" value={`${history.statistics?.avgPulse ?? '--'}bpm`} label="Frecuencia Media" icon={<Activity size={20}/>} color="cyan" />
                      <StatCard title="SDNN" value={`${history.statistics?.avgSdnn ?? '--'}ms`} label="Desviación Estándar" icon={<TrendingUp size={20}/>} color="indigo" />
                      <StatCard title="RMSSD" value={`${history.statistics?.avgRmssd ?? '--'}ms`} label="Variabilidad" icon={<BarChart3 size={20}/>} color="pink" />
                   </div>

                   {/* Botón de Exportación Avanzada */}
                   <div className="flex justify-between items-center bg-slate-900 p-8 rounded-[2.5rem] text-white">
                      <div>
                        <h3 className="text-xl font-bold mb-1">Exportación Científica Avanzada</h3>
                        <p className="text-slate-400 text-sm">Archivo Excel con datos en bruto organizados por **pestañas diarias**.</p>
                      </div>
                      <button 
                        onClick={() => downloadExcel('glove')}
                        className="flex items-center space-x-3 bg-teal-500 hover:bg-teal-400 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-teal-500/20 transition active:scale-95"
                      >
                        <FileDown size={20} />
                        <span>Descargar Dataset Multisheet</span>
                      </button>
                   </div>

                   {/* Listado Chronológico */}
                   <div className="space-y-4">
                      <h3 className="text-sm font-black text-slate-300 uppercase tracking-[0.2em] ml-2">Timeline de Lecturas</h3>
                      <div className="space-y-3">
                         {history.glove && history.glove.map(item => (
                           <div key={item.id} className="p-6 bg-white border border-slate-100 rounded-[2rem] flex items-center justify-between hover:border-teal-200 transition shadow-sm group">
                              <div className="flex items-center space-x-5">
                                 <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600 transition">
                                    <Database size={20} />
                                 </div>
                                 <div>
                                    <p className="text-xs font-black text-slate-800">{item.timestamp}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scientific Metric Entry</p>
                                 </div>
                              </div>
                              <div className="flex items-center space-x-12 px-8">
                                 <Metric value={item.hrvValue} unit="ms" label="HRV" />
                                 <Metric value={item.sdnn} unit="ms" label="SDNN" />
                                 <Metric value={item.rmssd} unit="ms" label="RMSSD" />
                                 <Metric value={item.heartRate} unit="bpm" label="HR" />
                              </div>
                              <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-200">
                                 <ChevronRight size={20} />
                              </div>
                           </div>
                         ))}
                         {(!history.glove || history.glove.length === 0) && (
                           <div className="py-20 text-center bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
                              <p className="text-slate-300 font-bold italic">No se han registrado lecturas para este paciente.</p>
                           </div>
                         )}
                      </div>
                   </div>
                </div>
              )}

              {/* HISTORIAL DE ENCUESTAS */}
              {selectedTab === 'history' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-teal-600 p-8 rounded-[2.5rem] text-white gap-4">
                      <div>
                        <h3 className="text-xl font-bold mb-1">Matriz de Encuestas</h3>
                        <p className="text-teal-100/70 text-sm italic">Reporte unificado para análisis en SPSS/R.</p>
                      </div>
                      <div className="flex flex-wrap gap-3 w-full md:w-auto">

                         <button 
                           onClick={() => downloadExcel('surveys')}
                           className="flex-1 md:flex-none flex items-center justify-center space-x-3 bg-white text-teal-600 hover:bg-teal-50 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl transition active:scale-95"
                         >
                           <FileDown size={18} />
                           <span>Descargar Matriz</span>
                         </button>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {history.surveys && history.surveys.map(item => (
                        <div 
                          key={item.id} 
                          onClick={() => setSelectedSurvey(item)}
                          className="p-6 bg-slate-50/50 border border-slate-100 rounded-[2rem] flex items-center justify-between cursor-pointer hover:bg-teal-50/50 hover:border-teal-200 transition group"
                        >
                           <div className="flex items-center space-x-5">
                              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-teal-600 group-hover:scale-110 transition">
                                 <FileText size={20} />
                              </div>
                              <div>
                                 <p className="font-black text-slate-800 text-sm">{item.survey?.title || 'Encuesta'}</p>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.timestamp}</p>
                              </div>
                           </div>
                           <span className="text-[9px] font-black text-teal-600 bg-white px-3 py-1.5 rounded-full border border-teal-100 opacity-0 group-hover:opacity-100 transition">
                              VER RESPUESTAS
                           </span>
                        </div>
                      ))}
                      {(!history.surveys || history.surveys.length === 0) && (
                         <div className="col-span-full py-20 text-center bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
                           <p className="text-slate-300 font-bold italic">No hay respuestas de encuestas registradas.</p>
                         </div>
                      )}
                   </div>
                </div>
              )}

              {/* INFORMACIÓN DEL PACIENTE */}
              {selectedTab === 'info' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
                   <div className="bg-slate-50/50 p-10 rounded-[2.5rem] border border-slate-100 space-y-6">
                      <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-4">Detalles de Identidad</h3>
                      <div className="grid grid-cols-2 gap-6">
                        <InfoField label="Nombre Completo" value={selectedPatient.fullName} />
                        <InfoField label="Código Estudio" value={selectedPatient.studyCode} />
                        <InfoField label="Rol Sistema" value="Participante Activo" />
                        <InfoField label="Fecha Alta" value={selectedPatient.registrationDate} />
                      </div>
                   </div>
                   <div className="bg-teal-50/10 p-10 rounded-[2.5rem] border border-teal-50/50 flex flex-col justify-center items-center text-center">
                      <div className="p-5 bg-teal-600/10 rounded-[2rem] text-teal-600 mb-6">
                        <Database size={40} />
                      </div>
                      <h4 className="text-xl font-black text-slate-800 mb-2">Sincronización de Datos</h4>
                      <p className="text-sm text-slate-500 font-medium">El historial clínico se actualiza cada vez que el paciente sincroniza su dispositivo con la plataforma.</p>
                   </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-700">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl px-6 md:px-8 py-5 md:py-6 border border-white/10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Suite de <span className="text-teal-300">Investigación Académica</span></h1>
          <p className="text-white/60 font-medium mt-1">Análisis avanzado de HRV y correlación de protocolos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-sm border border-white flex items-center space-x-5">
           <div className="p-4 bg-teal-50 rounded-2xl text-teal-600 border border-teal-100 flex items-center justify-center">
             <Users size={32} />
           </div>
           <div>
             <span className="block text-4xl font-black text-slate-800">{patients.length}</span>
             <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Participantes Registrados</span>
           </div>
        </div>
        <div className="bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-white flex items-center space-x-5">
           <div className="p-4 bg-cyan-50 rounded-2xl text-cyan-600 border border-cyan-100 flex items-center justify-center">
             <TrendingUp size={32} />
           </div>
           <div>
             <span className="block text-4xl font-black text-slate-800">HRV RMSSD</span>
             <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Métrica Principal</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-1 bg-white/80 backdrop-blur-md p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-white">
          <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center space-x-3">
             <div className="w-1 h-6 bg-teal-500 rounded-full"></div>
             <span>Añadir Participante</span>
          </h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <input 
              type="text" 
              placeholder="Código de Estudio..."
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 outline-none transition font-bold"
              value={studyCode}
              onChange={(e) => setStudyCode(e.target.value)}
              required
            />
            <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition active:scale-95">
              Vincular al Laboratorio
            </button>
            {message && <p className="text-center text-[10px] font-bold text-teal-600 uppercase mt-2">{message}</p>}
          </form>
        </div>

        <div className="lg:col-span-2 bg-white/80 backdrop-blur-md p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-slate-50 gap-4">
            <h2 className="text-xl font-black text-slate-800">Directorio de Estudio</h2>
            <div className="relative flex-grow max-w-sm">
              <input 
                type="text" 
                placeholder="Filtrar por nombre..."
                className="w-full bg-slate-100 border-none rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-slate-600 focus:ring-2 focus:ring-teal-500 transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-4 top-3 text-slate-400" size={18} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {patients.filter(p => 
              (p.fullName && p.fullName.toLowerCase().includes(searchTerm.toLowerCase())) || 
              p.studyCode.toLowerCase().includes(searchTerm.toLowerCase())
            ).map(p => (
              <div 
                key={p.id} 
                onClick={() => setSelectedPatient(p)}
                className="group p-6 bg-white rounded-[2rem] border border-slate-100 flex flex-col items-center text-center hover:bg-teal-50 hover:border-teal-200 transition-all cursor-pointer shadow-sm hover:shadow-xl active:scale-95 relative"
              >
                <div className="absolute top-4 right-4">
                  {p.dailySurveyCompleted ? (
                    <div className="bg-green-50 text-green-500 p-1.5 rounded-xl border border-green-100 shadow-sm" title="Evaluación del día completa">
                      <CheckCircle2 size={16} strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="bg-amber-50 text-amber-500 p-1.5 rounded-xl border border-amber-100 shadow-sm" title="Pendiente de evaluación hoy">
                      <AlertCircle size={16} strokeWidth={3} />
                    </div>
                  )}
                </div>

                <img 
                  src={p.profilePicture || `https://ui-avatars.com/api/?name=${p.studyCode}&background=008080&color=fff`} 
                  alt="Avatar" 
                  className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover bg-white group-hover:scale-110 transition mb-4"
                />
                <span className="block font-black text-slate-800 group-hover:text-teal-900 transition text-sm">{p.fullName || p.studyCode}</span>
                <span className="block text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">{p.studyCode}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, label, icon, color }) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 space-y-3 hover:shadow-xl transition">
    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white bg-${color}-500 shadow-lg shadow-${color}-100`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      <p className="text-2xl font-black text-slate-800">{value}</p>
      <p className="text-[9px] font-bold text-slate-300 uppercase italic mt-1">{label}</p>
    </div>
  </div>
);

const Metric = ({ value, unit, label }) => (
  <div className="text-center group-hover:scale-110 transition">
    <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{label}</p>
    <p className="font-black text-slate-700 text-sm">
       {value != null ? value : '--'}
       <span className="text-[8px] text-slate-300 ml-0.5">{unit}</span>
    </p>
  </div>
);

const InfoField = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">{label}</p>
    <p className="text-sm font-bold text-slate-700">{value || 'No disponible'}</p>
  </div>
);

export default PatientManagement;
