"use client";

import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Calendar, 
  Download, 
  ExternalLink,
  History,
  FileText,
  X, 
  Save, 
  Loader2,
  Building2,
  Mail,
  User as UserIcon,
  Phone,
  MapPin,
  Globe,
  Hash,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UsageMeter } from '@/components/billing/UsageMeter';
import { PlanCard } from '@/components/billing/PlanCard';
import { format } from 'date-fns';
import toast from "react-hot-toast";

// Inlined BillingDrawer for better control and scrollability fix
function BillingDrawer({ isOpen, onClose, userData, onSave }: any) {
  const [formData, setFormData] = useState({
    billingName: "",
    billingEmail: "",
    billingCompany: "",
    billingPhone: "",
    billingAddressLine1: "",
    billingAddressLine2: "",
    billingCity: "",
    billingState: "",
    billingZip: "",
    billingCountry: "",
    billingTaxId: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userData) {
      setFormData({
        billingName: userData.billingName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
        billingEmail: userData.billingEmail || userData.email || "",
        billingCompany: userData.billingCompany || "",
        billingPhone: userData.billingPhone || userData.phoneNumber || "",
        billingAddressLine1: userData.billingAddressLine1 || "",
        billingAddressLine2: userData.billingAddressLine2 || "",
        billingCity: userData.billingCity || userData.city || "",
        billingState: userData.billingState || "",
        billingZip: userData.billingZip || "",
        billingCountry: userData.billingCountry || userData.country || "",
        billingTaxId: userData.billingTaxId || "",
      });
    }
  }, [userData, isOpen]);

  const countries = [
    "United States", "United Kingdom", "Canada", "Australia", 
    "Germany", "France", "India", "Singapore", "Japan", "Other"
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/billing/details", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Billing details updated successfully!");
        onSave(formData);
        onClose();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to save billing details.");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop with Reduced Blur */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-[4px] z-[100] transition-opacity duration-500",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer Container - Sharp Appearance (No Blur) */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-screen w-full max-w-md bg-white dark:bg-[#0f172a] shadow-2xl z-[101] flex flex-col transition-transform duration-700 ease-in-out card !rounded-none !border-y-0 !border-r-0",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-8 border-b border-surface2 bg-surface/50">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
              <CreditCard className="w-6 h-6" />
            </div>
            <button 
              onClick={onClose}
              className="p-3 text-muted hover:text-text hover:bg-surface2 rounded-xl transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <h2 className="text-2xl font-black text-text tracking-tight uppercase">Billing Settings</h2>
          <p className="text-[10px] font-black text-muted uppercase tracking-widest mt-1 opacity-70">Details and payment methods</p>
        </div>

        {/* Scrollable Middle Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-8 pb-10">
          <form id="billing-form" onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Billing Identity */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5" /> Billing Identity
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest px-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/50" />
                    <input
                      type="text"
                      name="billingName"
                      value={formData.billingName}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-surface2/30 border border-surface2 focus:border-accent text-text rounded-2xl pl-12 pr-4 py-3 text-sm transition-all outline-none font-bold"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 opacity-70">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest px-1">Email (Read Only)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/50" />
                    <input
                      type="email"
                      value={formData.billingEmail}
                      readOnly
                      className="w-full bg-surface2/50 border border-surface2 text-muted rounded-2xl pl-12 pr-4 py-3 text-sm cursor-not-allowed outline-none email-display font-bold"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest px-1">Company</label>
                    <input
                      type="text"
                      name="billingCompany"
                      value={formData.billingCompany}
                      onChange={handleInputChange}
                      className="w-full bg-surface2/30 border border-surface2 focus:border-accent text-text rounded-2xl px-4 py-3 text-sm transition-all outline-none font-bold"
                      placeholder="Acme Inc."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest px-1">Tax ID / VAT</label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/50" />
                      <input
                        type="text"
                        name="billingTaxId"
                        value={formData.billingTaxId}
                        onChange={handleInputChange}
                        className="w-full bg-surface2/30 border border-surface2 focus:border-accent text-text rounded-2xl pl-12 pr-4 py-3 text-sm transition-all outline-none font-bold"
                        placeholder="VAT-12345"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest px-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/50" />
                    <input
                      type="tel"
                      name="billingPhone"
                      value={formData.billingPhone}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-surface2/30 border border-surface2 focus:border-accent text-text rounded-2xl pl-12 pr-4 py-3 text-sm transition-all outline-none font-bold"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Address */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Billing Address
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest px-1">Address Line 1</label>
                  <input
                    type="text"
                    name="billingAddressLine1"
                    value={formData.billingAddressLine1}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-surface2/30 border border-surface2 focus:border-accent text-text rounded-2xl px-4 py-3 text-sm transition-all outline-none font-bold"
                    placeholder="123 Main St"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest px-1">City</label>
                    <input
                      type="text"
                      name="billingCity"
                      value={formData.billingCity}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-surface2/30 border border-surface2 focus:border-accent text-text rounded-2xl px-4 py-3 text-sm transition-all outline-none font-bold"
                      placeholder="San Francisco"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest px-1">Country</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/50" />
                      <select
                        name="billingCountry"
                        value={formData.billingCountry}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-surface2/30 border border-surface2 focus:border-accent text-text rounded-2xl pl-12 pr-4 py-3 text-sm appearance-none outline-none transition-all font-bold cursor-pointer"
                      >
                        <option value="">Select Country</option>
                        {countries.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Payment Method */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5" /> Payment Method
              </h3>
              
              <div className="bg-gradient-to-br from-surface to-surface2 border-2 border-dashed border-accent/20 rounded-3xl p-6 relative overflow-hidden group">
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center p-2">
                      <CreditCard className="w-full h-full text-[#1a1f71]" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-text uppercase tracking-widest italic">Visa Platinum</p>
                      <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-0.5">**** **** **** 4242</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-success bg-success/10 px-2 py-1 rounded-full uppercase tracking-widest">Active</span>
                </div>
                
                <button 
                  type="button" 
                  className="w-full mt-6 py-3 border-2 border-accent/20 hover:border-accent/40 text-accent text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all"
                >
                  Update Payment Method
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Fixed Footer Actions */}
        <div className="flex-shrink-0 p-8 border-t border-surface2 bg-surface/80 backdrop-blur-xl flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-4 border-2 border-surface2 text-muted text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-surface2 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="billing-form"
            disabled={isLoading}
            className="flex-[2] py-4 bg-accent text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-glow-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    features: [
      '100 API Requests / mo',
      'Basic Analytics',
      'Community Support',
      '1 Team Member',
      'Standard Responses'
    ]
  },
  {
    name: 'Pro',
    price: '$9',
    popular: true,
    features: [
      '10,000 API Requests / mo',
      'Advanced Analytics',
      'Priority Email Support',
      '5 Team Members',
      'Custom Dashboards',
      'CSV Exports'
    ]
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    features: [
      'Unlimited API Requests',
      'White-glove Onboarding',
      '24/7 Dedicated Support',
      'Unlimited Team Members',
      'SSO & SAML Auth',
      'Custom Legal Terms'
    ]
  }
];

export default function BillingPage() {
  const [data, setData] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [billingRes, profileRes] = await Promise.all([
          fetch('/api/billing/usage'),
          fetch('/api/auth/profile')
        ]);
        
        if (billingRes.ok) {
          const json = await billingRes.json();
          setData(json);
        }
        
        if (profileRes.ok) {
          const profileJson = await profileRes.json();
          setUserProfile(profileJson);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleUpgrade = (planName: string) => {
    // Simulated upgrade flow
    alert(`Initiating upgrade to ${planName} plan... This would normally redirect to Stripe.`);
  };

  const handleDetailsSave = (newBillingData: any) => {
    // Optionally refresh usage data or just update the local profile state
    setUserProfile((prev: any) => ({ ...prev, ...newBillingData }));
  };

  return (
    <div className={cn(
      "space-y-10 max-w-6xl mx-auto transition-all duration-700 ease-spring",
      isDrawerOpen ? "lg:mr-[448px] opacity-50 grayscale-[0.5] scale-[0.98]" : "mr-auto"
    )}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface2 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-text flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-accent" />
            Billing & Subscription
          </h1>
          <p className="text-sm text-muted mt-1">Manage your plan, billing cycle, and API usage quotas</p>
        </div>
      </div>

      {/* Subscription Status & Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Current Plan Card */}
        <div className="lg:col-span-12 xl:col-span-8 bg-surface border border-surface2 rounded-2xl p-6 shadow-sm overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-full -mr-10 -mt-10 group-hover:bg-accent/10 transition-colors" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-accent uppercase tracking-widest bg-accent/10 px-2 py-0.5 rounded-full">
                  Subscription Active
                </span>
              </div>
              <h2 className="text-3xl font-bold text-text mb-1 flex items-center gap-2">
                {loading ? '...' : data?.plan ? data.plan.charAt(0).toUpperCase() + data.plan.slice(1) : 'Free'} Plan
              </h2>
              <div className="flex items-center gap-4 text-sm text-muted">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Renewal: {loading || !data?.renewalDate ? 'N/A' : format(new Date(data.renewalDate), 'MMMM dd, yyyy')}
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-success" />
                  Verified Business
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsDrawerOpen(true)}
                className="px-5 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-xl text-sm font-bold transition-all shadow-glow-sm"
              >
                Manage Details
              </button>
            </div>
          </div>

          <BillingDrawer 
            isOpen={isDrawerOpen} 
            onClose={() => setIsDrawerOpen(false)} 
            userData={userProfile}
            onSave={handleDetailsSave}
          />
        </div>

        {/* Usage Meter Container */}
        <div className="lg:col-span-12 xl:col-span-4 h-full">
          {loading ? (
            <div className="h-full bg-surface border border-surface2 animate-pulse rounded-2xl min-h-[160px]"></div>
          ) : (
            <UsageMeter used={data?.usage || 0} limit={data?.limit || 100} />
          )}
        </div>
      </div>

      {/* Subscription Plans Selection */}
      <div className="space-y-6">
        <div className="text-center md:text-left">
          <h2 className="text-xl font-bold text-text">Choose your plan</h2>
          <p className="text-sm text-muted">Select the best option for your business requirements</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => (
            <PlanCard 
              key={i}
              name={plan.name}
              price={plan.price}
              features={plan.features}
              isPopular={plan.popular}
              isCurrent={data?.plan?.toLowerCase() === plan.name.toLowerCase()}
              onUpgrade={() => handleUpgrade(plan.name)}
            />
          ))}
        </div>
      </div>

      {/* Payment History Table */}
      <div className="bg-surface border border-surface2 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-surface2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-bold text-text">Payment History</h3>
          </div>
          <button className="text-xs font-bold text-accent hover:text-accent/80 transition-colors flex items-center gap-1">
            View All <ExternalLink className="w-3 h-3" />
          </button>
        </div>
        
        <div className="w-full overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface2/30">
                <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Invoice</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface2">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center bg-surface2/5 animate-pulse">
                    <div className="h-4 w-32 bg-surface2 rounded mx-auto"></div>
                  </td>
                </tr>
              ) : data?.paymentHistory && data.paymentHistory.length > 0 ? (
                data.paymentHistory.map((inv: any, i: number) => (
                  <tr key={inv.id} className="hover:bg-surface2/20 transition-colors group">
                    <td className="px-6 py-4 text-sm text-text font-medium">{format(new Date(inv.date), 'MMM dd, yyyy')}</td>
                    <td className="px-6 py-4 text-sm text-muted font-mono">{inv.id}</td>
                    <td className="px-6 py-4 text-sm text-text font-bold">${inv.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-success/10 text-success">
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-all">
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted">
                    <div className="flex flex-col items-center">
                      <FileText className="w-10 h-10 mb-3 opacity-20" />
                      <p className="text-sm font-medium">No payment history found.</p>
                      <p className="text-xs">Invoices will appear here once you subscribe to a paid plan.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
