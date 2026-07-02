import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { Check, ShieldAlert, Landmark, Home, PlusCircle, UserCheck, AlertCircle } from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('approvals');
  const [pendingUsers, setPendingUsers] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [loadingApprovals, setLoadingApprovals] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Society Form State
  const [societyForm, setSocietyForm] = useState({
    name: '',
    address: '',
    blocks: '',
    totalFlats: 0,
  });

  // Flat Form State
  const [flatForm, setFlatForm] = useState({
    flatNumber: '',
    block: '',
    sqft: '',
    societyId: '',
  });

  const fetchPendingUsers = async () => {
    setLoadingApprovals(true);
    try {
      const response = await API.get('/users?isApproved=false');
      setPendingUsers(response.data.data);
    } catch (err) {
      console.error('Failed to load pending users:', err);
    } finally {
      setLoadingApprovals(false);
    }
  };

  const fetchSocieties = async () => {
    try {
      const response = await API.get('/societies');
      setSocieties(response.data.data);
    } catch (err) {
      console.error('Failed to load societies:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'approvals') {
      fetchPendingUsers();
    } else if (activeTab === 'flats') {
      fetchSocieties();
    }
  }, [activeTab]);

  const handleApprove = async (userId) => {
    setError('');
    setSuccess('');
    try {
      const response = await API.put(`/users/${userId}/approve`);
      setSuccess(response.data.message);
      fetchPendingUsers();
    } catch (err) {
      console.error('Approve failed:', err);
      setError(err.response?.data?.message || 'Failed to approve user.');
    }
  };

  const handleSocietySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const formattedBlocks = societyForm.blocks
        .split(',')
        .map((b) => b.trim())
        .filter((b) => b !== '');
      
      const payload = {
        ...societyForm,
        blocks: formattedBlocks,
        totalFlats: Number(societyForm.totalFlats),
      };

      const response = await API.post('/societies', payload);
      setSuccess(response.data.message || 'Society created successfully.');
      setSocietyForm({ name: '', address: '', blocks: '', totalFlats: 0 });
    } catch (err) {
      console.error('Society create failed:', err);
      setError(err.response?.data?.message || 'Failed to create society.');
    }
  };

  const handleFlatSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const payload = {
        ...flatForm,
        sqft: Number(flatForm.sqft),
      };

      const response = await API.post('/flats', payload);
      setSuccess(response.data.message || 'Flat created successfully.');
      setFlatForm({ flatNumber: '', block: '', sqft: '', societyId: '' });
    } catch (err) {
      console.error('Flat create failed:', err);
      setError(err.response?.data?.message || 'Failed to create flat.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Administrative Controls</h2>
        <p className="text-slate-400">Manage pending user registrations, register housing blocks, and set up apartments.</p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-800 space-x-6 text-sm font-medium">
        <button
          onClick={() => { setActiveTab('approvals'); setError(''); setSuccess(''); }}
          className={`pb-3 border-b-2 transition-colors ${activeTab === 'approvals' ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          User Approvals
        </button>
        <button
          onClick={() => { setActiveTab('societies'); setError(''); setSuccess(''); }}
          className={`pb-3 border-b-2 transition-colors ${activeTab === 'societies' ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Add Society
        </button>
        <button
          onClick={() => { setActiveTab('flats'); setError(''); setSuccess(''); }}
          className={`pb-3 border-b-2 transition-colors ${activeTab === 'flats' ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Create Flats
        </button>
      </div>

      {/* Alert Notices */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          {success}
        </div>
      )}

      {/* Tabs views */}
      {activeTab === 'approvals' && (
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="text-brand-400" size={20} />
            <h3 className="text-lg font-bold">Pending Registrations</h3>
          </div>

          {loadingApprovals ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              No registration requests pending approval.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/60 text-slate-450 uppercase text-xs tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">User Details</th>
                    <th className="py-3.5 px-4 font-semibold">Requested Role</th>
                    <th className="py-3.5 px-4 font-semibold">Location</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {pendingUsers.map((pUser) => (
                    <tr key={pUser._id} className="hover:bg-slate-900/10">
                      <td className="py-4 px-4">
                        <p className="font-semibold text-slate-200">{pUser.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{pUser.email} | {pUser.phone}</p>
                      </td>
                      <td className="py-4 px-4 font-medium text-brand-400 capitalize">
                        {pUser.role.replace('_', ' ')}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-400">
                        {pUser.societyId?.name ? (
                          <div className="space-y-0.5">
                            <p className="font-semibold text-slate-300">{pUser.societyId.name}</p>
                            {pUser.flatId && (
                              <p>Block {pUser.flatId.block}, Flat #{pUser.flatId.flatNumber}</p>
                            )}
                          </div>
                        ) : (
                          <span className="italic text-slate-550">Super Admin / No Society</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleApprove(pUser._id)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1 shadow-md shadow-emerald-600/10 transition-colors"
                        >
                          <Check size={14} />
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'societies' && (
        <div className="glass-panel rounded-2xl p-6 max-w-xl">
          <div className="flex items-center gap-2 mb-6">
            <Landmark className="text-brand-400" size={20} />
            <h3 className="text-lg font-bold">Register Society Details</h3>
          </div>

          <form onSubmit={handleSocietySubmit} className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase text-slate-450">Society Name</label>
              <input
                type="text"
                required
                className="glass-input text-sm"
                placeholder="e.g. Green Meadows Enclave"
                value={societyForm.name}
                onChange={(e) => setSocietyForm({ ...societyForm, name: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase text-slate-450">Complete Address</label>
              <input
                type="text"
                required
                className="glass-input text-sm"
                placeholder="e.g. Sector 4, Whitefield, Bengaluru"
                value={societyForm.address}
                onChange={(e) => setSocietyForm({ ...societyForm, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase text-slate-450">Blocks (comma separated)</label>
                <input
                  type="text"
                  required
                  className="glass-input text-sm"
                  placeholder="e.g. A, B, C"
                  value={societyForm.blocks}
                  onChange={(e) => setSocietyForm({ ...societyForm, blocks: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase text-slate-450">Total Flats Limit</label>
                <input
                  type="number"
                  required
                  className="glass-input text-sm"
                  value={societyForm.totalFlats}
                  onChange={(e) => setSocietyForm({ ...societyForm, totalFlats: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="glass-button-primary hover-scale w-full py-2.5 text-sm flex items-center justify-center gap-2">
              <PlusCircle size={18} />
              Register Society
            </button>
          </form>
        </div>
      )}

      {activeTab === 'flats' && (
        <div className="glass-panel rounded-2xl p-6 max-w-xl">
          <div className="flex items-center gap-2 mb-6">
            <Home className="text-brand-400" size={20} />
            <h3 className="text-lg font-bold">Register Flat/Apartment</h3>
          </div>

          <form onSubmit={handleFlatSubmit} className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase text-slate-450">Select Society</label>
              <select
                required
                className="glass-input text-sm bg-slate-950"
                value={flatForm.societyId}
                onChange={(e) => setFlatForm({ ...flatForm, societyId: e.target.value })}
              >
                <option value="">-- Choose Society --</option>
                {societies.map((soc) => (
                  <option key={soc._id} value={soc._id}>
                    {soc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase text-slate-450">Block</label>
                <input
                  type="text"
                  required
                  className="glass-input text-sm"
                  placeholder="e.g. A"
                  value={flatForm.block}
                  onChange={(e) => setFlatForm({ ...flatForm, block: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase text-slate-450">Flat Number</label>
                <input
                  type="text"
                  required
                  className="glass-input text-sm"
                  placeholder="e.g. 101"
                  value={flatForm.flatNumber}
                  onChange={(e) => setFlatForm({ ...flatForm, flatNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase text-slate-450">Square Footage (Sqft)</label>
              <input
                type="number"
                required
                className="glass-input text-sm"
                placeholder="e.g. 1200"
                value={flatForm.sqft}
                onChange={(e) => setFlatForm({ ...flatForm, sqft: e.target.value })}
              />
            </div>

            <button type="submit" className="glass-button-primary hover-scale w-full py-2.5 text-sm flex items-center justify-center gap-2">
              <PlusCircle size={18} />
              Add Flat
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
