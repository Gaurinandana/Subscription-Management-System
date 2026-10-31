import React from 'react';
import { 
  BarChart3, Repeat, FileSpreadsheet, Receipt, 
  Package, Percent, Users, UserCheck, Sparkles, ShieldCheck 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Financial Overview', icon: BarChart3, roles: ['admin', 'staff'] },
    { id: 'subscriptions', label: 'Subscriptions', icon: Repeat, roles: ['admin', 'staff'] },
    { id: 'quotes', label: 'Quote Builder', icon: FileSpreadsheet, roles: ['admin', 'staff'] },
    { id: 'invoices', label: 'Billing & Invoices', icon: Receipt, roles: ['admin', 'staff'] },
    { id: 'products', label: 'Products & Plans', icon: Package, roles: ['admin', 'staff'] },
    { id: 'discounts', label: 'Discounts & Taxes', icon: Percent, roles: ['admin'] },
    { id: 'staff', label: 'Staff Directory', icon: Users, roles: ['admin'] },
    { id: 'portal', label: 'Customer Portal', icon: UserCheck, roles: ['admin', 'staff', 'customer'] },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(currentUser?.role || 'admin'));

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white flex flex-col justify-between p-4 select-none">
      <div className="space-y-5">
        <div className="px-3 pt-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Operations
          </p>
        </div>

        <nav className="space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 duration-150 ${
                    isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`} />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shadow-sm" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Clean User Status Card (No Scene jargon) */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Active Session</span>
          </span>
          <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
            {currentUser?.role || 'Admin'}
          </span>
        </div>
        <p className="text-xs text-slate-500 truncate">
          {currentUser?.email || 'admin@brightloop.io'}
        </p>
      </div>
    </aside>
  );
};