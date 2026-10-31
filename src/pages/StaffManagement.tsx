import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  UserPlus,
  Shield,
  Briefcase,
  Mail,
  Building,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  X,
  UserCheck,
} from 'lucide-react';

export const StaffManagement: React.FC = () => {
  const { users, addStaffMember, currentUser, switchRole, setCurrentUser } = useApp();
  const isAdmin = currentUser.role === 'admin';

  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Sales & Operations');

  const staffMembers = users.filter((u) => u.role === 'admin' || u.role === 'staff');

  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const success = addStaffMember(name, email, department);
    if (success) {
      setIsAddStaffOpen(false);
      setName('');
      setEmail('');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Scene 1: Internal Staff Management & Role-Based Access Control</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Internal Staff & Team Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Only the administrator can invite or add new staff members. Internal staff members
            handle day-to-day operations with restricted administrative privileges.
          </p>
        </div>

        {/* Action Button (Admin only - Scene 1) */}
        {isAdmin ? (
          <button
            onClick={() => setIsAddStaffOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm hover:shadow"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Only Admin can add new staff</span>
          </div>
        )}
      </div>

      {/* Access Guard for Non-Admin */}
      {!isAdmin && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 text-amber-900 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm">Restricted Directory View</h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              You are currently viewing as <strong>{currentUser.name}</strong> ({currentUser.role}).
              Per Scene 1 specifications, only the system administrator can add staff members or adjust system permissions.
            </p>
            <button
              onClick={() => switchRole('admin')}
              className="mt-2 text-xs font-bold text-purple-700 underline flex items-center gap-1"
            >
              <span>Switch to Elena Vance (Admin) to test adding staff &rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* Staff Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staffMembers.map((member) => (
          <div
            key={member.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-purple-200 transition space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatar || 'https://images.unsplash.com/photo-1535713875002?w=150'}
                    alt={member.name}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100"
                  />
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{member.name}</h3>
                    <span className="text-[11px] text-slate-400 block">{member.email}</span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    member.role === 'admin'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {member.role}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>{member.department || 'Operations Team'}</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Full Internal Portal Access</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              {currentUser.id === member.id ? (
                <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
                  Current Session
                </span>
              ) : (
                <button
                  onClick={() => setCurrentUser(member)}
                  className="px-3 py-1 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 text-slate-600 text-xs font-semibold rounded-lg border border-slate-200 transition flex items-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Impersonate / Test View</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Staff Modal (Admin only - Scene 1) */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Add New Staff Member</h3>
                  <p className="text-[11px] text-slate-500">Scene 1: Only Admin can grant internal access</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddStaffOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaffSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Miller"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Staff Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="jordan@brightloop.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Sales & Customer Ops">Sales & Customer Ops</option>
                  <option value="Billing & Finance">Billing & Finance</option>
                  <option value="Customer Support SLA">Customer Support SLA</option>
                  <option value="Executive / IT Admin">Executive / IT Admin</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Add Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
