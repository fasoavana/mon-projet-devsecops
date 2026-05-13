import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import { GlassPanel, MetricCard, Button, Badge, Input, Alert } from '../components/UI';
import ReservationModal from '../components/ReservationModal';
import { 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Users, 
  LayoutDashboard, 
  Plus, 
  Filter, 
  Download, 
  LogOut,
  ChevronRight,
  MoreVertical,
  Inbox,
  Search
} from 'lucide-react';

import AdminView from '../components/AdminView';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState(null);
  
  const loadReservations = async () => {
    setLoading(true);
    const response = await api.getReservations();
    if (response.ok) setReservations(response.data);
    setLoading(false);
  };

  useEffect(() => {
    loadReservations();
  }, []);

  if (user?.role === 'admin') {
    return <AdminView user={user} reservations={reservations} logout={logout} />;
  }

  const handleCreateReservation = async (data) => {
    const response = await api.createReservation(data);
    if (response.ok) {
      setAlert({ message: 'Réservation créée avec succès !', type: 'success' });
      loadReservations();
    } else {
      setAlert({ message: response.error, type: 'danger' });
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Date', 'Heure', 'Description', 'Statut', 'Propriétaire'];
    const rows = filteredReservations.map(r => [
      r.id, r.date, r.time, r.description, r.status, r.owner?.email
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reservations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredReservations = reservations.filter(r => 
    r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.date.includes(searchTerm) ||
    r.owner?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: reservations.length,
    upcoming: reservations.filter(r => new Date(r.date) >= new Date().setHours(0,0,0,0)).length,
    today: reservations.filter(r => r.date === new Date().toISOString().split('T')[0]).length,
    security: 99.9
  };

  return (
    <div className="min-h-screen pb-20 animate-fade">
      <Alert alert={alert} onClose={() => setAlert(null)} />
      <ReservationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreateReservation} 
      />

      {/* Header */}
      <header className="flex items-center justify-between py-10 mb-10">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono text-[#7B5EFF] font-bold tracking-widest">SR</span>
          </div>
          <h1 className="text-5xl font-syne font-black text-white tracking-tighter leading-none mb-2">SECURE</h1>
          <p className="text-sm font-medium text-slate-500">Management Console</p>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-4 bg-[#1A1A2E]/50 px-5 py-3 rounded-full border border-white/5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7B5EFF] to-[#FF6B9D] flex items-center justify-center text-xs font-black text-white">
              {user?.full_name?.substring(0, 2).toUpperCase() || 'TK'}
            </div>
            <div className="text-left">
              <p className="text-sm font-mono text-white leading-none mb-1">{user?.email}</p>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Vérifié</span>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={logout} className="text-xs py-2 px-6 border-white/10 rounded-xl hover:bg-white/5">
            Déconnexion
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="space-y-12">
        <section>
          <span className="text-[11px] font-mono uppercase tracking-[0.4em] text-slate-500 block mb-3">TABLEAU DE BORD</span>
          <h2 className="text-4xl font-syne font-extrabold text-white mb-3">Vos Réservations</h2>
          <p className="text-slate-400 text-base font-medium">Contrôle complet de vos réservations sécurisées.</p>
        </section>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-container led-border rounded-[2rem] p-8 flex flex-col justify-between min-h-[220px]">
            <Calendar size={24} className="text-violet-400 mb-6" />
            <div>
              <span className="text-4xl font-syne font-black text-white block mb-2">{stats.total}</span>
              <span className="text-xs font-medium text-slate-500 block mb-4">Total réservations</span>
              <div className="inline-flex px-3 py-1 bg-white/5 rounded-lg border border-white/5 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                Aucune activité
              </div>
            </div>
          </div>

          <div className="glass-container led-border rounded-[2rem] p-8 flex flex-col justify-between min-h-[220px]">
            <Clock size={24} className="text-violet-400 mb-6" />
            <div>
              <span className="text-4xl font-syne font-black text-white block mb-2">{stats.upcoming}</span>
              <span className="text-xs font-medium text-slate-500 block mb-4">À venir</span>
              <div className="inline-flex px-3 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
                En attente
              </div>
            </div>
          </div>

          <div className="glass-container led-border rounded-[2rem] p-8 flex flex-col justify-between min-h-[220px]">
            <Users size={24} className="text-violet-400 mb-6" />
            <div>
              <span className="text-4xl font-syne font-black text-white block mb-2">{stats.today}</span>
              <span className="text-xs font-medium text-slate-500 block mb-4">En cours aujourd'hui</span>
              <div className="inline-flex px-3 py-1 bg-orange-500/10 rounded-lg border border-orange-500/20 text-[9px] font-bold text-orange-400 uppercase tracking-widest">
                Aujourd'hui
              </div>
            </div>
          </div>

          <div className="glass-container led-border rounded-[2rem] p-8 flex flex-col justify-between min-h-[220px]">
            <ShieldCheck size={24} className="text-violet-400 mb-6" />
            <div>
              <span className="text-4xl font-syne font-black text-white block mb-2">{stats.security}%</span>
              <span className="text-xs font-medium text-slate-500 block mb-4">Taux de sécurité</span>
              <div className="inline-flex px-3 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
                Optimal
              </div>
            </div>
          </div>
        </div>

        <div className="glass-container led-border rounded-[2.5rem] overflow-hidden">
          <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="text-xl font-syne font-bold text-white">Historique des réservations</h3>
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block min-w-[240px]">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-violet/50"
                />
              </div>
              <Button variant="outline" onClick={() => {}} className="text-xs">Filtrer</Button>
              <Button variant="outline" onClick={exportToCSV} className="text-xs">Exporter</Button>
              <Button onClick={() => setIsModalOpen(true)} className="text-xs">+ Nouvelle</Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredReservations.length > 0 ? (
              <table className="sr-table">
                <thead>
                  <tr>
                    <th className="font-mono uppercase text-[10px] tracking-widest">Réservation</th>
                    <th className="font-mono uppercase text-[10px] tracking-widest">Date</th>
                    <th className="font-mono uppercase text-[10px] tracking-widest">Statut</th>
                    <th className="font-mono uppercase text-[10px] tracking-widest">Type</th>
                    <th className="font-mono uppercase text-[10px] tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map(res => (
                    <tr key={res.id}>
                      <td className="font-mono text-sm text-white">
                        <div className="flex flex-col">
                          <span>{res.date}</span>
                          <span className="text-[11px] text-violet-400">{res.time}</span>
                        </div>
                      </td>
                      <td className="text-sm text-slate-300 font-medium">{res.description}</td>
                      <td>
                        <Badge type={res.status === 'confirmed' ? 'green' : 'violet'}>{res.status}</Badge>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-[9px] font-mono text-slate-400">
                            {res.owner?.email?.[0].toUpperCase()}
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">{res.owner?.email}</span>
                        </div>
                      </td>
                      <td className="text-right">
                        <button className="p-2 text-slate-600 hover:text-white transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-32 flex flex-col items-center justify-center text-center px-6">
                <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center text-slate-700 mb-6 border border-white/5">
                  <Inbox size={40} />
                </div>
                <h4 className="text-xl font-syne font-bold text-white mb-2">Aucune réservation</h4>
                <p className="text-slate-500 text-sm max-w-xs mb-8">Commencez par créer votre première réservation sécurisée pour voir l'historique ici.</p>
                <Button><Plus size={16} /> Créer ma première réservation</Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Administration Section (Admin only) */}
        {user?.role === 'admin' && (
          <div className="space-y-6 animate-fade">
            <section>
              <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-rose-500 block mb-2">ZONE ADMINISTRATION</span>
              <h2 className="text-2xl font-syne font-bold text-white mb-2">Gestion des Comptes</h2>
            </section>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard icon={Users} label="Utilisateurs totaux" value={reservations.reduce((acc, r) => acc.add(r.owner?.email), new Set()).size} badge="Comptes actifs" />
              <div className="md:col-span-2 glass-container led-border rounded-[2rem] p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-syne font-bold text-white">Utilisateurs récents</h3>
                  <Button variant="outline" className="text-xs py-2 px-4">Voir tout</Button>
                </div>
                <div className="space-y-4">
                  {[...new Set(reservations.map(r => r.owner?.email))].slice(0, 3).map(email => (
                    <div key={email} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-rose-500 flex items-center justify-center text-[10px] font-black text-white">
                          {email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{email}</p>
                          <p className="text-[10px] font-mono text-slate-500 uppercase">Rôle : User</p>
                        </div>
                      </div>
                      <Badge type="green">ACTIF</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
