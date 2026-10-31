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
    <div className="space-y-8 animate-in fade-in duration-300 text-[#17191c]">
      {/* Top Banner — Editorial Serif Display */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#ececec]">
        <div>
          <div className="text-[12px] font-normal uppercase tracking-wider text-[#979799] mb-2 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#17191c]" />
            <span>Scene 5 • Price Negotiation & Automated Tax Rules</span>
          </div>
          <h1 className="font-serif text-[40px] md:text-[44px] leading-[1.2] tracking-[-0.66px] text-[#17191c] font-normal">
            Discount Engine <span className="italic">& Tax Policy</span>
          </h1>
          <p className="text-sm text-[#777b86] mt-2 max-w-xl font-normal leading-relaxed">
            Admin-controlled discount rules with seat volume thresholds, redemption limits, and automatic
            invoice deduction. Default tax policies apply uniformly across line items.
          </p>
        </div>

        {/* Action button (Admin only) */}
        {isAdmin ? (
          <div className="self-start md:self-auto">
            {activeTab === 'discounts' ? (
              <button
                onClick={() => setIsAddDiscountOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#17191c] hover:bg-black text-[#ffffff] rounded-full text-xs font-medium transition shadow-xs"
              >
                <Plus className="w-4 h-4 text-[#fbe1d1]" />
                <span>Create Discount Rule</span>
              </button>
            ) : (
              <button
                onClick={() => setIsAddTaxOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#17191c] hover:bg-black text-[#ffffff] rounded-full text-xs font-medium transition shadow-xs"
              >
                <Plus className="w-4 h-4 text-[#fbe1d1]" />
                <span>Add Tax Rule</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#fbe1d1] text-[#5d2a1a] rounded-full text-xs font-medium">
            <ShieldAlert className="w-4 h-4 text-[#5d2a1a] shrink-0" />
            <span>Only Admin can configure promotional & tax rules</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-[#fafafb] rounded-full p-1.5 gap-2 border border-[#ececec] w-fit">
        <button
          onClick={() => setActiveTab('discounts')}
          className={`px-5 py-2 text-xs rounded-full transition flex items-center justify-center gap-2 ${
            activeTab === 'discounts'
              ? 'bg-[#17191c] text-[#ffffff] font-medium'
              : 'text-[#777b86] hover:text-[#17191c] font-normal'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>Discount Rules ({discounts.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('taxes')}
          className={`px-5 py-2 text-xs rounded-full transition flex items-center justify-center gap-2 ${
            activeTab === 'taxes'
              ? 'bg-[#17191c] text-[#ffffff] font-medium'
              : 'text-[#777b86] hover:text-[#17191c] font-normal'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Tax Rates ({taxRules.length})</span>
        </button>
      </div>

      {/* Tab 1: Discount Rules Cards */}
      {activeTab === 'discounts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {discounts.map((rule) => {
            const isExhausted = rule.timesUsed >= rule.usageLimit;
            const targetProd = products.find((p) => p.id === rule.targetProductId);

            return (
              <div
                key={rule.id}
                className="bg-[#ffffff] p-6 rounded-[24px] border border-[#ececec] shadow-[0_0_0_1px_rgba(4,23,43,0.05),0_20px_25px_-5px_rgba(0,0,0,0.06),0_8px_10px_-6px_rgba(0,0,0,0.04)] transition space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="px-3 py-1 rounded-full bg-[#f2f2f3] text-[#17191c] font-mono font-medium text-xs">
                        {rule.code}
                      </span>
                      <span
                        className={`text-[10px] font-normal px-2.5 py-0.5 rounded-full ${
                          rule.isActive && !isExhausted
                            ? 'bg-[#17191c] text-[#ffffff]'
                            : 'bg-[#fbe1d1] text-[#5d2a1a]'
                        }`}
                      >
                        {isExhausted ? 'Exhausted' : rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-serif text-2xl text-[#17191c] font-normal">
                        {rule.type === 'percentage' ? `${rule.value}% OFF` : `-$${rule.value}`}
                      </span>
                      <span className="text-[10px] text-[#979799] block uppercase">
                        {rule.scope === 'whole_subscription' ? 'Whole Subscription' : 'Product Specific'}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-medium text-[#17191c] text-sm mt-3">{rule.name}</h3>

                  {targetProd && (
                    <div className="text-xs text-[#777b86] mt-1">
                      Applies exclusively to: <strong className="text-[#17191c]">{targetProd.name}</strong>
                    </div>
                  )}

                  {/* Conditions & Thresholds (Scene 5) */}
                  <div className="mt-4 pt-4 border-t border-[#f2f2f3] grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 bg-[#fafafb] rounded-[14px] border border-[#ececec]">
                      <span className="text-[10px] text-[#979799] block">Min Volume:</span>
                      <strong className="text-[#17191c] font-medium">
                        {rule.minQuantity ? `${rule.minQuantity} Seats/Items` : 'No minimum quantity'}
                      </strong>
                    </div>

                    <div className="p-3 bg-[#fafafb] rounded-[14px] border border-[#ececec]">
                      <span className="text-[10px] text-[#979799] block">Min Spend:</span>
                      <strong className="text-[#17191c] font-medium">
                        {rule.minPurchaseAmount ? `$${rule.minPurchaseAmount.toLocaleString()}` : 'None'}
                      </strong>
                    </div>
                  </div>

                  {/* Usage Counter Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-[11px] text-[#777b86]">
                      <span>Usage Tracker:</span>
                      <strong className="text-[#17191c] font-medium">
                        {rule.timesUsed} / {rule.usageLimit} redemptions
                      </strong>
                    </div>
                    <div className="w-full bg-[#f2f2f3] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#17191c] h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (rule.timesUsed / rule.usageLimit) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#f2f2f3] flex items-center justify-between text-[11px] text-[#777b86]">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#979799]" />
                    <span>Valid: {rule.startDate} &rarr; {rule.endDate}</span>
                  </span>
                  <span className="text-[#17191c] font-medium">Auto on Next Invoice</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Tax Rates List */}
      {activeTab === 'taxes' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {taxRules.map((tax) => (
            <div
              key={tax.id}
              className="bg-[#ffffff] p-6 rounded-[24px] border border-[#ececec] shadow-[0_0_0_1px_rgba(4,23,43,0.05),0_20px_25px_-5px_rgba(0,0,0,0.06),0_8px_10px_-6px_rgba(0,0,0,0.04)] space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-serif text-3xl text-[#17191c] font-normal">{tax.rate}%</span>
                  {tax.isDefault && (
                    <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-[#f2f2f3] text-[#17191c] border border-[#ececec]">
                      Default Tax
                    </span>
                  )}
                </div>
                <h4 className="font-serif text-base text-[#17191c] font-normal mt-2.5">{tax.name}</h4>
                <p className="text-xs text-[#777b86] mt-1 leading-relaxed">{tax.description}</p>
              </div>

              <div className="pt-3 border-t border-[#f2f2f3] text-[11px] text-[#979799]">
                Calculated automatically on invoice lines
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Discount Modal (Scene 5) */}
      {isAddDiscountOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17191c]/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#ffffff] rounded-[24px] shadow-[0_0_0_1px_rgba(4,23,43,0.05),0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] max-w-lg w-full border border-[#ececec] overflow-hidden text-[#17191c]">
            <div className="p-6 border-b border-[#ececec] flex items-center justify-between bg-[#fafafb]">
              <h3 className="font-serif text-lg text-[#17191c] font-normal">Create Discount Rule (Admin)</h3>
              <button
                onClick={() => setIsAddDiscountOpen(false)}
                className="p-2 text-[#777b86] hover:text-[#17191c] rounded-full hover:bg-[#f2f2f3]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDiscount} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-normal text-[#777b86] mb-1.5">Promo Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BULK50"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] px-4 py-2 uppercase font-mono font-medium focus:outline-none focus:border-[#17191c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-normal text-[#777b86] mb-1.5">Discount Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 50+ Seat Enterprise Deal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] px-4 py-2 focus:outline-none focus:border-[#17191c]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-normal text-[#777b86] mb-1.5">Discount Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as DiscountType)}
                    className="w-full text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] px-3.5 py-2 focus:outline-none focus:border-[#17191c]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Dollar Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-normal text-[#777b86] mb-1.5">
                    {type === 'percentage' ? 'Percentage (e.g. 20%)' : 'Fixed Amount (e.g. $100)'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={value}
                    onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] px-4 py-2 font-mono focus:outline-none focus:border-[#17191c]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-normal text-[#777b86] mb-1.5">
                    Min Seats / Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(parseInt(e.target.value) || 0)}
                    className="w-full text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] px-4 py-2 focus:outline-none focus:border-[#17191c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-normal text-[#777b86] mb-1.5">
                    Max Redemptions (Limit)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(parseInt(e.target.value) || 1)}
                    className="w-full text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] px-4 py-2 focus:outline-none focus:border-[#17191c]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-normal text-[#777b86] mb-1.5">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] px-4 py-2 focus:outline-none focus:border-[#17191c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-normal text-[#777b86] mb-1.5">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] px-4 py-2 focus:outline-none focus:border-[#17191c]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-normal text-[#777b86] mb-1.5">
                  Scope (Scene 5)
                </label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value as DiscountScope)}
                  className="w-full text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] px-4 py-2 focus:outline-none focus:border-[#17191c]"
                >
                  <option value="whole_subscription">Whole Subscription Order</option>
                  <option value="specific_product">Specific Product Line Only</option>
                </select>
              </div>

              {scope === 'specific_product' && (
                <div>
                  <label className="block text-xs font-normal text-[#777b86] mb-1.5">
                    Select Target Product
                  </label>
                  <select
                    value={targetProductId}
                    onChange={(e) => setTargetProductId(e.target.value)}
                    className="w-full text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] px-4 py-2 focus:outline-none focus:border-[#17191c]"
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

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddDiscountOpen(false)}
                  className="px-4 py-2 text-xs font-normal text-[#777b86] hover:bg-[#f2f2f3] rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#17191c] hover:bg-black text-[#ffffff] font-medium text-xs rounded-full shadow-xs"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17191c]/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#ffffff] rounded-[24px] shadow-[0_0_0_1px_rgba(4,23,43,0.05),0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] max-w-md w-full border border-[#ececec] overflow-hidden text-[#17191c]">
            <div className="p-6 border-b border-[#ececec] flex items-center justify-between bg-[#fafafb]">
              <h3 className="font-serif text-lg text-[#17191c] font-normal">Add Tax Rate Rule (Admin)</h3>
              <button
                onClick={() => setIsAddTaxOpen(false)}
                className="p-2 text-[#777b86] hover:text-[#17191c] rounded-full hover:bg-[#f2f2f3]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTax} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-normal text-[#777b86] mb-1.5">Tax Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EU Digital VAT (20%)"
                  value={taxName}
                  onChange={(e) => setTaxName(e.target.value)}
                  className="w-full text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] px-4 py-2 focus:outline-none focus:border-[#17191c]"
                />
              </div>

              <div>
                <label className="block text-xs font-normal text-[#777b86] mb-1.5">Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] px-4 py-2 font-mono focus:outline-none focus:border-[#17191c]"
                />
              </div>

              <div>
                <label className="block text-xs font-normal text-[#777b86] mb-1.5">Description</label>
                <input
                  type="text"
                  placeholder="Applies to digital services and cloud hosting"
                  value={taxDesc}
                  onChange={(e) => setTaxDesc(e.target.value)}
                  className="w-full text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] px-4 py-2 focus:outline-none focus:border-[#17191c]"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#777b86]">
                <input
                  type="checkbox"
                  checked={isDefaultTax}
                  onChange={(e) => setIsDefaultTax(e.target.checked)}
                  className="rounded text-[#17191c] focus:ring-[#17191c] border-[#ececec]"
                />
                <span className="text-[#17191c]">Set as default tax rule for new quotes</span>
              </label>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddTaxOpen(false)}
                  className="px-4 py-2 text-xs font-normal text-[#777b86] hover:bg-[#f2f2f3] rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#17191c] hover:bg-black text-[#ffffff] font-medium text-xs rounded-full shadow-xs"
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
