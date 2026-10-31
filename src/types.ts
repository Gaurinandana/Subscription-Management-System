export type UserRole = 'admin' | 'staff' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  customerId?: string; // If role === 'customer', links to their customer entity
  department?: string;
}

export type BillingFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface ProductVariant {
  id: string;
  brand: string;
  extraPrice: number;
}

export interface Product {
  id: string;
  name: string;
  type: 'Software' | 'Service' | 'SaaS' | 'Add-on' | 'Hardware';
  salesPrice: number;
  costPrice: number;
  notes: string;
  variants: ProductVariant[];
}

export interface Plan {
  id: string;
  name: string;
  cost: number;
  billingFrequency: BillingFrequency;
  minQuantity: number;
  startDate: string;
  endDate: string;
  // Lifecycle flags decided plan-by-plan (Scene 2):
  autoCloseOnEnd: boolean;
  canCloseEarly: boolean;
  canPause: boolean;
  canRenew: boolean;
  description?: string;
}

export interface QuotationTemplateLine {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface QuotationTemplate {
  id: string;
  name: string;
  planId: string;
  validityDays: number;
  defaultLines: QuotationTemplateLine[];
  description: string;
}

export type SubscriptionStatus = 'Draft' | 'Quotation' | 'Confirmed' | 'Active' | 'Paused' | 'Closed';

export interface SubscriptionLine {
  id: string;
  productId: string;
  productName: string;
  variantName?: string;
  variantPrice: number;
  quantity: number;
  unitPrice: number;
  taxRate: number; // e.g. 10 for 10%
  amount: number;
}

export interface Subscription {
  id: string;
  number: string; // e.g. "SUB-2026-001"
  customerId: string;
  customerName: string;
  customerEmail: string;
  planId: string;
  planName: string;
  startDate: string;
  expiryDate: string;
  paymentTerms: 'Due on Receipt' | 'Net 15' | 'Net 30' | 'Net 60';
  status: SubscriptionStatus;
  lines: SubscriptionLine[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  totalAmount: number;
  appliedDiscountCode?: string;
  lastBilledDate?: string;
  nextBillingDate: string;
  quotationValidityDays?: number;
  quotationExpiresAt?: string;
  createdAt: string;
  notes?: string;
}

export type InvoiceStatus = 'Draft' | 'Confirmed' | 'Paid' | 'Cancelled';

export interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
}

export interface Invoice {
  id: string;
  number: string; // e.g. "INV-2026-001"
  subscriptionId: string;
  subscriptionNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  billingDate: string;
  dueDate: string;
  status: InvoiceStatus;
  lines: InvoiceLine[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  discountNote?: string;
  total: number;
  amountPaid: number;
  paymentTerms: string;
  sentAt?: string;
  paidAt?: string;
  pdfPrinted?: boolean;
}

export type PaymentMethod = 'Credit Card' | 'Bank Transfer' | 'Stripe' | 'Cash' | 'Check';

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  note: string;
  transactionRef: string;
}

export type DiscountScope = 'whole_subscription' | 'specific_product';
export type DiscountType = 'fixed' | 'percentage';

export interface DiscountRule {
  id: string;
  code: string;
  name: string;
  type: DiscountType;
  value: number; // e.g. 20 for 20% or 50 for $50
  minQuantity?: number;
  minPurchaseAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  timesUsed: number;
  scope: DiscountScope;
  targetProductId?: string;
  isActive: boolean;
}

export interface TaxRule {
  id: string;
  name: string;
  rate: number; // e.g. 10 for 10%
  description: string;
  isDefault: boolean;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  joinedDate: string;
}
