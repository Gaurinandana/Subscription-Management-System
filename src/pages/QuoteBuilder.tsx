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

    const expDate = new Date();
    expDate.setFullYear(expDate.getFullYear() + 1);

    const quoteExpDate = new Date();
    quoteExpDate.setDate(quoteExpDate.getDate() + validityDays);

    createSubscription({
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
    <div className="space-y-8 animate-in fade-in duration-300 text-[#17191c]">
      {/* Top Banner — Editorial Serif Display */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#ececec]">
        <div>
          <div className="text-[12px] font-normal uppercase tracking-wider text-[#979799] mb-2 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#17191c]" />
            <span>Scene 3 • Quotation & Offer Construction</span>
          </div>
          <h1 className="font-serif text-[40px] md:text-[44px] leading-[1.2] tracking-[-0.66px] text-[#17191c] font-normal">
            Quotation <span className="italic">& Offer Builder</span>
          </h1>
          <p className="text-sm text-[#777b86] mt-2 max-w-xl font-normal leading-relaxed">
            Start from a standard template or craft a bespoke proposal with product brand variants,
            automated tax calculations, and promotional discounts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Details & Lines (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Template & Customer Preset Box */}
          <div className="bg-[#ffffff] p-6 rounded-[24px] border border-[#ececec] shadow-[0_0_0_1px_rgba(4,23,43,0.05),0_20px_25px_-5px_rgba(0,0,0,0.06),0_8px_10px_-6px_rgba(0,0,0,0.04)] space-y-5">
            <h3 className="font-serif text-lg text-[#17191c] font-normal flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#17191c]" />
              <span>1. Choose Template & Client</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-normal text-[#777b86] mb-1.5">
                  Start from Quotation Template
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full text-xs rounded-full border border-[#ececec] px-4 py-2 bg-[#fafafb] text-[#17191c] focus:outline-none focus:border-[#17191c]"
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
                <label className="block text-xs font-normal text-[#777b86] mb-1.5">
                  Select Customer
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full text-xs rounded-full border border-[#ececec] px-4 py-2 bg-[#fafafb] text-[#17191c] focus:outline-none focus:border-[#17191c]"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company} ({c.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-normal text-[#777b86] mb-1.5">
                  Billing Plan Base
                </label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full text-xs rounded-full border border-[#ececec] px-4 py-2 bg-[#fafafb] text-[#17191c] focus:outline-none focus:border-[#17191c]"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.billingFrequency} - ${p.cost})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-normal text-[#777b86] mb-1.5">
                  Payment Terms
                </label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value as any)}
                  className="w-full text-xs rounded-full border border-[#ececec] px-4 py-2 bg-[#fafafb] text-[#17191c] focus:outline-none focus:border-[#17191c]"
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
          <div className="bg-[#ffffff] p-6 rounded-[24px] border border-[#ececec] shadow-[0_0_0_1px_rgba(4,23,43,0.05),0_20px_25px_-5px_rgba(0,0,0,0.06),0_8px_10px_-6px_rgba(0,0,0,0.04)] space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg text-[#17191c] font-normal flex items-center gap-2">
                <Building className="w-4 h-4 text-[#17191c]" />
                <span>2. Products, Variants & Seats</span>
              </h3>
              <button
                onClick={handleAddLine}
                className="px-4 py-1.5 border border-[#17191c] hover:bg-[#f2f2f3] text-[#17191c] text-xs font-normal rounded-full transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-[#17191c]" />
                <span>Add Product Line</span>
              </button>
            </div>

            <div className="space-y-3.5">
              {lines.map((line, idx) => {
                const currentProd = products.find((p) => p.id === line.productId);
                return (
                  <div
                    key={line.id}
                    className="p-4 rounded-[20px] border border-[#ececec] bg-[#fafafb] space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
                      {/* Product Selector */}
                      <div className="sm:col-span-5">
                        <label className="block text-[11px] font-normal text-[#979799] mb-1">
                          Product
                        </label>
                        <select
                          value={line.productId}
                          onChange={(e) => handleProductChange(idx, e.target.value)}
                          className="w-full text-xs rounded-full border border-[#ececec] px-3.5 py-1.5 bg-[#ffffff] text-[#17191c] focus:outline-none focus:border-[#17191c]"
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
                        <label className="block text-[11px] font-normal text-[#979799] mb-1">
                          Brand / Variant
                        </label>
                        <select
                          onChange={(e) => handleVariantChange(idx, e.target.value)}
                          className="w-full text-xs rounded-full border border-[#ececec] px-3.5 py-1.5 bg-[#ffffff] text-[#17191c] focus:outline-none focus:border-[#17191c]"
                        >
                          <option value="">Standard Edition (Base)</option>
                          {currentProd?.variants.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.brand} (+${v.extraPrice})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity */}
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-normal text-[#979799] mb-1">
                          Seats / Qty
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={line.quantity}
                          onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value) || 1)}
                          className="w-full text-xs rounded-full border border-[#ececec] px-3.5 py-1.5 bg-[#ffffff] text-[#17191c] focus:outline-none focus:border-[#17191c]"
                        />
                      </div>

                      {/* Remove Button */}
                      <div className="sm:col-span-1 flex justify-end pt-5">
                        <button
                          onClick={() => handleRemoveLine(line.id)}
                          className="text-[#777b86] hover:text-[#5d2a1a] p-1.5 rounded-full hover:bg-[#f2f2f3] transition"
                          title="Remove Line"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-[#ececec] text-[#777b86]">
                      <span>
                        Unit Price: <strong className="text-[#17191c] font-medium">${line.unitPrice.toLocaleString()}</strong> (incl. variant)
                      </span>
                      <span>
                        Line Total: <strong className="text-[#17191c] font-medium">${line.amount.toLocaleString()}</strong>
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
          <div className="bg-[#ffffff] p-6 rounded-[24px] border border-[#ececec] shadow-[0_0_0_1px_rgba(4,23,43,0.05),0_20px_25px_-5px_rgba(0,0,0,0.06),0_8px_10px_-6px_rgba(0,0,0,0.04)] space-y-5">
            <h3 className="font-serif text-lg text-[#17191c] font-normal flex items-center gap-2">
              <Percent className="w-4 h-4 text-[#17191c]" />
              <span>3. Discounts & Pricing</span>
            </h3>

            {/* Discount Code Input (Scene 5) */}
            <div>
              <label className="block text-xs font-normal text-[#777b86] mb-1.5">
                Promotional Discount Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. VOLUME20"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="w-full text-xs rounded-full border border-[#ececec] bg-[#fafafb] text-[#17191c] px-4 py-2 focus:outline-none focus:border-[#17191c] uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyDiscount}
                  className="px-4 py-2 bg-[#17191c] hover:bg-black text-[#ffffff] font-normal text-xs rounded-full transition shrink-0"
                >
                  Apply
                </button>
              </div>
              <p className="text-[11px] text-[#979799] mt-1.5">
                Preset codes: <strong>VOLUME20</strong> (&ge;5 seats) or <strong>ODOOFEST100</strong>
              </p>
            </div>

            {/* Financial Summary Breakdown */}
            <div className="p-5 bg-[#fafafb] rounded-[20px] border border-[#ececec] space-y-3 text-xs">
              <div className="flex justify-between text-[#777b86]">
                <span>Subtotal ({totalQuantity} items):</span>
                <span className="font-mono text-[#17191c] font-medium">${subtotal.toLocaleString()}</span>
              </div>

              {appliedDiscount && (
                <div className="flex justify-between text-[#5d2a1a] font-medium">
                  <span>Discount ({appliedDiscount.code}):</span>
                  <span className="font-mono">-${appliedDiscount.amount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-[#777b86]">
                <span>Estimated Tax (10% standard):</span>
                <span className="font-mono text-[#17191c] font-medium">${taxTotal.toLocaleString()}</span>
              </div>

              <div className="h-px bg-[#ececec]" />

              <div className="flex justify-between text-base font-normal text-[#17191c]">
                <span className="font-serif">Offer Total:</span>
                <span className="font-mono font-medium">${totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Validity settings */}
            <div className="p-4 bg-[#fbe1d1] rounded-[16px] text-xs text-[#5d2a1a] space-y-1">
              <div className="font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#5d2a1a]" />
                <span>Quotation Validity Period</span>
              </div>
              <div className="text-[11px] leading-relaxed">
                Proposal remains valid for <strong>{validityDays} days</strong> from issuance date.
              </div>
            </div>

            {/* Action buttons — Steep Pill Lozenges */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => handleSubmit('Quotation')}
                className="w-full py-2.5 px-5 bg-[#17191c] hover:bg-black text-[#ffffff] font-medium text-xs rounded-full transition flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Send as Official Quotation</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#fbe1d1]" />
              </button>

              <button
                type="button"
                onClick={() => handleSubmit('Draft')}
                className="w-full py-2.5 px-5 border border-[#17191c] hover:bg-[#f2f2f3] text-[#17191c] font-normal text-xs rounded-full transition text-center"
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
