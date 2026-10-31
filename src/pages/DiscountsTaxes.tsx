import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DiscountRule, DiscountScope, DiscountType, TaxRule } from '../types';
import {
  Percent,
  Plus,
  Tag,
  Calendar,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Sparkles,
  Layers,
  DollarSign,
  Receipt,
  X,
  Users,
} from 'lucide-react';

export const DiscountsTaxes: React.FC = () => {
  const { discounts, taxRules, addDiscountRule, addTaxRule, products, currentUser } = useApp();
  const isAdmin = currentUser.role === 'admin';

  const [activeTab, setActiveTab] = useState<'discounts' | 'taxes'>('discounts');
  const [isAddDiscountOpen, setIsAddDiscountOpen] = useState(false);
  const [isAddTaxOpen, setIsAddTaxOpen] = useState(false);

  // New Discount Form State (Scene 5)
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<DiscountType>('percentage');
  const [value, setValue] = useState<number>(20);
  const [minQuantity, setMinQuantity] = useState<number>(5);
  const [minPurchaseAmount, setMinPurchaseAmount] = useState<number>(1000);
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [usageLimit, setUsageLimit] = useState<number>(100);
  const [scope, setScope] = useState<DiscountScope>('whole_subscription');
  const [targetProductId, setTargetProductId] = useState<string>('');

  // New Tax Rule Form State (Scene 4)
  const [taxName, setTaxName] = useState('');
  const [taxRate, setTaxRate] = useState<number>(10);
  const [taxDesc, setTaxDesc] = useState('');
  const [isDefaultTax, setIsDefaultTax] = useState(false);

  const handleCreateDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    addDiscountRule({
      code: code.toUpperCase().trim(),
      name,
      type,
      value,
      minQuantity: minQuantity || undefined,
      minPurchaseAmount: minPurchaseAmount || undefined,
      startDate,
      endDate,
      usageLimit,
      scope,
      targetProductId: scope === 'specific_product' ? targetProductId : undefined,
      isActive: true,
    });

    setIsAddDiscountOpen(false);
    setCode('');
    setName('');
  };

  const handleCreateTax = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    addTaxRule({
      name: taxName,
      rate: taxRate,
      description: taxDesc,
      isDefault: isDefaultTax,
    });

    setIsAddTaxOpen(false);
    setTaxName('');
    setTaxDesc('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-slate-100">
      {/* Top Banner */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Scene 5: A Customer Asks for a Better Price</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Discount Engine & Automated Tax Rules
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Admin-controlled discount rules with seat volume thresholds, date limits, and automatic
            invoice application. Tax rates are automatically applied to all line items.
          </p>
        </div>

        {/* Action button (Admin only) */}
        {isAdmin ? (
          <div>
            {activeTab === 'discounts' ? (
              <button
                onClick={() => setIsAddDiscountOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm hover:shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Create Discount Rule</span>
              </button>
            ) : (
              <button
                onClick={() => setIsAddTaxOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm hover:shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Add Tax Rule</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-950/60 text-amber-300 border border-amber-800/60 rounded-xl text-xs font-semibold">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Only Admin can create discount & tax rules</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900 rounded-2xl p-2 gap-2 border shadow-xl">
        <button
          onClick={() => setActiveTab('discounts')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === 'discounts'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>Discount Rules ({discounts.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('taxes')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === 'taxes'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Tax Rates ({taxRules.length})</span>
        </button>
      </div>

      {/* Tab 1: Discount Rules Cards */}
      {activeTab === 'discounts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {discounts.map((rule) => {
            const isExhausted = rule.timesUsed >= rule.usageLimit;
            const targetProd = products.find((p) => p.id === rule.targetProductId);

            return (
              <div
                key={rule.id}
                className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl hover:border-purple-500/50 transition space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xl bg-purple-950/80 text-purple-300 border border-purple-800/60 font-mono font-bold text-xs">
                        {rule.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rule.isActive && !isExhausted
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                            : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                        }`}
                      >
                        {isExhausted ? 'Exhausted' : rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xl font-extrabold text-white font-mono">
                        {rule.type === 'percentage' ? `${rule.value}% OFF` : `-$${rule.value}`}
                      </span>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">
                        {rule.scope === 'whole_subscription' ? 'Whole Subscription' : 'Product Specific'}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-white text-sm mt-2">{rule.name}</h3>

                  {targetProd && (
                    <div className="text-xs text-purple-400 font-medium mt-1">
                      Applies exclusively to: <strong>{targetProd.name}</strong>
                    </div>
                  )}

                  {/* Conditions & Thresholds (Scene 5) */}
                  <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Min Requirement:</span>
                      <strong className="text-slate-200">
                        {rule.minQuantity ? `${rule.minQuantity} Seats/Items` : 'No minimum quantity'}
                      </strong>
                    </div>

                    <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Min Spend:</span>
                      <strong className="text-slate-200">
                        {rule.minPurchaseAmount ? `$${rule.minPurchaseAmount.toLocaleString()}` : 'None'}
                      </strong>
                    </div>
                  </div>

                  {/* Usage Counter Bar */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Usage Tracker:</span>
                      <strong className="text-slate-200">
                        {rule.timesUsed} / {rule.usageLimit} redemptions
                      </strong>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="bg-purple-600 h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (rule.timesUsed / rule.usageLimit) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Valid: {rule.startDate} &rarr; {rule.endDate}</span>
                  </span>
                  <span className="text-emerald-400 font-medium">Automatic on Next Invoice</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Tax Rates List */}
      {activeTab === 'taxes' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {taxRules.map((tax) => (
            <div
              key={tax.id}
              className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-white font-mono">{tax.rate}%</span>
                  {tax.isDefault && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                      Default Tax
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-white text-sm mt-2">{tax.name}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tax.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                Calculated automatically on invoice lines
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Discount Modal (Scene 5) */}
      {isAddDiscountOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-800 overflow-hidden text-slate-100">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h3 className="font-bold text-white text-sm">Create Discount Rule (Admin)</h3>
              <button
                onClick={() => setIsAddDiscountOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDiscount} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Promo Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BULK50"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-700 bg-slate-950 text-white px-3 py-2 uppercase font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Discount Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 50+ Seat Enterprise Deal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-700 bg-slate-950 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Discount Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as DiscountType)}
                    className="w-full text-xs rounded-xl border border-slate-700 bg-slate-950 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Dollar Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {type === 'percentage' ? 'Percentage (e.g. 20%)' : 'Fixed Amount (e.g. $100)'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={value}
                    onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs rounded-xl border border-slate-700 bg-slate-950 text-white px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Min Seats / Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(parseInt(e.target.value) || 0)}
                    className="w-full text-xs rounded-xl border border-slate-700 bg-slate-950 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Max Redemptions (Limit)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(parseInt(e.target.value) || 1)}
                    className="w-full text-xs rounded-xl border border-slate-700 bg-slate-950 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-700 bg-slate-950 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-700 bg-slate-950 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Scope (Scene 5)
                </label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value as DiscountScope)}
                  className="w-full text-xs rounded-xl border border-slate-700 bg-slate-950 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="whole_subscription">Whole Subscription Order</option>
                  <option value="specific_product">Specific Product Line Only</option>
                </select>
              </div>

              {scope === 'specific_product' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Select Target Product
                  </label>
                  <select
                    value={targetProductId}
                    onChange={(e) => setTargetProductId(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-700 bg-slate-950 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Choose Product...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddDiscountOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Tax Modal (Scene 4) */}
      {isAddTaxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-slate-800 overflow-hidden text-slate-100">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h3 className="font-bold text-white text-sm">Add Tax Rate Rule (Admin)</h3>
              <button
                onClick={() => setIsAddTaxOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTax} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tax Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EU Digital VAT (20%)"
                  value={taxName}
                  onChange={(e) => setTaxName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-700 bg-slate-950 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs rounded-xl border border-slate-700 bg-slate-950 text-white px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Applies to digital services and cloud hosting"
                  value={taxDesc}
                  onChange={(e) => setTaxDesc(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-700 bg-slate-950 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={isDefaultTax}
                  onChange={(e) => setIsDefaultTax(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500 bg-slate-950 border-slate-700"
                />
                <span>Set as default tax rule for new quotes</span>
              </label>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTaxOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Add Tax Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
