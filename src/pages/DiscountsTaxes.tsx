import React, { useState } from 'react';
import { 
  Percent, Receipt, Plus, Search, Tag, 
  ShieldCheck, CheckCircle2, X 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DiscountsTaxes: React.FC = () => {
  const { discounts, taxes, createDiscount, addToast } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'discounts' | 'taxes'>('discounts');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Discount Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [value, setValue] = useState(15);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');

  const filteredDiscounts = discounts.filter(d => 
    d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTaxes = taxes.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      addToast('Please enter both code and name.', 'error');
      return;
    }

    createDiscount({
      code: code.toUpperCase(),
      name,
      type: discountType,
      value: Number(value),
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2027-12-31',
      usageLimit: 100,
      scope: 'whole_subscription',
      isActive: true,
    });

    setCode('');
    setName('');
    setValue(15);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="revops-card rounded-2xl p-6 lg:p-7 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 bg-white border border-slate-200">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <Percent className="w-3.5 h-3.5 text-indigo-600" />
            <span>Pricing Rules</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Discounts & Taxes
          </h1>
          <p className="text-sm text-slate-500">
            Configure promotional coupon rules, automated sales taxes, and rate schedules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveSubTab('discounts')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'discounts'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Discount Rules ({discounts.length})
            </button>
            <button
              onClick={() => setActiveSubTab('taxes')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'taxes'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tax Rates ({taxes.length})
            </button>
          </div>

          {activeSubTab === 'discounts' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Rule</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Content Sections */}
      {activeSubTab === 'discounts' ? (
        <div className="revops-card rounded-2xl overflow-hidden bg-white border border-slate-200">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search promo codes or names..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-6">Promo Code</th>
                  <th className="py-3 px-6">Rule Name</th>
                  <th className="py-3 px-6">Benefit</th>
                  <th className="py-3 px-6">Scope</th>
                  <th className="py-3 px-6">Usage</th>
                  <th className="py-3 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredDiscounts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-xs text-slate-400">
                      No discount rules found.
                    </td>
                  </tr>
                ) : (
                  filteredDiscounts.map((disc) => (
                    <tr key={disc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-indigo-600 text-xs">
                        <span className="px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-100">
                          {disc.code}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-900 text-xs">
                        {disc.name}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs font-semibold text-emerald-700">
                        {disc.type === 'percentage' ? `${disc.value}% OFF` : `$${disc.value} FLAT`}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600 capitalize">
                        {disc.scope.replace('_', ' ')}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500 font-mono">
                        {disc.timesUsed} / {disc.usageLimit || '∞'} used
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          disc.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{disc.isActive ? 'Active' : 'Disabled'}</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="revops-card rounded-2xl overflow-hidden bg-white border border-slate-200">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900">Tax Schedule Rules</h2>
            <p className="text-xs text-slate-500">Jurisdiction rules automatically calculated during billing cycles</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-6">Tax Name</th>
                  <th className="py-3 px-6">Tax Rate</th>
                  <th className="py-3 px-6">Description</th>
                  <th className="py-3 px-6">Application</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredTaxes.map((tax) => (
                  <tr key={tax.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900 text-xs">
                      {tax.name}
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-indigo-600 text-xs">
                      {tax.rate.toFixed(1)}%
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      {tax.description || 'Standard applicable jurisdiction tax'}
                    </td>
                    <td className="py-4 px-6">
                      {tax.isDefault ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Default System Rate</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Optional</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. New Discount Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Discount Rule</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDiscount} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Coupon Code</label>
                <input
                  type="text"
                  placeholder="e.g. SUMMER25"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono uppercase focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rule Name</label>
                <input
                  type="text"
                  placeholder="e.g. Summer Promotional Discount"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Value</label>
                  <input
                    type="number"
                    min="1"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs cursor-pointer"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountsTaxes;