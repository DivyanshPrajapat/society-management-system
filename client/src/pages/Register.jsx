import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import { User as UserIcon, Mail, Phone, Lock, Home, Landmark } from 'lucide-react';

const Register = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'resident',
    societyId: '',
    block: '',
    flatId: '',
  });

  const [societies, setSocieties] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [flats, setFlats] = useState([]);
  const [loadingSocieties, setLoadingSocieties] = useState(true);
  const [loadingFlats, setLoadingFlats] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch societies on mount
  useEffect(() => {
    const fetchSocieties = async () => {
      try {
        const response = await API.get('/societies');
        setSocieties(response.data.data);
      } catch (err) {
        console.error('Failed to load societies:', err);
        setError('Could not load societies list. Please reload the page.');
      } finally {
        setLoadingSocieties(false);
      }
    };
    fetchSocieties();
  }, []);

  // Update blocks when society changes
  const handleSocietyChange = (e) => {
    const socId = e.target.value;
    const selectedSoc = societies.find((s) => s._id === socId);
    
    setFormData((prev) => ({
      ...prev,
      societyId: socId,
      block: '',
      flatId: '',
    }));
    
    if (selectedSoc) {
      setBlocks(selectedSoc.blocks || []);
    } else {
      setBlocks([]);
    }
    setFlats([]);
  };

  // Fetch flats when block changes
  const handleBlockChange = async (e) => {
    const blockVal = e.target.value;
    setFormData((prev) => ({
      ...prev,
      block: blockVal,
      flatId: '',
    }));

    if (formData.societyId && blockVal) {
      setLoadingFlats(true);
      try {
        const response = await API.get(`/flats?societyId=${formData.societyId}&block=${blockVal}`);
        setFlats(response.data.data);
      } catch (err) {
        console.error('Failed to load flats:', err);
      } finally {
        setLoadingFlats(false);
      }
    } else {
      setFlats([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    // Build user request object
    const requestData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: formData.role,
    };

    // Include reference targets if relevant
    if (formData.role !== 'super_admin') {
      requestData.societyId = formData.societyId;
    }
    if (['resident', 'tenant'].includes(formData.role)) {
      requestData.flatId = formData.flatId;
    }

    const result = await registerAuth(requestData);
    setLoading(false);

    if (result.success) {
      setSuccessMsg(result.message);
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'resident',
        societyId: '',
        block: '',
        flatId: '',
      });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg glass-panel rounded-2xl p-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -ml-6 -mb-6"></div>

        <div className="flex flex-col items-center mb-8 relative">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-brand-500/20 mb-3">
            A
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">Register Account</h2>
          <p className="text-slate-400 text-sm mt-1">Submit your details for society authorization</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
            {successMsg}
            <div className="mt-3">
              <Link to="/login" className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold inline-block transition-colors">
                Go to Login
              </Link>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 text-slate-500" size={16} />
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full glass-input pl-10 text-sm"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-500" size={16} />
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full glass-input pl-10 text-sm"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-slate-500" size={16} />
                <input
                  type="text"
                  name="phone"
                  required
                  className="w-full glass-input pl-10 text-sm"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-500" size={16} />
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full glass-input pl-10 text-sm"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Account Role</label>
            <select
              name="role"
              className="w-full glass-input text-sm bg-slate-950"
              value={formData.role}
              onChange={handleInputChange}
            >
              <option value="resident">Resident / Owner</option>
              <option value="tenant">Tenant</option>
              <option value="security_guard">Security Guard</option>
              <option value="admin">Admin / Committee Member</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          {formData.role !== 'super_admin' && (
            <div className="space-y-4 border-t border-slate-800/80 pt-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Select Housing Society</label>
                <div className="relative">
                  <Landmark className="absolute left-3 top-3 text-slate-500" size={16} />
                  <select
                    name="societyId"
                    required
                    disabled={loadingSocieties}
                    className="w-full glass-input pl-10 text-sm bg-slate-950 disabled:opacity-50"
                    value={formData.societyId}
                    onChange={handleSocietyChange}
                  >
                    <option value="">-- Choose Society --</option>
                    {societies.map((soc) => (
                      <option key={soc._id} value={soc._id}>
                        {soc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {['resident', 'tenant'].includes(formData.role) && formData.societyId && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Block</label>
                    <div className="relative">
                      <Home className="absolute left-3 top-3 text-slate-500" size={16} />
                      <select
                        name="block"
                        required
                        className="w-full glass-input pl-10 text-sm bg-slate-950"
                        value={formData.block}
                        onChange={handleBlockChange}
                      >
                        <option value="">-- Block --</option>
                        {blocks.map((bl) => (
                          <option key={bl} value={bl}>
                            {bl}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Flat Number</label>
                    <select
                      name="flatId"
                      required
                      disabled={loadingFlats || !formData.block}
                      className="w-full glass-input text-sm bg-slate-950 disabled:opacity-50"
                      value={formData.flatId}
                      onChange={handleInputChange}
                    >
                      <option value="">-- Flat --</option>
                      {flats.map((fl) => (
                        <option key={fl._id} value={fl._id}>
                          {fl.flatNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full glass-button-primary hover-scale py-3 text-sm mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-slate-100 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Submit Request'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
