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
    <div className="space-y-8 animate-in fade-in duration-300 text-[#17191c]">
      {/* Header — Editorial Serif Display */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#ececec]">
        <div>
          <div className="text-[12px] font-normal uppercase tracking-wider text-[#979799] mb-2 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#17191c]" />
            <span>Scene 2 • Product Catalog & Plan Lifecycle Configuration</span>
          </div>
          <h1 className="font-serif text-[40px] md:text-[44px] leading-[1.2] tracking-[-0.66px] text-[#17191c] font-normal">
            Products, Variants <span className="italic">& Plan Catalog</span>
          </h1>
          <p className="text-sm text-[#777b86] mt-2 max-w-xl font-normal leading-relaxed">
            Configure subscription offerings with brand variants (e.g. Odoo brand adds +$560),
            billing frequencies (daily, weekly, monthly, yearly), and lifecycle closure rules.
          </p>
        </div>

        {/* Action button (Admin only) */}
        {isAdmin ? (
          <div className="flex items-center gap-2 self-start md:self-auto">
            {activeTab === 'products' ? (
              <button
                onClick={() => setIsAddProductOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#17191c] hover:bg-black text-[#ffffff] rounded-full text-xs font-medium transition shadow-xs"
              >
                <Plus className="w-4 h-4 text-[#fbe1d1]" />
                <span>Launch New Product</span>
              </button>
            ) : (
              <button
                onClick={() => setIsAddPlanOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#17191c] hover:bg-black text-[#ffffff] rounded-full text-xs font-medium transition shadow-xs"
              >
                <Plus className="w-4 h-4 text-[#fbe1d1]" />
                <span>Configure New Plan</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#fbe1d1] text-[#5d2a1a] rounded-full text-xs font-medium">
            <ShieldAlert className="w-4 h-4 text-[#5d2a1a] shrink-0" />
            <span>Read-Only (Admin Access Required to Launch)</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-[#fafafb] rounded-full p-1.5 gap-2 border border-[#ececec] w-fit">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-5 py-2 text-xs rounded-full transition flex items-center justify-center gap-2 ${
            activeTab === 'products'
              ? 'bg-[#17191c] text-[#ffffff] font-medium'
              : 'text-[#777b86] hover:text-[#17191c] font-normal'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Products & Brand Variants ({products.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('plans')}
          className={`px-5 py-2 text-xs rounded-full transition flex items-center justify-center gap-2 ${
            activeTab === 'plans'
              ? 'bg-[#17191c] text-[#ffffff] font-medium'
              : 'text-[#777b86] hover:text-[#17191c] font-normal'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Subscription Plans & Rules ({plans.length})</span>
        </button>
      </div>

      {/* Tab 1: Products & Variants */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="bg-[#ffffff] p-6 rounded-[24px] border border-[#ececec] shadow-[0_0_0_1px_rgba(4,23,43,0.05),0_20px_25px_-5px_rgba(0,0,0,0.06),0_8px_10px_-6px_rgba(0,0,0,0.04)] transition space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-normal tracking-wider px-2.5 py-0.5 rounded-full bg-[#f2f2f3] text-[#777b86]">
                      {prod.type}
                    </span>
                    <h3 className="font-serif text-xl text-[#17191c] font-normal mt-2">{prod.name}</h3>
                  </div>
                  <div className="text-right">
                    <span className="font-serif text-2xl text-[#17191c] font-normal">
                      ${prod.salesPrice}
                    </span>
                    <span className="text-[10px] text-[#979799] block">Base Price</span>
                  </div>
                </div>

                <p className="text-xs text-[#777b86] mt-2 leading-relaxed">{prod.notes}</p>

                {/* Variants List (Scene 2) */}
                <div className="mt-4 pt-4 border-t border-[#f2f2f3] space-y-2">
                  <div className="text-[11px] font-normal text-[#979799] uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#17191c]" />
                    <span>Brand & Feature Variants:</span>
                  </div>
                  <div className="space-y-1.5">
                    {prod.variants.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between p-3 rounded-[14px] bg-[#fafafb] border border-[#ececec] text-xs"
                      >
                        <span className="font-medium text-[#17191c]">{v.brand}</span>
                        <span className="font-mono font-medium text-[#17191c]">
                          {v.extraPrice > 0 ? `+$${v.extraPrice}` : 'Included ($0)'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#f2f2f3] flex items-center justify-between text-[11px] text-[#777b86]">
                <span>Cost Price: ${prod.costPrice}</span>
                <span className="text-[#17191c] font-medium">
                  Margin: ${(prod.salesPrice - prod.costPrice)}/unit
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Subscription Plans & Lifecycle Rules */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-[#ffffff] p-6 rounded-[24px] border border-[#ececec] shadow-[0_0_0_1px_rgba(4,23,43,0.05),0_20px_25px_-5px_rgba(0,0,0,0.06),0_8px_10px_-6px_rgba(0,0,0,0.04)] transition space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-normal tracking-wider px-2.5 py-0.5 rounded-full bg-[#f2f2f3] text-[#777b86]">
                      {plan.billingFrequency} billing
                    </span>
                    <h3 className="font-serif text-xl text-[#17191c] font-normal mt-2">{plan.name}</h3>
                  </div>
                  <div className="text-right">
                    <span className="font-serif text-2xl text-[#17191c] font-normal">
                      ${plan.cost.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#979799] block">/{plan.billingFrequency}</span>
                  </div>
                </div>

                <p className="text-xs text-[#777b86] mt-2 leading-relaxed">
                  {plan.description || 'Configured recurring plan with rules enforced plan-by-plan.'}
                </p>

                {/* Plan Lifecycle Safeguards (Scene 2) */}
                <div className="mt-4 pt-4 border-t border-[#f2f2f3] space-y-2.5">
                  <div className="text-[11px] font-normal text-[#979799] uppercase tracking-wider">
                    Plan Lifecycle Rules:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 p-2.5 bg-[#fafafb] rounded-[14px] border border-[#ececec]">
                      {plan.autoCloseOnEnd ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#17191c] shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-[#a3a6af] shrink-0" />
                      )}
                      <span className="text-[#17191c] text-[11px]">Auto-Close on End</span>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 bg-[#fafafb] rounded-[14px] border border-[#ececec]">
                      {plan.canCloseEarly ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#17191c] shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-[#a3a6af] shrink-0" />
                      )}
                      <span className="text-[#17191c] text-[11px]">Can Close Early</span>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 bg-[#fafafb] rounded-[14px] border border-[#ececec]">
                      {plan.canPause ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#17191c] shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-[#a3a6af] shrink-0" />
                      )}
                      <span className="text-[#17191c] text-[11px]">Can Pause</span>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 bg-[#fafafb] rounded-[14px] border border-[#ececec]">
                      {plan.canRenew ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#17191c] shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-[#a3a6af] shrink-0" />
                      )}
                      <span className="text-[#17191c] text-[11px]">Can Renew</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#f2f2f3] flex items-center justify-between text-[11px] text-[#777b86]">
                <span>Min Qty: {plan.minQuantity} seat(s)</span>
                <span>Active: {plan.startDate} &rarr; {plan.endDate}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal (Admin only - Scene 2) */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17191c]/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#ffffff] rounded-[24px] shadow-[0_0_0_1px_rgba(4,23,43,0.05),0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] max-w-lg w-full border border-[#ececec] overflow-hidden text-[#17191c]">
            <div className="p-6 border-b border-[#ececec] flex items-center justify-between bg-[#fafafb]">
              <h3 className="font-serif text-lg text-[#17191c] font-normal">Launch New Product & Variants</h3>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="p-2 text-[#777b86] hover:text-[#17191c] rounded-full hover:bg-[#f2f2f3]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-normal text-[#777b86] mb-1.5">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brightloop Analytics Engine"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] px-4 py-2 focus:outline-none focus:border-[#17191c]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-normal text-[#777b86] mb-1.5">Type</label>
                  <select
                    value={productType}
                    onChange={(e) => setProductType(e.target.value as any)}
                    className="w-full text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] px-3.5 py-2 focus:outline-none focus:border-[#17191c]"
                  >
                    <option value="SaaS">SaaS</option>
                    <option value="Service">Service</option>
                    <option value="Add-on">Add-on</option>
                    <option value="Hardware">Hardware</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-normal text-[#777b86] mb-1.5">Sales Price ($)</label>
                  <input
                    type="number"
                    required
                    value={salesPrice}
                    onChange={(e) => setSalesPrice(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] px-3.5 py-2 focus:outline-none focus:border-[#17191c] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-normal text-[#777b86] mb-1.5">Cost Price ($)</label>
                  <input
                    type="number"
                    required
                    value={costPrice}
                    onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] px-3.5 py-2 focus:outline-none focus:border-[#17191c] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-normal text-[#777b86] mb-1.5">Internal Notes</label>
                <textarea
                  rows={2}
                  placeholder="Product specs, hosting requirements..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs rounded-[16px] border border-[#ececec] bg-[#fafafb] text-[#17191c] p-3.5 focus:outline-none focus:border-[#17191c]"
                />
              </div>

              {/* Variants Section (Scene 2) */}
              <div className="pt-3 border-t border-[#ececec] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#17191c]">Product Variants (e.g. Brand)</label>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="text-[#17191c] text-xs font-medium hover:underline"
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
                      className="flex-1 text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] px-4 py-1.5 focus:outline-none focus:border-[#17191c]"
                    />
                    <div className="w-28 relative">
                      <span className="absolute left-3 top-1.5 text-xs text-[#777b86]">+$</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={v.extraPrice}
                        onChange={(e) =>
                          handleUpdateVariant(idx, v.brand, parseFloat(e.target.value) || 0)
                        }
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] font-mono focus:outline-none focus:border-[#17191c]"
                      />
                    </div>
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(idx)}
                        className="text-[#777b86] hover:text-[#5d2a1a] p-1.5 rounded-full hover:bg-[#f2f2f3]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 text-xs font-normal text-[#777b86] hover:bg-[#f2f2f3] rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#17191c] hover:bg-black text-[#ffffff] font-medium text-xs rounded-full shadow-xs"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17191c]/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#ffffff] rounded-[24px] shadow-[0_0_0_1px_rgba(4,23,43,0.05),0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] max-w-lg w-full border border-[#ececec] overflow-hidden text-[#17191c]">
            <div className="p-6 border-b border-[#ececec] flex items-center justify-between bg-[#fafafb]">
              <h3 className="font-serif text-lg text-[#17191c] font-normal">Configure Subscription Plan</h3>
              <button
                onClick={() => setIsAddPlanOpen(false)}
                className="p-2 text-[#777b86] hover:text-[#17191c] rounded-full hover:bg-[#f2f2f3]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-normal text-[#777b86] mb-1.5">Plan Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brightloop Scale Pro"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] px-4 py-2 focus:outline-none focus:border-[#17191c]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-normal text-[#777b86] mb-1.5">Cost ($)</label>
                  <input
                    type="number"
                    required
                    value={planCost}
                    onChange={(e) => setPlanCost(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] px-3.5 py-2 font-mono focus:outline-none focus:border-[#17191c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-normal text-[#777b86] mb-1.5">Frequency</label>
                  <select
                    value={billingFrequency}
                    onChange={(e) => setBillingFrequency(e.target.value as BillingFrequency)}
                    className="w-full text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] px-3.5 py-2 focus:outline-none focus:border-[#17191c]"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-normal text-[#777b86] mb-1.5">Min Seats</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(parseInt(e.target.value) || 1)}
                    className="w-full text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] px-3.5 py-2 focus:outline-none focus:border-[#17191c]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-normal text-[#777b86] mb-1.5">Available From</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] px-4 py-2 focus:outline-none focus:border-[#17191c]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-normal text-[#777b86] mb-1.5">Available Until</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] px-4 py-2 focus:outline-none focus:border-[#17191c]"
                  />
                </div>
              </div>

              {/* Lifecycle flags (Scene 2) */}
              <div className="p-4 bg-[#fafafb] rounded-[16px] border border-[#ececec] space-y-2.5">
                <div className="text-xs font-medium text-[#17191c]">
                  Lifecycle Rules (Scene 2 Plan Decider)
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-[#777b86]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoCloseOnEnd}
                      onChange={(e) => setAutoCloseOnEnd(e.target.checked)}
                      className="rounded text-[#17191c] focus:ring-[#17191c] border-[#ececec]"
                    />
                    <span className="text-[#17191c]">Auto-close on end</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canCloseEarly}
                      onChange={(e) => setCanCloseEarly(e.target.checked)}
                      className="rounded text-[#17191c] focus:ring-[#17191c] border-[#ececec]"
                    />
                    <span className="text-[#17191c]">Allow early closure</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canPause}
                      onChange={(e) => setCanPause(e.target.checked)}
                      className="rounded text-[#17191c] focus:ring-[#17191c] border-[#ececec]"
                    />
                    <span className="text-[#17191c]">Allow pausing</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canRenew}
                      onChange={(e) => setCanRenew(e.target.checked)}
                      className="rounded text-[#17191c] focus:ring-[#17191c] border-[#ececec]"
                    />
                    <span className="text-[#17191c]">Allow renewals</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddPlanOpen(false)}
                  className="px-4 py-2 text-xs font-normal text-[#777b86] hover:bg-[#f2f2f3] rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#17191c] hover:bg-black text-[#ffffff] font-medium text-xs rounded-full shadow-xs"
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
