import React from 'react';
import { 
  Sidebar, 
  MetricCard, 
  Button, 
  Badge, 
  GlassPanel, 
  Input 
} from '../components/UI';
import { 
  Users, 
  UserCheck, 
  UserX, 
  UserPlus, 
  Search, 
  Filter, 
  Download, 
  MoreVertical,
  ExternalLink,
  Eye,
  Lock,
  ChevronRight,
  Plus,
  ArrowUpRight
} from 'lucide-react';

const AdminView = ({ user, reservations, logout }) => {
  const [activeTab, setActiveTab] = React.useState('Utilisateurs');
  const [searchTerm, setSearchTerm] = React.useState('');

  const users = [...new Set(reservations.map(r => r.owner?.email))].map((email, i) => ({
    id: i,
    name: email.split('@')[0],
    email: email,
    role: i === 0 ? 'Admin' : 'Éditeur',
    status: i % 3 === 0 ? 'Actif' : 'En ligne',
    lastSeen: 'Maintenant'
  }));

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: 'Total utilisateurs', value: '12', icon: Users, badge: '+2 ce mois' },
    { label: 'Actifs', value: '9', icon: UserCheck, badge: 'En ligne', badgeType: 'green' },
    { label: 'Suspendus', value: '2', icon: UserX, badge: 'Action requise', badgeType: 'rose' },
    { label: 'Invitations en attente', value: '1', icon: UserPlus, badge: 'Expirent bientôt', badgeType: 'orange' },
  ];

  return (
    <div className="flex min-h-screen bg-[#05050A]">
      <Sidebar user={user} active={activeTab} onTabChange={setActiveTab} onLogout={logout} />
      
      <main className="flex-1 ml-72 p-12 space-y-12 animate-fade">
        {activeTab === 'Utilisateurs' ? (
          <>
            <header className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-syne font-black text-white mb-2">Gestion des utilisateurs</h1>
                <p className="text-slate-500 font-medium">Gérez les comptes, rôles et accès de votre équipe.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="text-xs px-6 border-white/10">
                  <Download size={14} /> Exporter
                </Button>
                <Button variant="primary" className="text-xs px-6 bg-violet shadow-violet">
                  <Plus size={14} /> Inviter un utilisateur
                </Button>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((s, i) => (
                <div key={i} className="glass-container led-border rounded-[2rem] p-8 flex flex-col justify-between min-h-[200px]">
                  <s.icon size={24} className="text-violet-400 mb-6" />
                  <div>
                    <span className="text-4xl font-syne font-black text-white block mb-2">{s.value}</span>
                    <span className="text-xs font-medium text-slate-500 block mb-4">{s.label}</span>
                    <Badge type={s.badgeType || 'green'}>{s.badge}</Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-container led-border rounded-[2.5rem] overflow-hidden">
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                <h3 className="text-xl font-syne font-bold text-white">Liste des membres</h3>
                <div className="flex items-center gap-3">
                  <div className="relative min-w-[320px]">
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="Chercher un utilisateur..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full bg-[#1A1A2E]/80 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-violet/50 shadow-inner"
                    />
                  </div>
                  <Button variant="outline" className="text-xs py-3 px-5 border-white/10">
                    <Filter size={14} className="mr-2" /> Filtrer
                  </Button>
                </div>
              </div>

              <table className="sr-table">
                <thead>
                  <tr>
                    <th className="font-mono uppercase text-[10px] tracking-widest p-6">Utilisateur</th>
                    <th className="font-mono uppercase text-[10px] tracking-widest">Rôle</th>
                    <th className="font-mono uppercase text-[10px] tracking-widest">Statut</th>
                    <th className="font-mono uppercase text-[10px] tracking-widest">Dernière connexion</th>
                    <th className="font-mono uppercase text-[10px] tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="group hover:bg-white/[0.02] transition-colors border-b border-white/[0.02] last:border-0">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-rose-500 flex items-center justify-center text-[10px] font-black text-white shadow-lg">
                            {u.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white group-hover:text-violet-400 transition-colors capitalize">{u.name}</p>
                            <p className="text-[11px] font-mono text-slate-500 lowercase">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-widest ${
                          u.role === 'Admin' ? 'bg-violet/10 text-violet-400 border-violet/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                          {u.role === 'Admin' ? <Shield size={12} /> : <FileText size={12} />}
                          {u.role}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'Actif' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-slate-500'}`}></div>
                          <span className={`text-[11px] font-bold ${u.status === 'Actif' ? 'text-emerald-400' : 'text-slate-500'}`}>{u.status}</span>
                        </div>
                      </td>
                      <td className="text-xs font-mono text-slate-500">Maintenant</td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2 px-6">
                          <button className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-violet/20 transition-all border border-white/5">
                            <Eye size={16} />
                          </button>
                          <button className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-white/5">
                            <Lock size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : activeTab === 'Tableau de bord' ? (
          <>
            <header className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-syne font-black text-white mb-2">Aperçu Global</h1>
                <p className="text-slate-500 font-medium">Statistiques en temps réel de toute la plateforme.</p>
              </div>
              <Button variant="rose" className="text-xs px-6">
                <ShieldAlert size={14} className="mr-2" /> Rapport de Sécurité
              </Button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 glass-container led-border rounded-[2.5rem] p-10 bg-gradient-to-br from-violet-900/10 to-transparent">
                <h3 className="text-xl font-syne font-bold text-white mb-8">Flux de réservations (7 jours)</h3>
                <div className="h-64 flex items-end gap-4">
                  {[40, 65, 45, 90, 60, 85, 100].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-4">
                      <div className="w-full bg-violet/20 rounded-t-xl relative group" style={{ height: `${h}%` }}>
                        <div className="absolute inset-0 bg-violet opacity-0 group-hover:opacity-40 transition-opacity rounded-t-xl"></div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-600">J-{6-i}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="glass-container led-border rounded-[2.5rem] p-10 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-syne font-bold text-white mb-2">Santé du Système</h3>
                  <p className="text-sm text-slate-500 mb-8">Tous les serveurs sont opérationnels.</p>
                </div>
                <div className="space-y-6">
                  {[
                    { label: 'Base de données', status: 'Optimal', val: 98 },
                    { label: 'Authentification', status: 'Stable', val: 100 },
                    { label: 'API Gateway', status: 'Actif', val: 95 }
                  ].map((s, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-slate-400 uppercase tracking-widest">{s.label}</span>
                        <span className="text-emerald-400">{s.status}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400" style={{ width: `${s.val}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass-container led-border rounded-[2.5rem] overflow-hidden">
              <div className="p-8 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-xl font-syne font-bold text-white">Dernières réservations globales</h3>
                <Button variant="outline" className="text-xs">Voir tout l'historique</Button>
              </div>
              <table className="sr-table">
                <thead>
                  <tr>
                    <th className="font-mono uppercase text-[10px] tracking-widest p-6">ID</th>
                    <th className="font-mono uppercase text-[10px] tracking-widest">Client</th>
                    <th className="font-mono uppercase text-[10px] tracking-widest">Date & Heure</th>
                    <th className="font-mono uppercase text-[10px] tracking-widest text-right">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.slice(0, 5).map(res => (
                    <tr key={res.id}>
                      <td className="p-6 font-mono text-xs text-violet-400">#RES-{res.id}</td>
                      <td className="text-sm font-bold text-white">{res.owner?.email}</td>
                      <td className="text-sm text-slate-300">{res.date} at {res.time}</td>
                      <td className="text-right">
                        <Badge type="green">Confirmé</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : activeTab === 'Logs' ? (
          <>
            <header className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-syne font-black text-white mb-2">Journal d'activité</h1>
                <p className="text-slate-500 font-medium">Audit complet des événements système.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="text-xs px-6">Télécharger Log (.txt)</Button>
              </div>
            </header>

            <div className="glass-container led-border rounded-[2.5rem] overflow-hidden">
              <table className="sr-table">
                <thead>
                  <tr>
                    <th className="font-mono uppercase text-[10px] tracking-widest p-6">Horodatage</th>
                    <th className="font-mono uppercase text-[10px] tracking-widest">Utilisateur</th>
                    <th className="font-mono uppercase text-[10px] tracking-widest">Action effectuée</th>
                    <th className="font-mono uppercase text-[10px] tracking-widest text-right">Sévérité</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { time: '2024-05-07 14:22:10', user: 'admin@secure.com', action: 'Migration SQL terminée', sev: 'info' },
                    { time: '2024-05-07 14:15:05', user: 'toky@gmail.com', action: 'Nouvelle réservation #42', sev: 'success' },
                    { time: '2024-05-07 12:45:30', user: 'System', action: 'Backup automatique', sev: 'info' },
                    { time: '2024-05-07 11:30:12', user: 'Unknown', action: 'Échec de connexion (MDP erroné)', sev: 'rose' },
                  ].map((log, i) => (
                    <tr key={i}>
                      <td className="p-6 font-mono text-xs text-slate-500">{log.time}</td>
                      <td className="text-sm font-bold text-white">{log.user}</td>
                      <td className="text-sm text-slate-300">{log.action}</td>
                      <td className="text-right">
                        <Badge type={log.sev === 'info' ? 'blue' : log.sev === 'rose' ? 'rose' : 'green'}>
                          {log.sev.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <h2 className="text-3xl font-syne font-bold text-white mb-4">{activeTab}</h2>
            <p className="text-slate-500">Cette section est en cours de déploiement sécurisé...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminView;
