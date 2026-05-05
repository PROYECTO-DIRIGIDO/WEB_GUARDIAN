import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, MessageSquare, Smile, ListChecks, ChevronDown, Save, X, PlusCircle, AlertCircle, Check } from 'lucide-react';
import API_BASE_URL from '../config';

const SurveyManagement = ({ user }) => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('VIGENTE');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }
  const [newSurvey, setNewSurvey] = useState({
    title: '',
    description: '',
    questions: [{ text: '', type: 'TEXTO', options: [], tempOption: '' }]
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchSurveys = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/researcher/surveys`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSurveys(data);
      }
    } catch (error) {
      console.error("Error al cargar encuestas", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  const handleAddQuestion = () => {
    setNewSurvey({ 
      ...newSurvey, 
      questions: [...newSurvey.questions, { text: '', type: 'TEXTO', options: [], tempOption: '' }] 
    });
  };

  const handleRemoveQuestion = (index) => {
    const updatedQuestions = [...newSurvey.questions];
    updatedQuestions.splice(index, 1);
    setNewSurvey({ ...newSurvey, questions: updatedQuestions });
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...newSurvey.questions];
    updatedQuestions[index][field] = value;
    
    if (field === 'type') {
      if (value === 'ANIMO') {
        updatedQuestions[index].options = ['Bien', 'Regular', 'Mal'];
      } else if (value === 'SI_NO') {
        updatedQuestions[index].options = ['Sí', 'No'];
      } else if (value === 'MULTIPLE') {
        updatedQuestions[index].options = [];
      } else {
        updatedQuestions[index].options = [];
      }
    }

    setNewSurvey({ ...newSurvey, questions: updatedQuestions });
  };

  const handleAddOption = (qIndex) => {
    const updatedQuestions = [...newSurvey.questions];
    const optionText = updatedQuestions[qIndex].tempOption?.trim();
    if (optionText && !updatedQuestions[qIndex].options.includes(optionText)) {
      updatedQuestions[qIndex].options.push(optionText);
      updatedQuestions[qIndex].tempOption = '';
      setNewSurvey({ ...newSurvey, questions: updatedQuestions });
    }
  };

  const handleRemoveOption = (qIndex, oIndex) => {
    const updatedQuestions = [...newSurvey.questions];
    updatedQuestions[qIndex].options.splice(oIndex, 1);
    setNewSurvey({ ...newSurvey, questions: updatedQuestions });
  };

  const handleCreateSurvey = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/researcher/surveys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          title: newSurvey.title,
          description: newSurvey.description,
          questions: newSurvey.questions
            .filter(q => q.text.trim() !== '')
            .map(({ text, type, options }) => ({ text, type, options }))
        })
      });
      if (response.ok) {
        setShowModal(false);
        setNewSurvey({ title: '', description: '', questions: [{ text: '', type: 'TEXTO', options: [], tempOption: '' }] });
        showToast("Protocolo guardado como Borrador");
        setActiveTab('PENSADA');
        fetchSurveys();
      }
    } catch (error) {
      showToast("Error al crear protocolo", "error");
    }
  };

  const handleActivate = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/researcher/surveys/${id}/activate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (response.ok) {
        showToast("Protocolo activado correctamente");
        fetchSurveys();
      }
    } catch (error) {
      showToast("Error al activar protocolo", "error");
    }
  };

  const handleDeactivate = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/researcher/surveys/${id}/deactivate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (response.ok) {
        showToast("Protocolo movido a borradores");
        fetchSurveys();
      }
    } catch (error) {
      showToast("Error al desactivar protocolo", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este protocolo?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/researcher/surveys/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (response.ok) {
        showToast("Protocolo eliminado");
        fetchSurveys();
      }
    } catch (error) {
      showToast("Error al eliminar", "error");
    }
  };

  const filteredSurveys = surveys.filter(s => s.status === activeTab);

  return (
    <div className="space-y-6 animate-in fade-in duration-700 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-8 right-8 z-[200] flex items-center space-x-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right border ${toast.type === 'success' ? 'bg-white text-teal-600 border-teal-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
          {toast.type === 'success' ? <Check size={20} className="bg-teal-500 text-white rounded-full p-0.5" /> : <AlertCircle size={20} />}
          <span className="font-black text-[10px] uppercase tracking-widest">{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 bg-white/50 backdrop-blur-md p-6 md:p-8 rounded-[2.5rem] border border-white shadow-sm">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">Gesti&oacute;n de <span className="text-teal-600">Protocolos</span></h2>
          <p className="text-slate-500 font-medium mt-1">Dise&ntilde;a instrumentos de evaluaci&oacute;n clínica estructurada</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white px-6 md:px-8 py-3 md:py-4 rounded-2xl font-black transition flex items-center space-x-3 shadow-2xl shadow-slate-200 active:scale-95 text-sm uppercase tracking-widest w-full sm:w-auto justify-center"
        >
          <Plus size={20} />
          <span>Nueva Encuesta</span>
        </button>
      </div>

      <div className="flex space-x-2 bg-slate-100/50 backdrop-blur-sm p-1.5 rounded-[1.5rem] w-fit border border-slate-200/50">
        {['VIGENTE', 'PENSADA'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-3 rounded-xl text-[10px] font-black transition-all tracking-[0.2em] uppercase ${activeTab === tab ? 'bg-white text-teal-600 shadow-xl border border-slate-100 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {tab === 'VIGENTE' ? 'Activa' : 'Borradores'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-slate-300 font-black animate-pulse uppercase">Cargando...</div>
        ) : filteredSurveys.length > 0 ? (
          filteredSurveys.map(survey => (
            <div key={survey.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
               <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                       <h3 className="font-black text-slate-800 text-xl tracking-tight uppercase">{survey.title}</h3>
                    </div>
                    <p className="text-slate-400 text-sm font-medium line-clamp-2">{survey.description || 'Sin descripción.'}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleDelete(survey.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={16} />
                    </button>
                    <span className={`text-[9px] font-black px-4 py-1.5 rounded-full border ${survey.status === 'VIGENTE' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                      {survey.status}
                    </span>
                  </div>
               </div>
               
               <div className="space-y-3 mb-8">
                  {survey.questions?.slice(0, 3).map((q, idx) => (
                    <div key={idx} className="flex items-center space-x-3 bg-slate-50/50 p-4 rounded-xl border border-slate-50">
                       <div className="p-2 bg-white rounded-lg shadow-sm text-teal-600">
                          {q.type === 'SI_NO' ? <CheckCircle2 size={14} /> : q.type === 'ANIMO' ? <Smile size={14} /> : q.type === 'MULTIPLE' ? <ListChecks size={14} /> : <MessageSquare size={14} />}
                       </div>
                       <p className="text-xs font-bold text-slate-700 truncate">{q.text}</p>
                    </div>
                  ))}
               </div>

               <div className="flex space-x-3 mt-auto">
                 {survey.status === 'PENSADA' ? (
                   <button 
                     onClick={() => handleActivate(survey.id)}
                     className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-2xl font-black transition-all active:scale-95 shadow-lg shadow-teal-200 text-[10px] uppercase tracking-widest"
                   >
                     Activar Protocolo
                   </button>
                 ) : (
                   <button 
                     onClick={() => handleDeactivate(survey.id)}
                     className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-4 rounded-2xl font-black transition-all active:scale-95 text-[10px] uppercase tracking-widest border border-slate-200"
                   >
                     Desactivar / Guardar
                   </button>
                 )}
               </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
             <AlertCircle size={48} className="mx-auto text-slate-200 mb-4" />
             <p className="text-slate-400 font-bold italic">No hay protocolos en esta categor&iacute;a.</p>
          </div>
        )}
      </div>

      {/* Modal Nueva Encuesta */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white animate-in zoom-in duration-300">
            <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center text-slate-800">
              <h3 className="text-3xl font-black tracking-tighter">Nuevo <span className="text-teal-600">Protocolo</span></h3>
              <button onClick={() => setShowModal(false)} className="p-3 hover:bg-white rounded-full transition text-slate-400"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleCreateSurvey} className="p-10 overflow-y-auto space-y-8 custom-scrollbar">
              <div className="space-y-4">
                <input 
                  type="text" placeholder="Título de la Encuesta"
                  className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold text-slate-800 focus:ring-4 focus:ring-teal-500/10 transition"
                  value={newSurvey.title} onChange={(e) => setNewSurvey({ ...newSurvey, title: e.target.value })} required
                />
                <input 
                  type="text" placeholder="Descripción breve..."
                  className="w-full bg-slate-50 border-none rounded-2xl p-5 font-medium text-slate-600 focus:ring-4 focus:ring-teal-500/10 transition"
                  value={newSurvey.description} onChange={(e) => setNewSurvey({ ...newSurvey, description: e.target.value })}
                />
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preguntas de Evaluación</p>
                  <button type="button" onClick={handleAddQuestion} className="text-teal-600 font-black text-[10px] flex items-center space-x-1 hover:underline">
                    <Plus size={12} /> <span>AÑADIR PREGUNTA</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {newSurvey.questions.map((q, idx) => (
                    <div key={idx} className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 space-y-5 shadow-sm">
                       <div className="flex items-center gap-4">
                          <input 
                            type="text" placeholder={`Pregunta #${idx + 1}`}
                            className="flex-grow bg-white border-none rounded-xl p-4 text-sm font-bold shadow-sm focus:ring-2 focus:ring-teal-400 transition"
                            value={q.text} onChange={(e) => handleQuestionChange(idx, 'text', e.target.value)} required
                          />
                          <div className="flex bg-white p-1.5 rounded-xl border">
                             {['TEXTO', 'SI_NO', 'ANIMO', 'MULTIPLE'].map(type => (
                               <button 
                                 key={type} type="button" onClick={() => handleQuestionChange(idx, 'type', type)}
                                 className={`p-2.5 rounded-lg transition-all ${q.type === type ? 'bg-teal-600 text-white shadow-md' : 'text-slate-300 hover:text-slate-500'}`}
                               >
                                 {type === 'TEXTO' ? <MessageSquare size={16} /> : type === 'SI_NO' ? <CheckCircle2 size={16} /> : type === 'ANIMO' ? <Smile size={16} /> : <ListChecks size={16} />}
                               </button>
                             ))}
                          </div>
                          <button type="button" onClick={() => handleRemoveQuestion(idx)} className="p-3 text-slate-300 hover:text-red-500 transition"><Trash2 size={20} /></button>
                       </div>

                       {q.type === 'MULTIPLE' && (
                         <div className="space-y-4 animate-in slide-in-from-top-2">
                            <div className="flex gap-2">
                               <input 
                                 type="text" placeholder="Escribe una opción y enter..."
                                 className="flex-grow bg-white border-dashed border-2 border-slate-200 rounded-xl px-4 py-2 text-xs font-bold focus:border-teal-400 outline-none transition"
                                 value={q.tempOption || ''} 
                                 onChange={(e) => handleQuestionChange(idx, 'tempOption', e.target.value)}
                                 onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOption(idx))}
                               />
                               <button 
                                 type="button" onClick={() => handleAddOption(idx)}
                                 className="p-2 bg-slate-900 text-white rounded-xl hover:bg-teal-600 transition"
                               >
                                 <Plus size={20} />
                               </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                               {q.options.map((opt, oIdx) => (
                                 <div key={oIdx} className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border border-teal-100 shadow-sm animate-in zoom-in">
                                    <span className="text-[10px] font-black text-teal-700 uppercase">{opt}</span>
                                    <button type="button" onClick={() => handleRemoveOption(idx, oIdx)} className="text-slate-300 hover:text-red-500"><X size={12} /></button>
                                 </div>
                               ))}
                            </div>
                         </div>
                       )}

                       {(q.type === 'SI_NO' || q.type === 'ANIMO') && (
                         <div className="flex flex-wrap gap-2">
                            {q.options.map((opt, i) => (
                              <span key={i} className="px-4 py-1.5 bg-white border-none rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
                                {opt}
                              </span>
                            ))}
                         </div>
                       )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-5 text-slate-400 font-black text-xs uppercase tracking-widest">Descartar</button>
                <button type="submit" className="flex-[2] bg-slate-900 text-white py-5 rounded-[1.5rem] font-black shadow-xl hover:bg-slate-800 transition active:scale-95 uppercase text-xs tracking-widest">Guardar Protocolo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyManagement;
