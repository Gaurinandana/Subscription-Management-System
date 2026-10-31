import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SubscriptionLine } from '../types';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  CheckCircle2,
  Tag,
  Calendar,
  Building,
  CreditCard,
  Percent,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface QuoteBuilderProps {
  onNavigate: (view: string) => void;
}

export const QuoteBuilder: React.FC<QuoteBuilderProps> = ({ onNavigate }) => {
  const {
    templates,
    plans,
    products,
    customers,
    discounts,
    taxRules,
    createSubscription,
    addToast,
  } = useApp();

  const defaultTax = taxRules.find((t) => t.isDefault)?.rate || 10;

  // Selected template & customer
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || '');
  const [validityDays, setValidityDays] = useState<number>(30);
  const [paymentTerms, setPaymentTerms] = useState<'Due on Receipt' | 'Net 15' | 'Net 30' | 'Net 60'>('Net 30');
  const [discountCode, setDiscountCode] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; amount: number; name: string } | null>(null);

  // Line items state
  const [lines, setLines] = useState<SubscriptionLine[]>([
    {
      id: 'line-1',
      productId: products[0]?.id || 'prod-1',
      productName: products[0]?.name || 'Brightloop ERP Platform',
      variantName: products[0]?.variants[1]?.brand || 'Odoo Powered Edition (+560)',
      variantPrice: products[0]?.variants[1]?.extraPrice || 560,
      quantity: 1,
      unitPrice: (products[0]?.salesPrice || 450) + (products[0]?.variants[1]?.extraPrice || 560),
      taxRate: defaultTax,
      amount: (products[0]?.salesPrice || 450) + (products[0]?.variants[1]?.extraPrice || 560),
    },
  ]);

  // Load template preset
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (!templateId) return;

    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl) return;

    setSelectedPlanId(tpl.planId);
    setValidityDays(tpl.validityDays);

    const newLines: SubscriptionLine[] = tpl.defaultLines.map((def, idx) => {
      const prod = products.find((p) => p.id === def.productId) || products[0];
      const variant = prod.variants.find((v) => v.id === def.variantId);
      const varPrice = variant ? variant.extraPrice : 0;
      const unitPrice = prod.salesPrice + varPrice;

      return {
        id: `tpl-line-${Date.now()}-${idx}`,
        productId: prod.id,
        productName: prod.name,
        variantName: variant ? `${variant.brand} (+${variant.extraPrice})` : undefined,
        variantPrice: varPrice,
        quantity: def.quantity,
        unitPrice,
        taxRate: defaultTax,
        amount: unitPrice * def.quantity,
      };
    });

    setLines(newLines);
    addToast('info', 'Template Loaded', `Applied "${tpl.name}" with default product lines.`);
  };

  const handleAddLine = () => {
    const prod = products[0];
    const unitPrice = prod.salesPrice;
    const newLine: SubscriptionLine = {
      id: `line-${Date.now()}`,
      productId: prod.id,
      productName: prod.name,
      variantName: undefined,
      variantPrice: 0,
      quantity: 1,
      unitPrice,
      taxRate: defaultTax,
      amount: unitPrice,
    };
    setLines([...lines, newLine]);
  };

  const handleRemoveLine = (id: string) => {
    if (lines.length === 1) {
      addToast('error', 'Minimum Requirement', 'A subscription must have at least one line item.');
      return;
    }
    setLines(lines.filter((l) => l.id !== id));
  };

  const handleProductChange = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const newLines = [...lines];
    newLines[index] = {
      ...newLines[index],
      productId: prod.id,
      productName: prod.name,
      variantName: undefined,
      variantPrice: 0,
      unitPrice: prod.salesPrice,
      amount: prod.salesPrice * newLines[index].quantity,
    };
    setLines(newLines);
  };

  const handleVariantChange = (index: number, variantId: string) => {
    const currentLine = lines[index];
    const prod = products.find((p) => p.id === currentLine.productId);
    if (!prod) return;

    const variant = prod.variants.find((v) => v.id === variantId);
    const extraPrice = variant ? variant.extraPrice : 0;
    const unitPrice = prod.salesPrice + extraPrice;

    const newLines = [...lines];
    newLines[index] = {
      ...currentLine,
      variantName: variant ? `${variant.brand} (+${extraPrice})` : undefined,
      variantPrice: extraPrice,
      unitPrice,
      amount: unitPrice * currentLine.quantity,
    };
    setLines(newLines);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const validQty = Math.max(1, qty);
    const newLines = [...lines];
    newLines[index] = {
      ...newLines[index],
      quantity: validQty,
      amount: newLines[index].unitPrice * validQty,
    };
    setLines(newLines);
  };

  // Calculations
  const subtotal = lines.reduce((acc, l) => acc + l.amount, 0);
  const totalQuantity = lines.reduce((acc, l) => acc + l.quantity, 0);

  // Apply discount rule (Scene 5)
  const handleApplyDiscount = () => {
    const rule = discounts.find(
      (d) => d.code.toLowerCase() === discountCode.trim().toLowerCase() && d.isActive
    );

    if (!rule) {
      addToast('error', 'Invalid Code', 'Discount code is invalid, inactive, or expired.');
      return;
    }

    if (rule.minQuantity && totalQuantity < rule.minQuantity) {
      addToast(
        'error',
        'Quantity Requirement Not Met',
        `Discount "${rule.code}" requires minimum ${rule.minQuantity} items/seats (currently ${totalQuantity}).`
      );
      return;
    }

    if (rule.minPurchaseAmount && subtotal < rule.minPurchaseAmount) {
      addToast(
        'error',
        'Minimum Spend Not Met',
        `Discount requires minimum subtotal of $${rule.minPurchaseAmount} (currently $${subtotal}).`
      );
      return;
    }

    let calculatedDiscount = 0;
    if (rule.type === 'percentage') {
      calculatedDiscount = (subtotal * rule.value) / 100;
    } else {
      calculatedDiscount = Math.min(rule.value, subtotal);
    }

    setAppliedDiscount({
      code: rule.code,
      amount: calculatedDiscount,
      name: rule.name,
    });
    addToast('success', 'Discount Applied', `Applied discount: -${calculatedDiscount.toLocaleString()}`);
  };

  const discountAmount = appliedDiscount ? appliedDiscount.amount : 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxTotal = lines.reduce((acc, l) => acc + (l.amount * l.taxRate) / 100, 0);
  const totalAmount = taxableAmount + taxTotal;

  const handleSubmit = (initialStatus: 'Draft' | 'Quotation' | 'Confirmed') => {
    const cust = customers.find((c) => c.id === selectedCustomerId) || customers[0];
    const plan = plans.find((p) => p.id === selectedPlanId) || plans[0];

    // Expiry date calculation
    const expDate = new Date();
    expDate.setFullYear(expDate.getFullYear() + 1);

    const quoteExpDate = new Date();
    quoteExpDate.setDate(quoteExpDate.getDate() + validityDays);

    const created = createSubscription({
      customerId: cust.id,
      customerName: cust.name,
      customerEmail: cust.email,
      planId: plan.id,
      planName: plan.name,
      startDate: new Date().toISOString().split('T')[0],
      expiryDate: expDate.toISOString().split('T')[0],
      paymentTerms,
      status: initialStatus,
      lines,
      subtotal,
      taxTotal,
      discountTotal: discountAmount,
      totalAmount,
      appliedDiscountCode: appliedDiscount?.code,
      quotationValidityDays: validityDays,
      quotationExpiresAt: quoteExpDate.toISOString().split('T')[0],
      nextBillingDate: new Date().toISOString().split('T')[0],
      notes: `Generated from template "${selectedTemplateId ? 'Enterprise Preset' : 'Custom Offer'}" with ${validityDays} days validity.`,
    });

    onNavigate('subscriptions');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Scene 3: Sales Rep Offer & Quotation Templates</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Quotation & Offer Builder
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Start from a standard template or craft a custom proposal with variants, taxes, and discounts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Details & Lines (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Template & Customer Preset Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-purple-600" />
              <span>1. Choose Template & Client</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Start from Quotation Template
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Blank Offer (Custom)</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.validityDays} days validity)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Customer
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company} ({c.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Billing Plan Base
                </label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.billingFrequency} - ${p.cost})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Terms
                </label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value as any)}
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Due on Receipt">Due on Receipt</option>
                  <option value="Net 15">Net 15 Days</option>
                  <option value="Net 30">Net 30 Days</option>
                  <option value="Net 60">Net 60 Days</option>
                </select>
              </div>
            </div>
          </div>

          {/* Line Items Builder (Products & Variants) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-600" />
                <span>2. Products, Variants & Seats</span>
              </h3>
              <button
                onClick={handleAddLine}
                className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product Line</span>
              </button>
            </div>

            <div className="space-y-3">
              {lines.map((line, idx) => {
                const currentProd = products.find((p) => p.id === line.productId);
                return (
                  <div
                    key={line.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      {/* Product Selector */}
                      <div className="sm:col-span-5">
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Product
                        </label>
                        <select
                          value={line.productId}
                          onChange={(e) => handleProductChange(idx, e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-200 px-2.5 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (${p.salesPrice})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Variant Selector (Scene 2: Odoo brand adds 560) */}
                      <div className="sm:col-span-4">
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Brand / Variant
                        </label>
                        <select
                          onChange={(e) => handleVariantChange(idx, e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-200 px-2.5 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">No Variant (Standard Base)</option>
                          {currentProd?.variants.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.brand} (+${v.extraPrice})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity */}
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Seats / Qty
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={line.quantity}
                          onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value) || 1)}
                          className="w-full text-xs rounded-xl border border-slate-200 px-2.5 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      {/* Remove Button */}
                      <div className="sm:col-span-1 flex justify-end pt-5">
                        <button
                          onClick={() => handleRemoveLine(line.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition"
                          title="Remove Line"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200 text-slate-500">
                      <span>
                        Unit Price: <strong>${line.unitPrice.toLocaleString()}</strong> (incl. variant)
                      </span>
                      <span>
                        Line Total: <strong className="text-slate-900">${line.amount.toLocaleString()}</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Pricing Summary & Actions (1 col) */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Percent className="w-4 h-4 text-purple-600" />
              <span>3. Discounts & Pricing</span>
            </h3>

            {/* Discount Code Input (Scene 5) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Promotional Discount Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. VOLUME20"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyDiscount}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition shrink-0"
                >
                  Apply
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Tip: Try <strong>VOLUME20</strong> (&ge;5 seats) or <strong>ODOOFEST100</strong>
              </p>
            </div>

            {/* Financial Summary Breakdown */}
            <div className="p-4 bg-slate-50 rounded-xl space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({totalQuantity} items):</span>
                <span className="font-mono font-semibold">${subtotal.toLocaleString()}</span>
              </div>

              {appliedDiscount && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount ({appliedDiscount.code}):</span>
                  <span className="font-mono">-${appliedDiscount.amount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Estimated Tax (10% standard):</span>
                <span className="font-mono font-semibold">${taxTotal.toLocaleString()}</span>
              </div>

              <div className="h-px bg-slate-200" />

              <div className="flex justify-between text-base font-extrabold text-slate-900">
                <span>Offer Total:</span>
                <span className="font-mono text-purple-700">${totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Validity settings */}
            <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-xs space-y-1">
              <div className="font-bold text-purple-900 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-600" />
                <span>Quotation Validity Period</span>
              </div>
              <div className="text-[11px] text-purple-800">
                Offer remains valid for <strong>{validityDays} days</strong> from issuance.
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleSubmit('Quotation')}
                className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition shadow-sm hover:shadow flex items-center justify-center gap-1.5"
              >
                <span>Send as Official Quotation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleSubmit('Draft')}
                className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition text-center"
              >
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
