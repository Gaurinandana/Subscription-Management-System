import React, { useState } from 'react';
import { 
  Users, UserPlus, Search, ShieldCheck, 
  Mail, Briefcase, CheckCircle2 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const StaffManagement: React.FC = () => {
  const { users, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter((u) => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.department || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="revops-card rounded-2xl p-6 lg:p-7 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 bg-white border border-slate-200">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Team Access</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Staff Directory & Role Permissions
          </h1>
          <p className="text-sm text-slate-500">
            Manage administrative operators, sales staff roles, and access boundaries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 font-medium">
            Active User: <strong className="text-indigo-600">{currentUser?.name}</strong> ({currentUser?.role})
          </span>
        </div>
      </div>

      {/* 2. Staff Cards & Search */}
      <div className="revops-card rounded-2xl overflow-hidden bg-white border border-slate-200">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team members by name or department..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-6">Member</th>
                <th className="py-3 px-6">Email Address</th>
                <th className="py-3 px-6">Department</th>
                <th className="py-3 px-6">Access Role</th>
                <th className="py-3 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-xs">{user.name}</div>
                        {user.id === currentUser?.id && (
                          <span className="text-[10px] text-indigo-600 font-medium">Current Session</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-mono text-xs text-slate-600">
                    {user.email}
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-700">
                    {user.department || 'Operations'}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border uppercase tracking-wider ${
                      user.role === 'admin'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      <ShieldCheck className="w-3 h-3" />
                      <span>{user.role}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Active</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffManagement;