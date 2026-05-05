import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, CheckCircle2, MessageSquare, Smile, 
  ArrowRight, ArrowLeft, Send, Check, AlertCircle
} from 'lucide-react';

const PatientDashboard = ({ user }) => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const fetchSurveys = async () => {
    try {
      setFetchError(null);
      const response = await axios.get(`http://${window.location.hostname}:8080/api/researcher/surveys/active/${user.username}?t=${new Date().getTime()}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      console.log("Surveys recibidas:", response.data);
      setSurveys(response.data);
    } catch (error) {
      console.error("Error fetching surveys", error);
      setFetchError(error.response?.data || error.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();

    // Actualizar cada minuto por si hay nuevas encuestas asignadas
    const interval = setInterval(() => {
      fetchSurveys();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleStartSurvey = (survey) => {
    setSelectedSurvey(survey);
    setAnswers({});
    setCompleted(false);
  };

  const handleAnswerChange = (questionText, value) => {
    setAnswers({ ...answers, [questionText]: value });
  };

  const isCompletedToday = (lastResponse) => {
    if (!lastResponse) return false;
    const lastDate = new Date(lastResponse + 'Z'); // Asumiendo que el backend envía UTC implícito o local
    const now = new Date();
    // Ventana rodante de 24 horas
    const diffTime = Math.abs(now - lastDate);
    const diffHours = diffTime / (1000 * 60 * 60);
    // Si la diferencia es menor o igual a 24 horas o incluso si hay un pequeño desfase horario
    return diffHours <= 24;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`http://${window.location.hostname}:8080/api/researcher/surveys/submit`, {
        surveyId: selectedSurvey.survey.id,
        answers: answers
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setCompleted(true);
      setTimeout(() => {
        setSelectedSurvey(null);
        fetchSurveys();
      }, 2000);
    } catch (error) {
      alert("Error al enviar respuestas");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 animate-pulse">
       <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-6"></div>
       <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs">Cargando Protocolos...</p>
    </div>
  );

  if (fetchError) return (
    <div className="flex flex-col items-center justify-center py-40">
       <AlertCircle className="text-red-500 mb-6" size={48} />
       <p className="text-red-600 font-black uppercase tracking-widest text-lg">Error de Conexión</p>
       <p className="text-red-400 font-bold mt-2">Detalle: {fetchError}</p>
       <button onClick={fetchSurveys} className="mt-6 bg-red-100 text-red-600 px-6 py-2 rounded-xl font-bold">Reintentar</button>
    </div>
  );

  if (selectedSurvey) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom duration-500">
        <button 
          onClick={() => setSelectedSurvey(null)}
          className="flex items-center space-x-2 text-slate-400 hover:text-teal-600 font-black uppercase text-[10px] tracking-widest p-2 transition"
        >
          <ArrowLeft size={16} />
          <span>Cancelar y Volver</span>
        </button>

        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden relative">
          {completed ? (
            <div className="p-20 text-center space-y-6 animate-in zoom-in duration-500">
               <div className="w-24 h-24 bg-teal-500 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-teal-500/30">
                  <Check size={48} strokeWidth={4} />
               </div>
               <h3 className="text-3xl font-black text-slate-800 tracking-tight">¡Muchas Gracias!</h3>
               <p className="text-slate-500 font-medium">Tus respuestas han sido enviadas correctamente al equipo médico de Guardian.</p>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-teal-600 to-cyan-500 p-12 text-white relative">
                 <h2 className="text-4xl font-black tracking-tight mb-2 uppercase">{selectedSurvey.survey.title}</h2>
                 <p className="text-teal-50/70 font-medium italic">{selectedSurvey.survey.description || "Por favor, completa todas las preguntas del protocolo."}</p>
                 <div className="absolute top-8 right-8 opacity-20"><FileText size={80} /></div>
              </div>

              <form onSubmit={handleSubmit} className="p-12 space-y-12">
                {selectedSurvey.survey.questions.map((q, idx) => (
                  <div key={idx} className="space-y-6 animate-in slide-in-from-left duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="flex items-start space-x-4">
                       <span className="w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs pt-0.5">{idx + 1}</span>
                       <p className="text-xl font-bold text-slate-800 pt-1 leading-tight">{q.text}</p>
                    </div>

                    <div className="ml-12">
                      {q.type === 'SI_NO' && (
                        <div className="flex space-x-4">
                           {['Sí', 'No'].map(opt => (
                             <button
                               key={opt} type="button"
                               onClick={() => handleAnswerChange(q.text, opt)}
                               className={`px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${answers[q.text] === opt ? 'bg-teal-600 text-white shadow-xl scale-105' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                             >
                               {opt}
                             </button>
                           ))}
                        </div>
                      )}

                      {q.type === 'ANIMO' && (
                        <div className="grid grid-cols-3 gap-4">
                           {[
                             {val: 'Bien', icon: <Smile className="text-green-500" />},
                             {val: 'Regular', icon: <div className="w-6 h-1 bg-amber-500 rounded-full" />},
                             {val: 'Mal', icon: <div className="w-6 h-6 border-2 border-red-500 rounded-full flex items-center justify-center"><div className="w-3 h-0.5 bg-red-500 rounded-full" /></div>}
                           ].map(opt => (
                             <button
                               key={opt.val} type="button"
                               onClick={() => handleAnswerChange(q.text, opt.val)}
                               className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${answers[q.text] === opt.val ? 'border-teal-500 bg-teal-50 scale-105 shadow-xl' : 'border-slate-100 hover:border-slate-300'}`}
                             >
                               <div className="mb-3 transform scale-125">{opt.icon}</div>
                               <span className={`text-[10px] font-black uppercase tracking-widest ${answers[q.text] === opt.val ? 'text-teal-700' : 'text-slate-400'}`}>{opt.val}</span>
                             </button>
                           ))}
                        </div>
                      )}

                      {q.type === 'MULTIPLE' && (
                        <div className="space-y-3">
                           {q.options.map(opt => (
                             <button
                               key={opt} type="button"
                               onClick={() => handleAnswerChange(q.text, opt)}
                               className={`w-full p-5 rounded-2xl text-left font-bold text-sm transition-all flex justify-between items-center ${answers[q.text] === opt ? 'bg-slate-900 text-white shadow-xl translate-x-2' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                             >
                               <span>{opt}</span>
                               {answers[q.text] === opt && <CheckCircle2 size={18} className="text-teal-400" />}
                             </button>
                           ))}
                        </div>
                      )}

                      {q.type === 'TEXTO' && (
                        <textarea
                          placeholder="Escribe tu respuesta aquí..."
                          className="w-full bg-slate-50 border-none rounded-2xl p-6 font-medium text-slate-800 placeholder:text-slate-300 focus:ring-4 focus:ring-teal-500/10 outline-none transition min-h-[120px]"
                          value={answers[q.text] || ''}
                          onChange={(e) => handleAnswerChange(q.text, e.target.value)}
                        />
                      )}
                    </div>
                  </div>
                ))}

                <div className="pt-10 flex border-t border-slate-50">
                   <button 
                     type="submit" 
                     disabled={submitting || Object.keys(answers).length < selectedSurvey.survey.questions.length}
                     className={`flex-grow flex items-center justify-center space-x-3 py-6 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] transition-all shadow-2xl ${submitting || Object.keys(answers).length < selectedSurvey.survey.questions.length ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-teal-600 shadow-teal-900/40 translate-y-[-4px]'}`}
                   >
                     {submitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                     ) : (
                        <>
                          <span>Finalizar y Enviar Protocolo</span>
                          <Send size={18} />
                        </>
                     )}
                   </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in slide-in-from-bottom duration-700">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl px-8 py-6 border border-white/10 flex justify-between items-end">
        <div>
           <h1 className="text-4xl font-black text-white tracking-tight">Mis <span className="text-teal-300">Protocolos Activos</span></h1>
           <p className="text-white/60 font-medium mt-2">Por favor, selecciona una evaluación para sincronizar tus respuestas.</p>
        </div>
        <div className="hidden lg:block bg-white/10 px-6 py-4 rounded-[2rem] border border-white/10">
           <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Sincronización Científica</p>
           <p className="text-teal-300 font-black text-xs uppercase tracking-tight">Estado: Conectado</p>
        </div>
      </div>

      {surveys.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {surveys.map(item => {
             const completedToday = isCompletedToday(item.lastResponse);
             return (
               <div 
                 key={item.survey.id} 
                 onClick={() => handleStartSurvey(item)}
                 className="group bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 hover:shadow-2xl transition-all duration-500 cursor-pointer relative overflow-hidden active:scale-95"
               >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-[5rem] -mr-16 -mt-16 group-hover:bg-teal-500/10 transition-all duration-500"></div>
                  
                  <div className="max-w-[70%] relative z-10">
                     <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 bg-teal-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-teal-600/20 group-hover:rotate-12 transition">
                           <FileText size={24} />
                        </div>
                        {completedToday ? (
                          <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full border border-green-100 flex items-center space-x-1">
                             <Check size={12} strokeWidth={3} />
                             <span className="text-[10px] font-black uppercase tracking-widest">Completado Hoy</span>
                          </div>
                        ) : (
                          <div className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full border border-amber-100 flex items-center space-x-1">
                             <AlertCircle size={12} strokeWidth={3} />
                             <span className="text-[10px] font-black uppercase tracking-widest">Pendiente Hoy</span>
                          </div>
                        )}
                     </div>
                     <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-3 uppercase leading-tight group-hover:text-teal-600 transition">{item.survey.title}</h3>
                     <p className="text-slate-400 text-sm font-medium line-clamp-2">{item.survey.description || 'Este protocolo requiere tu evaluación científica diaria.'}</p>
                  </div>
  
                  <div className="mt-10 flex items-center space-x-3 text-teal-600 font-black text-[10px] uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                     <span>{completedToday ? 'Volver a Realizar' : 'Comenzar Evaluación'}</span>
                     <ArrowRight size={14} />
                  </div>
               </div>
             );
           })}
        </div>
      ) : (
        <div className="py-32 text-center bg-white rounded-[4rem] border-4 border-dashed border-slate-100 space-y-6">
           <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <CheckCircle2 size={40} />
           </div>
           <div>
              <p className="text-xl font-black text-slate-300 uppercase tracking-widest leading-none">Todo al día</p>
              <p className="text-slate-400 font-medium mt-2 italic">No tienes protocolos activos pendientes en este momento.</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
