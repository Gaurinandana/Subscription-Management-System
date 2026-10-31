import React, { useState } from 'react';
import { 
  FileSpreadsheet, Plus, Trash2, CheckCircle2, 
  ArrowRight, Tag 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
type PaymentTerms = 'Net 30' | 'Due on Receipt' | 'Net 15' | 'Net 60';

interface QuoteBuilderProps {
  onNavigate?: (tab: string) => void;
}

interface QuoteLine {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  variantPrice: number;
  variantName: string;
  taxRate: number;
  amount: number;
}

export const QuoteBuilder: React.FC<QuoteBuilderProps> = ({ onNavigate }) => {
  const { 
    products, 
    plans, 
    discounts, 
    taxes, 
    customers, 
    createSubscription, 
    addToast 
  } = useApp();

  const [customerId, setCustomerId] = useState(customers[0]?.id || 'cust-1');
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || 'plan-growth');
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>('Net 30');
  const [discountCode, setDiscountCode] = useState('');

  const [lines, setLines] = useState<QuoteLine[]>([
    {
      id: 'ql-1',
      productId: products[0]?.id || 'prod-1',
      productName: products[0]?.name || 'BrightERP Core',
      quantity: 1,
      unitPrice: products[0]?.salesPrice || 1200,
      variantPrice: 560,
      variantName: 'Odoo Edition',
      taxRate: 10,
      amount: (products[0]?.salesPrice || 1200) + 560,
    }
  ]);

  const selectedCustomer = customers.find(c => c.id === customerId) || {
    id: 'cust-1',
    name: 'Jane Doe',
    company: 'Acme Corp',
    email: 'billing@acme.com'
  };

  const selectedPlan = plans.find(p => p.id === selectedPlanId) || plans[0];

  const handleAddLine = () => {
    const prod = products[0] || { id: 'prod-1', name: 'Software License', salesPrice: 500 };
    const newLine: QuoteLine = {
      id: `ql-${Date.now()}`,
      productId: prod.id,
      productName: prod.name,
      quantity: 1,
      unitPrice: prod.salesPrice || 500,
      variantPrice: 0,
      variantName: 'Standard',
      taxRate: 10,
      amount: prod.salesPrice || 500,
    };
    setLines([...lines, newLine]);
  };

  const handleRemoveLine = (id: string) => {
    if (lines.length === 1) {
      addToast('A quote requires at least one product line.', 'error');
      return;
    }
    setLines(lines.filter(l => l.id !== id));
  };

  const handleProductChange = (lineId: string, prodId: string) => {
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;
    setLines(lines.map(l => {
      if (l.id === lineId) {
        const unit = prod.salesPrice || 500;
        const total = (unit + l.variantPrice) * l.quantity;
        return {
          ...l,
          productId: prod.id,
          productName: prod.name,
          unitPrice: unit,
          amount: total,
        };
      }
      return l;
    }));
  };

  const handleQuantityChange = (lineId: string, qty: number) => {
    const safeQty = Math.max(1, qty);
    setLines(lines.map(l => {
      if (l.id === lineId) {
        const total = (l.unitPrice + l.variantPrice) * safeQty;
        return { ...l, quantity: safeQty, amount: total };
      }
      return l;
    }));
  };

  const handleToggleVariant = (lineId: string, hasVariant: boolean) => {
    setLines(lines.map(l => {
      if (l.id === lineId) {
        const extra = hasVariant ? 560 : 0;
        const total = (l.unitPrice + extra) * l.quantity;
        return {
          ...l,
          variantPrice: extra,
          variantName: hasVariant ? 'Odoo Edition' : 'Standard',
          amount: total,
        };
      }
      return l;
    }));
  };

  const subtotal = lines.reduce((sum, l) => sum + l.amount, 0);

  const appliedDiscount = discounts.find(d => d.code.toUpperCase() === discountCode.trim().toUpperCase() && d.isActive);
  let discountAmount = 0;
  if (appliedDiscount) {
    discountAmount = appliedDiscount.type === 'percentage' 
      ? (subtotal * appliedDiscount.value) / 100 
      : appliedDiscount.value;
  }

  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const taxRate = taxes[0]?.rate || 10;
  const taxAmount = (taxableSubtotal * taxRate) / 100;
  const grandTotal = taxableSubtotal + taxAmount;

  const handleConvertToSubscription = () => {
    const today = new Date().toISOString().split('T')[0];
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);

    createSubscription({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.company || selectedCustomer.name,
      customerEmail: selectedCustomer.email,
      planId: selectedPlan?.id || 'plan-growth',
      planName: selectedPlan?.name || 'Growth Business Tier',
      startDate: today,
      expiryDate: expiry.toISOString().split('T')[0],
      paymentTerms,
      status: 'Active',
      subtotal,
      discountTotal: discountAmount,
      taxTotal: taxAmount,
      totalAmount: grandTotal,
      nextBillingDate: today,
      lines: lines.map(l => ({
        id: l.id,
        productId: l.productId,
        productName: l.productName,
        variantPrice: l.variantPrice,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        taxRate: l.taxRate,
        amount: l.amount,
      })),
    });

    addToast('Quote successfully converted to an Active Subscription!', 'success');
    if (onNavigate) {
      onNavigate('subscriptions');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="revops-card rounded-2xl p-6 lg:p-7 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 bg-white border border-slate-200">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
            <span>Sales Operations</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Quote Builder & Contract Generator
          </h1>
          <p className="text-sm text-slate-500">
            Assemble multi-line quotes, apply recurring plan terms, and convert directly to subscriptions.
          </p>
        </div>

        <button
          onClick={handleConvertToSubscription}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all cursor-pointer active:scale-95"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Convert to Subscription</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. Left 2 Columns: Quote Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <div className="revops-card rounded-2xl p-6 bg-white border border-slate-200 space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Contract Header
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Customer
                </label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company || c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Subscription Tier
                </label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (${p.cost}/{p.billingFrequency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Payment Terms
                </label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value as PaymentTerms)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="Due on Receipt">Due on Receipt</option>
                  <option value="Net 15">Net 15 Days</option>
                  <option value="Net 30">Net 30 Days</option>
                  <option value="Net 60">Net 60 Days</option>
                </select>
              </div>
            </div>
          </div>

          <div className="revops-card rounded-2xl overflow-hidden bg-white border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Quotation Line Items</h2>
                <p className="text-xs text-slate-500">Products, add-on variants, and seat allocations</p>
              </div>
              <button
                onClick={handleAddLine}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-5">Product</th>
                    <th className="py-3 px-5">Odoo Variant (+$560)</th>
                    <th className="py-3 px-4 w-20">Qty</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-5 text-right">Total</th>
                    <th className="py-3 px-3 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {lines.map((line) => (
                    <tr key={line.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-5">
                        <select
                          value={line.productId}
                          onChange={(e) => handleProductChange(line.id, e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3.5 px-5">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={line.variantPrice > 0}
                            onChange={(e) => handleToggleVariant(line.id, e.target.checked)}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                          />
                          <span className="text-slate-600 text-xs">
                            {line.variantPrice > 0 ? 'Enterprise Edition' : 'Standard'}
                          </span>
                        </label>
                      </td>

                      <td className="py-3.5 px-4">
                        <input
                          type="number"
                          min="1"
                          value={line.quantity}
                          onChange={(e) => handleQuantityChange(line.id, parseInt(e.target.value) || 1)}
                          className="w-16 px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-center font-mono font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                        />
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-slate-600 tabular-nums">
                        ${(line.unitPrice + line.variantPrice).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-900 tabular-nums">
                        ${line.amount.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => handleRemoveLine(line.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 3. Right Column: Pricing Breakdown & Settlement */}
        <div className="space-y-6">
          <div className="revops-card rounded-2xl p-6 bg-white border border-slate-200 space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Contract Summary
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-600" />
                <span>Apply Promo Code</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. BRIGHT20"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono uppercase text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (appliedDiscount) {
                      addToast(`Applied coupon ${appliedDiscount.code}: ${appliedDiscount.value}% off!`, 'success');
                    } else if (discountCode) {
                      addToast(`Invalid code "${discountCode}". Try BRIGHT20`, 'error');
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
              {appliedDiscount && (
                <p className="text-[11px] text-emerald-600 mt-1 font-medium">
                  ✓ Valid discount: {appliedDiscount.name} ({appliedDiscount.value}% off)
                </p>
              )}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-mono text-slate-900 font-medium tabular-nums">${subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount ({appliedDiscount?.code})</span>
                  <span className="font-mono font-medium tabular-nums">-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-500">
                <span>Sales Tax ({taxRate}%)</span>
                <span className="font-mono text-slate-900 font-medium tabular-nums">${taxAmount.toFixed(2)}</span>
              </div>

              <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-bold text-slate-900 block">Total Due</span>
                  <span className="text-[10px] text-slate-400">Billed {selectedPlan?.billingFrequency || 'monthly'}</span>
                </div>
                <span className="text-2xl font-bold font-mono text-indigo-600 tabular-nums">
                  ${grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleConvertToSubscription}
              className="w-full py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
            >
              <span>Convert to Subscription</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteBuilder;