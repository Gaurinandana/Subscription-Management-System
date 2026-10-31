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
    <div className="space-y-8 animate-in fade-in duration-300 text-[#17191c]">
      {/* Top Banner — Editorial Serif Display */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#ececec]">
        <div>
          <div className="text-[12px] font-normal uppercase tracking-wider text-[#979799] mb-2 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#17191c]" />
            <span>Scene 1 • Team Directory & Role-Based Access Control</span>
          </div>
          <h1 className="font-serif text-[40px] md:text-[44px] leading-[1.2] tracking-[-0.66px] text-[#17191c] font-normal">
            Internal Staff <span className="italic">& Permissions</span>
          </h1>
          <p className="text-sm text-[#777b86] mt-2 max-w-xl font-normal leading-relaxed">
            Only the administrator can invite or add new staff members. Internal staff members
            handle operations with restricted administrative privileges.
          </p>
        </div>

        {/* Action Button (Admin only - Scene 1) */}
        {isAdmin ? (
          <button
            onClick={() => setIsAddStaffOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#17191c] hover:bg-black text-[#ffffff] rounded-full text-xs font-medium transition shadow-xs self-start md:self-auto"
          >
            <UserPlus className="w-4 h-4 text-[#fbe1d1]" />
            <span>Add Staff Member</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#fbe1d1] text-[#5d2a1a] rounded-full text-xs font-medium">
            <ShieldAlert className="w-4 h-4 text-[#5d2a1a] shrink-0" />
            <span>Only Admin can add new staff</span>
          </div>
        )}
      </div>

      {/* Access Guard for Non-Admin */}
      {!isAdmin && (
        <div className="bg-[#fbe1d1] rounded-[24px] p-6 text-[#5d2a1a] flex items-start gap-3.5">
          <ShieldAlert className="w-5 h-5 text-[#5d2a1a] shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <h4 className="font-serif text-lg font-normal">Restricted Directory View</h4>
            <p className="text-xs text-[#5d2a1a]/90 leading-relaxed">
              You are currently viewing as <strong>{currentUser.name}</strong> ({currentUser.role}).
              Per Scene 1 specifications, only the system administrator can add staff members or adjust system permissions.
            </p>
            <button
              onClick={() => switchRole('admin')}
              className="mt-2 text-xs font-medium text-[#5d2a1a] underline flex items-center gap-1"
            >
              <span>Switch to Elena Vance (Admin) to test adding staff &rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* Staff Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {staffMembers.map((member) => (
          <div
            key={member.id}
            className="bg-[#ffffff] p-6 rounded-[24px] border border-[#ececec] shadow-[0_0_0_1px_rgba(4,23,43,0.05),0_20px_25px_-5px_rgba(0,0,0,0.06),0_8px_10px_-6px_rgba(0,0,0,0.04)] transition space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatar || 'https://images.unsplash.com/photo-1535713875002?w=150'}
                    alt={member.name}
                    className="w-11 h-11 rounded-full object-cover ring-1 ring-[#ececec]"
                  />
                  <div>
                    <h3 className="font-serif text-base text-[#17191c] font-normal">{member.name}</h3>
                    <span className="text-[11px] text-[#777b86] block">{member.email}</span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-normal uppercase tracking-wider ${
                    member.role === 'admin'
                      ? 'bg-[#17191c] text-[#ffffff]'
                      : 'bg-[#f2f2f3] text-[#17191c]'
                  }`}
                >
                  {member.role}
                </span>
              </div>

              <div className="mt-4 pt-3.5 border-t border-[#f2f2f3] space-y-2 text-xs text-[#777b86]">
                <div className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-[#979799]" />
                  <span>{member.department || 'Operations Team'}</span>
                </div>
                <div className="flex items-center gap-2 text-[#17191c] font-normal">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#17191c]" />
                  <span>Full Internal Portal Access</span>
                </div>
              </div>
            </div>

            <div className="pt-3.5 border-t border-[#f2f2f3] flex items-center justify-between">
              {currentUser.id === member.id ? (
                <span className="text-[11px] font-medium text-[#17191c] bg-[#f2f2f3] px-3 py-1 rounded-full">
                  Current Session
                </span>
              ) : (
                <button
                  onClick={() => setCurrentUser(member)}
                  className="px-4 py-1.5 border border-[#17191c] hover:bg-[#f2f2f3] text-[#17191c] text-xs font-normal rounded-full transition flex items-center gap-1.5"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17191c]/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#ffffff] rounded-[24px] shadow-[0_0_0_1px_rgba(4,23,43,0.05),0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] max-w-md w-full border border-[#ececec] overflow-hidden text-[#17191c]">
            <div className="p-6 border-b border-[#ececec] flex items-center justify-between bg-[#fafafb]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#f2f2f3] rounded-full text-[#17191c]">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-[#17191c] font-normal">Add Staff Member</h3>
                  <p className="text-[11px] text-[#777b86]">Scene 1: Only Admin can grant internal access</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddStaffOpen(false)}
                className="p-2 text-[#777b86] hover:text-[#17191c] rounded-full hover:bg-[#f2f2f3]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaffSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-normal text-[#777b86] mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Miller"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] px-4 py-2 focus:outline-none focus:border-[#17191c]"
                />
              </div>

              <div>
                <label className="block text-xs font-normal text-[#777b86] mb-1.5">Staff Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="jordan@brightloop.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] px-4 py-2 focus:outline-none focus:border-[#17191c]"
                />
              </div>

              <div>
                <label className="block text-xs font-normal text-[#777b86] mb-1.5">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] px-3.5 py-2 focus:outline-none focus:border-[#17191c]"
                >
                  <option value="Sales & Customer Ops">Sales & Customer Ops</option>
                  <option value="Billing & Finance">Billing & Finance</option>
                  <option value="Customer Support SLA">Customer Support SLA</option>
                  <option value="Executive / IT Admin">Executive / IT Admin</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="px-4 py-2 text-xs font-normal text-[#777b86] hover:bg-[#f2f2f3] rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#17191c] hover:bg-black text-[#ffffff] font-medium text-xs rounded-full shadow-xs"
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
