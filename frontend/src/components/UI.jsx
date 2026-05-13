import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Bell, 
  Users, 
  ShieldAlert, 
  FileText, 
  Settings, 
  LogOut,
  MoreVertical,
  ChevronRight,
  Shield,
  Search,
  Plus
} from 'lucide-react';

export const GlassPanel = ({ children, className = '', ...props }) => (
  <div className={`glass-container rounded-[2rem] p-8 ${className}`} {...props}>
    {children}
  </div>
);

export const MetricCard = ({ icon: Icon, label, value, badge, badgeType = 'violet', ...props }) => (
  <div className="glass-container metric-card rounded-3xl p-6 border border-white/5" {...props}>
    <div className="flex justify-between items-start mb-6">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-violet-400">
        <Icon size={24} />
      </div>
      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
        badgeType === 'rose' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
      }`}>
        {badge}
      </span>
    </div>
    <div>
      <span className="text-[11px] font-mono uppercase tracking-widest text-slate-500 block mb-1">{label}</span>
      <span className="text-3xl font-syne font-extrabold text-white">{value}</span>
    </div>
  </div>
);

export const Button = ({ variant = 'primary', children, className = '', ...props }) => {
  const variants = {
    primary: 'bg-violet text-white hover:shadow-violet',
    outline: 'border border-white/10 text-slate-300 hover:border-violet hover:text-white hover:bg-violet/5',
    ghost: 'text-slate-400 hover:text-white transition-colors',
    rose: 'bg-rose text-white hover:shadow-rose'
  };
  
  return (
    <button 
      className={`px-6 py-3 rounded-xl font-syne font-bold text-sm transition-all flex items-center justify-center gap-2 border-0 cursor-pointer ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

export const Badge = ({ children, type = 'violet', className = '' }) => {
  const types = {
    violet: 'bg-violet/10 text-violet-400 border-violet/20',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rose: 'bg-rose/10 text-rose-400 border-rose/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  };
  return (
    <div className={`flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded-full ${className}`}>
      <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
        type === 'green' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 
        type === 'rose' ? 'bg-rose-400 shadow-[0_0_8px_rgba(255,107,157,0.6)]' :
        type === 'orange' ? 'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.6)]' :
        'bg-violet-400'
      }`}></div>
      <span className="text-[10px] font-bold text-white uppercase tracking-widest">{children}</span>
    </div>
  );
};

export const Sidebar = ({ active = 'Utilisateurs', user, onTabChange, onLogout }) => {
  const categories = [
    {
      label: 'PRINCIPAL',
      items: [
        { name: 'Tableau de bord', icon: LayoutDashboard },
        { name: 'Réservations', icon: Calendar },
        { name: 'Notifications', icon: Bell, badge: '3' },
      ]
    },
    {
      label: 'ADMIN',
      items: [
        { name: 'Utilisateurs', icon: Users },
        { name: 'Permissions', icon: ShieldAlert },
        { name: 'Logs', icon: FileText },
        { name: 'Paramètres', icon: Settings },
      ]
    }
  ];

  return (
    <aside className="w-72 h-screen fixed left-0 top-0 bg-[#0A0A12] border-r border-white/5 flex flex-col z-50">
      <div className="p-8 pb-12">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-[#7B5EFF] font-bold tracking-[0.4em] mb-1">SR</span>
          <h1 className="text-3xl font-syne font-black text-white tracking-tighter leading-none">SECURE</h1>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-8 overflow-y-auto">
        {categories.map(cat => (
          <div key={cat.label}>
            <p className="px-4 text-[10px] font-mono font-bold text-slate-600 tracking-[0.3em] mb-4 uppercase">{cat.label}</p>
            <div className="space-y-1">
              {cat.items.map(item => (
                <button
                  key={item.name}
                  onClick={() => onTabChange && onTabChange(item.name)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all relative group ${
                    active === item.name 
                      ? 'bg-violet/10 text-white font-bold' 
                      : 'text-slate-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 text-sm">
                    {active === item.name && (
                      <div className="absolute left-0 w-1 h-6 bg-violet rounded-r-full"></div>
                    )}
                    <item.icon size={18} className={active === item.name ? 'text-violet-400' : 'group-hover:text-violet-400'} />
                    {item.name}
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-violet text-[9px] font-black text-white shadow-violet">{item.badge}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-between group">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-rose-500 flex items-center justify-center text-[10px] font-black text-white shadow-lg">
            {user?.full_name?.substring(0, 2).toUpperCase() || 'TK'}
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">{user?.full_name || 'Toky'}</p>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Super Admin</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="p-2.5 rounded-xl bg-white/5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-white/5"
          title="Déconnexion"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};

export const Input = ({ label, ...props }) => (
  <div className="space-y-2">
    {label && <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 ml-1">{label}</label>}
    <input 
      className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#7B5EFF]/50 focus:ring-1 focus:ring-[#7B5EFF]/20 transition-all"
      {...props}
    />
  </div>
);

export const Alert = ({ alert, onClose }) => {
  if (!alert) return null;
  return (
    <div className={`fixed top-6 right-6 z-50 p-5 rounded-2xl shadow-2xl animate-fade border-l-4 ${
      alert.type === 'success' 
        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300' 
        : 'bg-rose-500/10 border-rose-500 text-rose-300'
    }`} style={{ backdropFilter: 'blur(16px)', minWidth: '320px' }}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full animate-pulse ${alert.type === 'success' ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
          <span className="text-xs font-bold font-syne tracking-tight uppercase">{alert.message}</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/50">&times;</button>
      </div>
    </div>
  );
};
