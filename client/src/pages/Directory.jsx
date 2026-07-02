import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { Search, SlidersHorizontal, User as UserIcon, Phone, Mail, Car, Users as FamilyIcon, X } from 'lucide-react';

const Directory = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter States
  const [searchName, setSearchName] = useState('');
  const [searchBlock, setSearchBlock] = useState('');
  const [searchFlat, setSearchFlat] = useState('');

  // Selected User for Modal details
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchDirectory = async () => {
    setLoading(true);
    try {
      let url = '/users/directory';
      const params = [];
      if (searchName) params.push(`name=${searchName}`);
      if (searchBlock) params.push(`block=${searchBlock}`);
      if (searchFlat) params.push(`flatNumber=${searchFlat}`);
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const response = await API.get(url);
      setUsers(response.data.data);
    } catch (err) {
      console.error('Failed to load directory:', err);
      setError('Could not retrieve directory records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchDirectory();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchName, searchBlock, searchFlat]);

  const formatRole = (role) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Resident Directory</h2>
        <p className="text-slate-400">Search and contact verified residents in the society.</p>
      </div>

      {/* Filter Options */}
      <div className="glass-panel rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-500" size={18} />
          <input
            type="text"
            className="w-full glass-input pl-10 text-sm"
            placeholder="Search by name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </div>

        <div className="relative">
          <input
            type="text"
            className="w-full glass-input text-sm"
            placeholder="Filter by Block (e.g., A)"
            value={searchBlock}
            onChange={(e) => setSearchBlock(e.target.value)}
          />
        </div>

        <div className="relative">
          <input
            type="text"
            className="w-full glass-input text-sm"
            placeholder="Filter by Flat Number (e.g., 102)"
            value={searchFlat}
            onChange={(e) => setSearchFlat(e.target.value)}
          />
        </div>
      </div>

      {/* Error Box */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Results grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
          No residents match the specified search parameters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((resident) => (
            <div 
              key={resident._id} 
              className="glass-card rounded-2xl p-6 space-y-4 cursor-pointer hover:border-brand-500/40 hover:bg-slate-900/30 transition-all duration-300"
              onClick={() => setSelectedUser(resident)}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center font-bold">
                    {resident.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 truncate max-w-[150px]">{resident.name}</h3>
                    <span className="text-xs text-brand-400 font-semibold uppercase tracking-wide">
                      {formatRole(resident.role)}
                    </span>
                  </div>
                </div>

                {resident.flatId ? (
                  <span className="inline-flex px-2.5 py-1 bg-slate-800 border border-slate-700/60 text-slate-300 text-xs font-bold rounded-lg">
                    {resident.flatId.block} - {resident.flatId.flatNumber}
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 italic">No flat linked</span>
                )}
              </div>

              <div className="space-y-2 border-t border-slate-800/80 pt-4 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-500" />
                  <span>{resident.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-slate-500" />
                  <span className="truncate">{resident.email}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Profile details modal overlay */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-panel rounded-2xl p-6 relative flex flex-col gap-6 animate-scaleUp">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-600/10 text-brand-400 font-bold text-xl flex items-center justify-center">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-100">{selectedUser.name}</h3>
                  <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
                    {formatRole(selectedUser.role)}
                  </span>
                </div>
              </div>
              <button 
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100"
                onClick={() => setSelectedUser(null)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Profile body Info */}
            <div className="space-y-6 overflow-y-auto max-h-[70vh]">
              {/* Contact Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Contact Information</h4>
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 text-sm">
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500">Phone Number</span>
                    <p className="font-medium text-slate-300">{selectedUser.phone}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500">Email Address</span>
                    <p className="font-medium text-slate-300 truncate">{selectedUser.email}</p>
                  </div>
                  <div className="space-y-1 col-span-2 border-t border-slate-800/50 pt-2.5 mt-1">
                    <span className="text-xs text-slate-500">Linked Flat Location</span>
                    <p className="font-medium text-slate-300">
                      {selectedUser.flatId 
                        ? `Block ${selectedUser.flatId.block}, Flat #${selectedUser.flatId.flatNumber}` 
                        : 'No flat linked'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Family Members list */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FamilyIcon size={16} className="text-slate-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Family Members</h4>
                </div>
                {!selectedUser.familyMembers || selectedUser.familyMembers.length === 0 ? (
                  <p className="text-xs text-slate-500 italic px-1">No family members registered.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedUser.familyMembers.map((member, index) => (
                      <div key={index} className="flex justify-between items-center p-3 rounded-xl bg-slate-950/20 border border-slate-850 text-sm">
                        <div>
                          <p className="font-semibold text-slate-200">{member.name}</p>
                          <span className="text-xs text-slate-500">{member.relation}</span>
                        </div>
                        <span className="text-xs text-slate-400 font-medium">{member.phone}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Vehicles Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Car size={16} className="text-slate-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Registered Vehicles</h4>
                </div>
                {!selectedUser.vehicles || selectedUser.vehicles.length === 0 ? (
                  <p className="text-xs text-slate-500 italic px-1">No vehicles registered.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {selectedUser.vehicles.map((vehicle, index) => (
                      <div key={index} className="p-3 rounded-xl bg-slate-950/20 border border-slate-850 flex flex-col gap-1 text-sm">
                        <span className="text-xs font-semibold text-brand-400 capitalize">{vehicle.vehicleType}</span>
                        <p className="font-bold text-slate-200 tracking-wide uppercase">{vehicle.vehicleNumber}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Directory;
