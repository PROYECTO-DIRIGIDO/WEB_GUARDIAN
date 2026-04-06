import React, { useState, useEffect } from 'react';

const ProfileSettings = ({ user, onUpdate }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

  const fetchProfile = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/profile', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(profile)
      });
      if (response.ok) {
        setMessage('¡Perfil actualizado con éxito!');
        setIsEditing(false);
        setTimeout(() => setMessage(''), 3000);
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error("Error updating profile", error);
    }
  };

  if (loading) return <div className="text-center py-20 font-black text-slate-300 animate-pulse uppercase tracking-widest">Cargando Perfil...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-[3rem] shadow-xl shadow-teal-900/5 overflow-hidden border border-slate-100">
        {/* Header con Foto */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-500 h-32 relative">
           <div className="absolute -bottom-16 left-12">
              <div className="relative group">
                <img 
                  src={profile.profilePicture || `https://ui-avatars.com/api/?name=${profile.username}&background=random`} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-[2.5rem] border-4 border-white shadow-2xl object-cover bg-white"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition rounded-[2.5rem] flex items-center justify-center cursor-pointer">
                   <span className="text-white text-[10px] font-black uppercase tracking-widest">Cambiar</span>
                </div>
              </div>
           </div>
           <div className="absolute bottom-4 right-8">
              <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">
                {profile.role}
              </span>
           </div>
        </div>

        <div className="pt-20 px-12 pb-12">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">{profile.fullName || profile.username}</h2>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">{profile.position || 'Miembro de Guardian'}</p>
            </div>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-xs hover:bg-teal-600 transition shadow-lg shadow-slate-200"
              >
                ACTUALIZAR DATOS
              </button>
            )}
          </div>

          {message && (
            <div className="mb-8 bg-green-50 text-green-600 p-4 rounded-2xl text-xs font-black text-center border border-green-100 animate-bounce">
              {message}
            </div>
          )}

          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ProfileField 
              label="Nombre Completo" 
              value={profile.fullName} 
              disabled={!isEditing} 
              onChange={(v) => setProfile({...profile, fullName: v})}
            />
            <ProfileField 
              label="Cargo / Especialidad" 
              value={profile.position} 
              disabled={!isEditing}
              onChange={(v) => setProfile({...profile, position: v})}
            />
            <ProfileField 
              label="Teléfono de Contacto" 
              value={profile.phone} 
              disabled={!isEditing}
              onChange={(v) => setProfile({...profile, phone: v})}
            />
            <ProfileField 
              label="Correo Electrónico" 
              value={profile.email} 
              disabled={!isEditing}
              onChange={(v) => setProfile({...profile, email: v})}
            />
            <ProfileField 
              label="Lugar de Trabajo / Sede" 
              value={profile.workplace} 
              disabled={!isEditing}
              className="md:col-span-2"
              onChange={(v) => setProfile({...profile, workplace: v})}
            />

            {isEditing && (
              <div className="md:col-span-2 flex space-x-4 pt-6">
                <button 
                  type="submit"
                  className="flex-1 bg-teal-600 text-white py-4 rounded-2xl font-black text-xs shadow-xl shadow-teal-100 hover:bg-teal-700 transition"
                >
                  GUARDAR CAMBIOS
                </button>
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-8 py-4 text-slate-400 font-black text-xs hover:text-slate-600"
                >
                  CANCELAR
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
      
      <div className="mt-12 text-center opacity-40">
         <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Configuraci&oacute;n Protegida • Suite v2.1</p>
      </div>
    </div>
  );
};

const ProfileField = ({ label, value, disabled, onChange, className = "" }) => (
  <div className={`space-y-2 ${className}`}>
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input 
      type="text" 
      value={value || ''} 
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full p-4 rounded-2xl text-sm font-bold transition ${disabled ? 'bg-slate-50 text-slate-500 border-transparent' : 'bg-white border-2 border-teal-100 text-slate-800 focus:border-teal-500 focus:ring-4 focus:ring-teal-50'}`}
    />
  </div>
);

export default ProfileSettings;
