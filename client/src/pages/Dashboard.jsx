import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import { 
  Users, 
  Home, 
  CheckCircle, 
  AlertCircle, 
  CreditCard, 
  Megaphone,
  ArrowRight,
  ShieldAlert,
  Phone
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalResidents: 0,
    pendingApprovals: 0,
    totalFlats: 0,
    activeComplaints: 0,
    pendingBills: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // Fetch users directory count
        const directoryRes = await API.get('/users/directory');
        
        let pendingCount = 0;
        let flatsCount = 0;

        if (['admin', 'super_admin'].includes(user.role)) {
          const allUsersRes = await API.get('/users?isApproved=false');
          pendingCount = allUsersRes.data.count;

          const flatsRes = await API.get('/flats');
          flatsCount = flatsRes.data.count;
        }

        setStats({
          totalResidents: directoryRes.data.count,
          pendingApprovals: pendingCount,
          totalFlats: flatsCount,
          activeComplaints: 0, // Phase 4 placeholder
          pendingBills: 0,      // Phase 5 placeholder
        });
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [user]);

  const formatRole = (role) => {
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // Admin Dashboard View
  if (['admin', 'super_admin'].includes(user.role)) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight">Welcome, {user.name} 👋</h2>
          <p className="text-slate-400">Here is a quick summary of your housing society.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card rounded-2xl p-6 flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-slate-400 text-sm font-medium">Approved Residents</span>
              <p className="text-3xl font-bold text-slate-100">{stats.totalResidents}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <Users size={24} />
            </div>
          </div>

          <Link to="/admin" className="glass-card rounded-2xl p-6 flex items-center justify-between hover:bg-slate-900/60 group">
            <div className="space-y-2">
              <span className="text-slate-400 text-sm font-medium">Pending Approvals</span>
              <p className={`text-3xl font-bold ${stats.pendingApprovals > 0 ? 'text-amber-400' : 'text-slate-100'}`}>
                {stats.pendingApprovals}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertCircle size={24} />
            </div>
          </Link>

          <div className="glass-card rounded-2xl p-6 flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-slate-400 text-sm font-medium">Total Society Flats</span>
              <p className="text-3xl font-bold text-slate-100">{stats.totalFlats}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Home size={24} />
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-slate-400 text-sm font-medium">Active Complaints</span>
              <p className="text-3xl font-bold text-slate-100">{stats.activeComplaints}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
              <AlertCircle size={24} />
            </div>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold">Quick Administrative Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/admin" className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 flex flex-col gap-2 group transition-colors">
                <CheckCircle className="text-brand-400" size={20} />
                <span className="font-semibold text-sm">Approve Users</span>
                <span className="text-xs text-slate-400">Authorize pending resident registrations</span>
              </Link>
              <Link to="/directory" className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 flex flex-col gap-2 group transition-colors">
                <Users className="text-indigo-400" size={20} />
                <span className="font-semibold text-sm">Resident Directory</span>
                <span className="text-xs text-slate-400">Search directory and filter by flats</span>
              </Link>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="text-lg font-bold">System Status</h3>
              <p className="text-sm text-slate-400">All gateway modules operational. Security gateway connection online.</p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Environment: Production Dev</span>
              <span>API Gateway: Online</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Security Guard Dashboard View
  if (user.role === 'security_guard') {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight">Security Command Center 🚨</h2>
          <p className="text-slate-400">Logged in as: {user.name} (Security Guard)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link to="/visitors" className="glass-panel rounded-2xl p-8 hover:bg-slate-900/40 transition-colors flex flex-col items-center justify-center text-center gap-4 group">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldAlert size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold group-hover:text-brand-400 transition-colors">Log New Visitor</h3>
              <p className="text-sm text-slate-400 max-w-sm">Open the visitor entry form to request instant mobile approvals from residents.</p>
            </div>
            <div className="flex items-center gap-2 text-brand-400 text-sm font-semibold mt-2">
              Go to Security Screen <ArrowRight size={16} />
            </div>
          </Link>

          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold">Recent Entry Logs</h3>
            <p className="text-sm text-slate-400">Visitor history tracking is disabled in this phase. Real-time logging opens in Phase 3.</p>
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Gate Station: Main Gate 1</span>
              <span>Guard ID: {user._id.toString().substring(0, 8)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Resident / Tenant Dashboard View
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Hello, {user.name} 👋</h2>
        <p className="text-slate-400">Welcome to your home directory panel.</p>
      </div>

      {/* Info Card Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <Home size={20} />
            </div>
            <h3 className="font-semibold text-slate-200">Flat Details</h3>
          </div>
          {user.flatId ? (
            <div className="space-y-1 text-sm text-slate-400">
              <p>Block: <strong className="text-slate-200">{user.flatId.block}</strong></p>
              <p>Flat Number: <strong className="text-slate-200">{user.flatId.flatNumber}</strong></p>
            </div>
          ) : (
            <p className="text-xs text-amber-400">No flat currently linked to your profile.</p>
          )}
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <CreditCard size={20} />
            </div>
            <h3 className="font-semibold text-slate-200">Maintenance Fees</h3>
          </div>
          <div className="space-y-1 text-sm text-slate-400">
            <p>Status: <span className="text-emerald-400 font-semibold">Paid</span></p>
            <p>Next Due: <strong className="text-slate-200">N/A</strong></p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Megaphone size={20} />
            </div>
            <h3 className="font-semibold text-slate-200">Notice Bulletin</h3>
          </div>
          <div className="space-y-1 text-sm text-slate-400">
            <p>Recent Notices: <strong className="text-slate-200">0</strong></p>
            <p>Active Polls: <strong className="text-slate-200">0</strong></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/directory" className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 flex flex-col gap-2 transition-colors">
              <Users className="text-brand-400" size={18} />
              <span className="font-medium text-sm">Resident Directory</span>
            </Link>
            <Link to="/directory" className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 flex flex-col gap-2 transition-colors">
              <Phone className="text-indigo-400" size={18} />
              <span className="font-medium text-sm">Emergency Info</span>
            </Link>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-center items-center text-center p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-brand-400">
            <ShieldAlert size={24} />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold">Real-time Visitor Guard</h4>
            <p className="text-xs text-slate-400 max-w-xs">You will automatically receive alerts here when gate security logs visitors requesting entry approvals.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
