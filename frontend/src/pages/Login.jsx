import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import { GlassPanel, Button, Input, Alert } from '../components/UI';
import { Shield, UserPlus, LogIn } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (isRegister) {
      const res = await api.register({ email: formData.email, password: formData.password, full_name: formData.fullName });
      if (res.ok) {
        setIsRegister(false);
        setError({ message: 'Compte créé ! Connectez-vous.', type: 'success' });
      } else {
        setError({ message: res.error, type: 'danger' });
      }
    } else {
      const res = await login(formData.email, formData.password);
      if (!res.ok) setError({ message: res.error, type: 'danger' });
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 animate-fade relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7B5EFF] opacity-[0.03] blur-[120px] rounded-full"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FF6B9D] opacity-[0.03] blur-[120px] rounded-full"></div>
      
      <GlassPanel className="w-full max-w-md p-10 relative z-10 border border-white/5 led-border">
        <div className="text-center mb-10">
          <div className="flex flex-col items-center mb-6">
            <span className="text-[10px] font-mono text-[#7B5EFF] font-bold tracking-[0.4em] mb-1">SR</span>
            <h1 className="text-5xl font-syne font-black text-white tracking-tighter leading-none mb-2">SECURE</h1>
            <p className="text-xs font-mono text-slate-500 uppercase tracking-[0.3em]">Accès Console de Gestion</p>
          </div>
        </div>

        <Alert alert={error} onClose={() => setError(null)} />

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <Input 
              label="Nom Complet" 
              placeholder="Jean Dupont" 
              value={formData.fullName} 
              onChange={e => setFormData({...formData, fullName: e.target.value})} 
              required 
            />
          )}
          <Input 
            label="Identifiant" 
            type="email" 
            placeholder="admin@secure.com" 
            value={formData.email} 
            onChange={e => setFormData({...formData, email: e.target.value})} 
            required 
          />
          <Input 
            label="Mot de Passe" 
            type="password" 
            placeholder="••••••••" 
            value={formData.password} 
            onChange={e => setFormData({...formData, password: e.target.value})} 
            required 
          />
          
          <Button type="submit" className="w-full py-4 mt-6 flex justify-center" disabled={loading} variant={isRegister ? 'rose' : 'primary'}>
            {loading ? 'AUTHENTIFICATION...' : isRegister ? <><UserPlus size={18} /> S'INSCRIRE</> : <><LogIn size={18} /> SE CONNECTER</>}
          </Button>
        </form>

        <div className="mt-10 text-center border-t border-white/5 pt-8">
          <button 
            onClick={() => setIsRegister(!isRegister)} 
            className="text-slate-500 hover:text-[#7B5EFF] transition-colors text-[10px] font-mono uppercase tracking-[0.2em]"
          >
            {isRegister ? 'DÉJÀ MEMBRE ? CONNEXION' : 'PAS ENCORE DE COMPTE ? S\'INSCRIRE'}
          </button>
        </div>
      </GlassPanel>
    </div>
  );
};

export default Login;
