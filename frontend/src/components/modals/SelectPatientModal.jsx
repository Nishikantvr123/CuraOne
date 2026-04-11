import React, { useState, useEffect } from 'react';
import { Search, User, Mail, Phone, Check } from 'lucide-react';
import patientService from '../../services/patientService';
import Modal, { ModalFooter } from '../ui/Modal';

const SelectPatientModal = ({ isOpen, onClose, onSelect }) => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      setSelected(null);
      setSearch('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!search) { setFiltered(users); return; }
    const s = search.toLowerCase();
    setFiltered(users.filter(u =>
      u.firstName?.toLowerCase().includes(s) ||
      u.lastName?.toLowerCase().includes(s) ||
      u.email?.toLowerCase().includes(s)
    ));
  }, [search, users]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await patientService.getRegisteredUsers();
      if (res.success) setUsers(res.data);
    } catch (err) {
      console.error('Failed to load registered users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!selected) return;
    onSelect(selected);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Registered Patient" size="md">
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* User List */}
      <div className="max-h-80 overflow-y-auto space-y-2 mb-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Loading registered users...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 font-medium">No registered patients found</p>
            <p className="text-sm text-gray-400 mt-1">
              All registered patients have already been added
            </p>
          </div>
        ) : (
          filtered.map(user => (
            <div
              key={user.id}
              onClick={() => setSelected(user)}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                selected?.id === user.id
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-medium text-sm flex-shrink-0">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {user.firstName} {user.lastName}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />{user.email}
                    </span>
                    {user.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />{user.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {selected?.id === user.id && (
                <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              )}
            </div>
          ))
        )}
      </div>

      <ModalFooter>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={!selected}
          className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {selected
            ? `Add ${selected.firstName} ${selected.lastName}`
            : 'Select a Patient'}
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default SelectPatientModal;