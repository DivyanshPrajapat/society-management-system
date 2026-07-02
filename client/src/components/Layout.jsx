import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  ShieldAlert, 
  FileText, 
  CreditCard, 
  Megaphone, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  User as UserIcon 
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogoutClick = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['super_admin', 'admin', 'resident', 'tenant', 'security_guard'] },
    { name: 'Resident Directory', path: '/directory', icon: Users, roles: ['super_admin', 'admin', 'resident', 'tenant'] },
    { name: 'Gate Approvals', path: '/visitors', icon: ShieldAlert, roles: ['super_admin', 'admin', 'resident', 'tenant', 'security_guard'] },
    { name: 'Complaints', path: '/complaints', icon: FileText, roles: ['super_admin', 'admin', 'resident', 'tenant'] },
    { name: 'Billing & Ledger', path: '/billing', icon: CreditCard, roles: ['super_admin', 'admin', 'resident', 'tenant'] },
    { name: 'Notices & Polls', path: '/notices', icon: Megaphone, roles: ['super_admin', 'admin', 'resident', 'tenant'] },
    { name: 'Admin Panel', path: '/admin', icon: Settings, roles: ['super_admin', 'admin'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role));

  const formatRole = (role) => {
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      {/* Mobile sidebar toggle backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900/50">
          <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-brand-500/20">
              A
            </div>
            <span className="font-semibold text-lg tracking-wide bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
              Apms Society
            </span>
          </Link>
          <button className="lg:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/20">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/50">
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-brand-400">
              <UserIcon size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate text-slate-200">{user?.name}</p>
              <p className="text-xs text-brand-400 font-medium truncate mt-0.5">{formatRole(user?.role || '')}</p>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200
                  ${isActive 
                    ? 'bg-brand-600/10 border border-brand-500/20 text-brand-400' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'}
                `}
              >
                <Icon size={18} className={isActive ? 'text-brand-400' : 'text-slate-400'} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/30">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 transition-all duration-200"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header Bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900/30 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-lg font-semibold text-slate-100 capitalize">
              {location.pathname.substring(1).split('/')[0] || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {user?.societyId && (
              <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 border border-slate-700/60 text-slate-300">
                Society Member
              </span>
            )}
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
