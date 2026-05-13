import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import { Alert } from './components/UI';

const MainApp = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#03040b]">
        <div className="text-violet-500 animate-pulse font-black tracking-widest uppercase text-xl">
          Initialisation sécurisée...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {user ? <Dashboard /> : <Login />}
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
