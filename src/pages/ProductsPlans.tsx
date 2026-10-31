import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BillingFrequency, Product, ProductVariant } from '../types';
import {
  Package,
  Plus,
  Layers,
  Calendar,
  DollarSign,
  ShieldAlert,
  Sparkles,
  Tag,
  CheckCircle2,
  XCircle,
  X,
  FileText,
  Clock,
  Briefcase,
} from 'lucide-react';

export const ProductsPlans: React.FC = () => {
  const { products, plans, addProduct, addPlan, currentUser } = useApp();
  const isAdmin = currentUser.role === 'admin';

  const [activeTab, setActiveTab] = useState<'products' | 'plans'>('products');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);

  // New Product Form State (Scene 2)
  const [productName, setProductName] = useState('');
  const [productType, setProductType] = useState<Product['type']>('SaaS');
  const [salesPrice, setSalesPrice] = useState<number>(450);
  const [costPrice, setCostPrice] = useState<number>(120);
  const [notes, setNotes] = useState('');
  const [variants, setVariants] = useState<{ brand: string; extraPrice: number }[]>([
    { brand: 'Standard Edition', extraPrice: 0 },
    { brand: 'Odoo Powered Edition', extraPrice: 560 }, // Scene 2 exact requirement
  ]);

  // New Plan Form State (Scene 2)
  const [planName, setPlanName] = useState('');
  const [planCost, setPlanCost] = useState<number>(1010);
  const [billingFrequency, setBillingFrequency] = useState<BillingFrequency>('monthly');
  const [minQuantity, setMinQuantity] = useState<number>(1);
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [autoCloseOnEnd, setAutoCloseOnEnd] = useState(false);
  const [canCloseEarly, setCanCloseEarly] = useState(true);
  const [canPause, setCanPause] = useState(true);
  const [canRenew, setCanRenew] = useState(true);
  const [planDescription, setPlanDescription] = useState('');

  const handleAddVariant = () => {
    setVariants([...variants, { brand: '', extraPrice: 0 }]);
  };

  const handleUpdateVariant = (index: number, brand: string, extraPrice: number) => {
    const updated = [...variants];
    updated[index] = { brand, extraPrice };
    setVariants(updated);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, idx) => idx !== index));
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const formattedVariants: ProductVariant[] = variants.map((v, i) => ({
      id: `var-${Date.now()}-${i}`,
      brand: v.brand || 'Variant',
      extraPrice: v.extraPrice || 0,
    }));

    addProduct({
      name: productName,
      type: productType,
      salesPrice,
      costPrice,
      notes,
      variants: formattedVariants,
    });

    setIsAddProductOpen(false);
    setProductName('');
    setNotes('');
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    addPlan({
      name: planName,
      cost: planCost,
      billingFrequency,
      minQuantity,
      startDate,
      endDate,
      autoCloseOnEnd,
      canCloseEarly,
      canPause,
      canRenew,
      description: planDescription,
    });

    setIsAddPlanOpen(false);
    setPlanName('');
    setPlanDescription('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Scene 2: Launching a New Plan & Products</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Products, Variants & Plans Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Configure subscription offerings with brand variants (e.g. Odoo brand adds +$560),
            billing frequencies (daily, weekly, monthly, yearly), and lifecycle closure rules.
          </p>
        </div>

        {/* Action button (Admin only) */}
        {isAdmin ? (
          <div className="flex items-center gap-2">
            {activeTab === 'products' ? (
              <button
                onClick={() => setIsAddProductOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm hover:shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Launch New Product</span>
              </button>
            ) : (
              <button
                onClick={() => setIsAddPlanOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm hover:shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Configure New Plan</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Read-Only (Admin Access Required to Launch)</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-2 gap-2 border shadow-2xs">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === 'products'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Products & Brand Variants ({products.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('plans')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === 'plans'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Subscription Plans & Rules ({plans.length})</span>
        </button>
      </div>

      {/* Tab 1: Products & Variants */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-purple-200 transition space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                      {prod.type}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-base mt-1.5">{prod.name}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-slate-900 font-mono">
                      ${prod.salesPrice}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Base Price</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{prod.notes}</p>

                {/* Variants List (Scene 2) */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-purple-600" />
                    <span>Brand & Feature Variants:</span>
                  </div>
                  <div className="space-y-1">
                    {prod.variants.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                      >
                        <span className="font-medium text-slate-800">{v.brand}</span>
                        <span className="font-mono font-bold text-purple-700">
                          {v.extraPrice > 0 ? `+$${v.extraPrice}` : 'Included ($0)'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Cost Price: ${prod.costPrice}</span>
                <span className="text-emerald-600 font-semibold">
                  Margin: ${(prod.salesPrice - prod.costPrice)}/unit
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Subscription Plans & Lifecycle Rules */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-purple-200 transition space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      {plan.billingFrequency} billing
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-base mt-1.5">{plan.name}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-slate-900 font-mono">
                      ${plan.cost.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block">/{plan.billingFrequency}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {plan.description || 'Configured recurring plan with rules enforced plan-by-plan.'}
                </p>

                {/* Plan Lifecycle Safeguards (Scene 2) */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <div className="text-[11px] font-bold text-slate-600">
                    Plan Lifecycle Rules (Admin Configured):
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-xl">
                      {plan.autoCloseOnEnd ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span className="text-slate-700 text-[11px]">Auto-Close on End</span>
                    </div>

                    <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-xl">
                      {plan.canCloseEarly ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span className="text-slate-700 text-[11px]">Can Close Early</span>
                    </div>

                    <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-xl">
                      {plan.canPause ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span className="text-slate-700 text-[11px]">Can Pause</span>
                    </div>

                    <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-xl">
                      {plan.canRenew ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span className="text-slate-700 text-[11px]">Can Renew</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Min Qty: {plan.minQuantity} seat(s)</span>
                <span>Active: {plan.startDate} &rarr; {plan.endDate}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal (Admin only - Scene 2) */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">Launch New Product & Variants</h3>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brightloop Analytics Engine"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={productType}
                    onChange={(e) => setProductType(e.target.value as any)}
                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="SaaS">SaaS</option>
                    <option value="Service">Service</option>
                    <option value="Add-on">Add-on</option>
                    <option value="Hardware">Hardware</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sales Price ($)</label>
                  <input
                    type="number"
                    required
                    value={salesPrice}
                    onChange={(e) => setSalesPrice(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cost Price ($)</label>
                  <input
                    type="number"
                    required
                    value={costPrice}
                    onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  placeholder="Product specs, hosting requirements..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Variants Section (Scene 2) */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Product Variants (e.g. Brand)</label>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="text-purple-600 text-xs font-semibold hover:underline"
                  >
                    + Add Variant
                  </button>
                </div>

                {variants.map((v, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Variant name (e.g. Odoo Brand)"
                      value={v.brand}
                      onChange={(e) => handleUpdateVariant(idx, e.target.value, v.extraPrice)}
                      className="flex-1 text-xs rounded-xl border border-slate-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="w-28 relative">
                      <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">+$</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={v.extraPrice}
                        onChange={(e) =>
                          handleUpdateVariant(idx, v.brand, parseFloat(e.target.value) || 0)
                        }
                        className="w-full pl-7 pr-2 py-1.5 text-xs rounded-xl border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Launch Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Plan Modal (Admin only - Scene 2) */}
      {isAddPlanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">Configure Subscription Plan</h3>
              <button
                onClick={() => setIsAddPlanOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brightloop Scale Pro"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cost ($)</label>
                  <input
                    type="number"
                    required
                    value={planCost}
                    onChange={(e) => setPlanCost(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Frequency</label>
                  <select
                    value={billingFrequency}
                    onChange={(e) => setBillingFrequency(e.target.value as BillingFrequency)}
                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min Seats</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(parseInt(e.target.value) || 1)}
                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Available From</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Available Until</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Lifecycle flags (Scene 2) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="text-xs font-bold text-slate-700">
                  Lifecycle Rules (Scene 2 Plan Decider)
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoCloseOnEnd}
                      onChange={(e) => setAutoCloseOnEnd(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span>Auto-close on end</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canCloseEarly}
                      onChange={(e) => setCanCloseEarly(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span>Allow early closure</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canPause}
                      onChange={(e) => setCanPause(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span>Allow pausing</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canRenew}
                      onChange={(e) => setCanRenew(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span>Allow renewals</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPlanOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
