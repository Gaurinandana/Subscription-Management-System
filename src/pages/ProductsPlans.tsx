import React, { useState } from 'react';
import { 
  Package, Layers, Plus, Search, CheckCircle2, 
  X, Tag, ShieldCheck 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProductsPlans: React.FC = () => {
  const { products, plans, createProduct, createPlan, addToast } = useApp();

  const [activeTab, setActiveTab] = useState<'products' | 'plans'>('products');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  // New Product Form
  const [prodName, setProdName] = useState('');
  const [prodType, setProdType] = useState<'SaaS' | 'Software' | 'Service' | 'Add-on' | 'Hardware'>('SaaS');
  const [prodSalesPrice, setProdSalesPrice] = useState(500);
  const [prodCostPrice, setProdCostPrice] = useState(150);

  // New Plan Form
  const [planName, setPlanName] = useState('');
  const [planCost, setPlanCost] = useState(299);
  const [billingFreq, setBillingFreq] = useState<'monthly' | 'yearly'>('monthly');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.type || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPlans = plans.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.billingFrequency.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) return;

    createProduct({
      name: prodName,
      type: prodType,
      salesPrice: Number(prodSalesPrice),
      costPrice: Number(prodCostPrice),
      notes: '',
      variants: [{ id: `var-${Date.now()}`, brand: 'Enterprise Tier', extraPrice: 560 }],
    });

    setProdName('');
    setIsProductModalOpen(false);
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim()) return;

    createPlan({
      name: planName,
      cost: Number(planCost),
      billingFrequency: billingFreq,
      minQuantity: 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2027-12-31',
      autoCloseOnEnd: false,
      canCloseEarly: true,
      canPause: true,
      canRenew: true,
    });

    setPlanName('');
    setIsPlanModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="revops-card rounded-2xl p-6 lg:p-7 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 bg-white border border-slate-200">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <Package className="w-3.5 h-3.5 text-indigo-600" />
            <span>Product Catalog</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Products, Pricing & Plans
          </h1>
          <p className="text-sm text-slate-500">
            Configure standalone products, recurring subscription tiers, and edition variants.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'plans'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Subscription Plans ({plans.length})
            </button>
          </div>

          <button
            onClick={() => activeTab === 'products' ? setIsProductModalOpen(true) : setIsPlanModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New {activeTab === 'products' ? 'Product' : 'Plan'}</span>
          </button>
        </div>
      </div>

      {/* 2. Content */}
      {activeTab === 'products' ? (
        <div className="revops-card rounded-2xl overflow-hidden bg-white border border-slate-200">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by title or type..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-6">Product Name</th>
                  <th className="py-3 px-6">Type</th>
                  <th className="py-3 px-6">Variants Available</th>
                  <th className="py-3 px-6 text-right">Cost Price</th>
                  <th className="py-3 px-6 text-right">Sales Price</th>
                  <th className="py-3 px-6 text-right">Gross Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredProducts.map((p) => {
                  const margin = p.salesPrice - p.costPrice;
                  const marginPct = ((margin / p.salesPrice) * 100).toFixed(0);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-900 text-xs">
                        {p.name}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {p.type || 'SaaS'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600">
                        {p.variants && p.variants.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-medium">
                            <Tag className="w-3 h-3" />
                            <span>{p.variants[0].brand} (+${p.variants[0].extraPrice})</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-slate-500 text-xs">
                        ${p.costPrice.toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-bold text-slate-900 text-xs">
                        ${p.salesPrice.toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-emerald-600 font-bold text-xs">
                        ${margin.toFixed(2)} ({marginPct}%)
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="revops-card rounded-2xl overflow-hidden bg-white border border-slate-200">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subscription plans..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-6">Plan Name</th>
                  <th className="py-3 px-6">Frequency</th>
                  <th className="py-3 px-6">Recurring Cost</th>
                  <th className="py-3 px-6">Lifecycle Rules</th>
                  <th className="py-3 px-6 text-right">Min Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredPlans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900 text-xs">
                      {plan.name}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 capitalize">
                        {plan.billingFrequency}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-slate-900 text-xs">
                      ${plan.cost.toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${plan.canPause ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {plan.canPause ? '✓ Pauseable' : 'No Pause'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${plan.canCloseEarly ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {plan.canCloseEarly ? '✓ Cancel Anytime' : 'Lock-in'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-slate-700 text-xs">
                      {plan.minQuantity} seat(s)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Create Catalog Product</h3>
              <button onClick={() => setIsProductModalOpen(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name</label>
                <input
                  type="text"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. Analytics Platform Add-on"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cost Price ($)</label>
                  <input
                    type="number"
                    value={prodCostPrice}
                    onChange={(e) => setProdCostPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sales Price ($)</label>
                  <input
                    type="number"
                    value={prodSalesPrice}
                    onChange={(e) => setProdSalesPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Plan Modal */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Create Subscription Plan</h3>
              <button onClick={() => setIsPlanModalOpen(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreatePlan} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Plan Name</label>
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="e.g. Starter Team Tier"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Interval</label>
                  <select
                    value={billingFreq}
                    onChange={(e) => setBillingFreq(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Recurring Cost ($)</label>
                  <input
                    type="number"
                    value={planCost}
                    onChange={(e) => setPlanCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsPlanModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl">Save Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPlans;