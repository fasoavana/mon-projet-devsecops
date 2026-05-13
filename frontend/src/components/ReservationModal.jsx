import React, { useState } from 'react';
import { Button, Input, GlassPanel } from './UI';
import { X, Calendar as CalIcon, Clock, AlignLeft, Shield } from 'lucide-react';

const ReservationModal = ({ isOpen, onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    description: '',
    type: 'Standard'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade">
      <GlassPanel className="w-full max-w-lg p-0 overflow-hidden led-border border-white/10 shadow-2xl">
        {/* Modal Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet/10 flex items-center justify-center text-violet-400">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="text-xl font-syne font-bold text-white">Nouvelle Réservation</h3>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Étape {step} sur 2</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-8 space-y-6">
            {step === 1 ? (
              <div className="space-y-6 animate-fade">
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Date d'accès" 
                    type="date" 
                    value={formData.date} 
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    required 
                  />
                  <Input 
                    label="Heure" 
                    type="time" 
                    value={formData.time} 
                    onChange={e => setFormData({...formData, time: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 ml-1">Type d'accès</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Standard', 'Sécurisé', 'Urgent', 'Maintenance'].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormData({...formData, type: t})}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all text-left ${
                          formData.type === t 
                            ? 'border-violet bg-violet/10 text-white shadow-violet' 
                            : 'border-white/5 bg-white/5 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-fade">
                <Input 
                  label="Description / Motif" 
                  placeholder="Expliquez la raison de l'accès..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  required
                />
                <div className="p-4 rounded-xl bg-violet/5 border border-violet/20 flex gap-4">
                  <Shield className="text-violet-400 shrink-0" size={24} />
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">Confirmation de Sécurité</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      En soumettant cette demande, vous confirmez que les informations sont exactes et conformes aux protocoles SR Secure.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-white/5 bg-white/5 flex gap-3">
            {step === 2 && (
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">Retour</Button>
            )}
            {step === 1 ? (
              <Button type="button" onClick={() => setStep(2)} className="flex-1">Continuer</Button>
            ) : (
              <Button type="submit" className="flex-1">Confirmer la Réservation</Button>
            )}
          </div>
        </form>
      </GlassPanel>
    </div>
  );
};

export default ReservationModal;
