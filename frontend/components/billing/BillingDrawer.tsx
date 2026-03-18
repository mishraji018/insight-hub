"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  CreditCard, 
  ShieldCheck, 
  Save, 
  Loader2,
  Building2,
  Mail,
  User as UserIcon,
  Phone,
  MapPin,
  Globe,
  Hash
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface BillingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any;
  onSave: (data: any) => void;
}

export function BillingDrawer({ isOpen, onClose, userData, onSave }: BillingDrawerProps) {
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
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-background/40 backdrop-blur-md z-[100] transition-opacity duration-500",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-full sm:w-[500px] bg-surface border-l border-surface2 shadow-2xl z-[101] flex flex-col transition-transform duration-700 ease-spring",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-8 border-b border-surface2 bg-gradient-to-r from-accent/5 to-accent2/5">
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
          <h2 className="text-2xl font-black text-text tracking-tight">Billing Settings</h2>
          <p className="text-sm text-muted font-bold uppercase tracking-widest mt-1 opacity-70">Details and payment methods</p>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-8 pb-32">
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
                    className="w-full bg-surface2/30 border-2 border-transparent focus:border-accent text-text rounded-2xl pl-12 pr-4 py-3 text-sm transition-all outline-none"
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
                    className="w-full bg-surface2/50 border-2 border-transparent text-muted rounded-2xl pl-12 pr-4 py-3 text-sm cursor-not-allowed outline-none"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest px-1">Company (Optional)</label>
                  <input
                    type="text"
                    name="billingCompany"
                    value={formData.billingCompany}
                    onChange={handleInputChange}
                    className="w-full bg-surface2/30 border-2 border-transparent focus:border-accent text-text rounded-2xl px-4 py-3 text-sm transition-all outline-none"
                    placeholder="Acme Inc."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest px-1">Tax ID / VAT</label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/50 font-bold" />
                    <input
                      type="text"
                      name="billingTaxId"
                      value={formData.billingTaxId}
                      onChange={handleInputChange}
                      className="w-full bg-surface2/30 border-2 border-transparent focus:border-accent text-text rounded-2xl pl-12 pr-4 py-3 text-sm transition-all outline-none"
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
                    className="w-full bg-surface2/30 border-2 border-transparent focus:border-accent text-text rounded-2xl pl-12 pr-4 py-3 text-sm transition-all outline-none"
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
                  className="w-full bg-surface2/30 border-2 border-transparent focus:border-accent text-text rounded-2xl px-4 py-3 text-sm transition-all outline-none"
                  placeholder="123 Main St"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest px-1">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  name="billingAddressLine2"
                  value={formData.billingAddressLine2}
                  onChange={handleInputChange}
                  className="w-full bg-surface2/30 border-2 border-transparent focus:border-accent text-text rounded-2xl px-4 py-3 text-sm transition-all outline-none"
                  placeholder="Apartment or Suite"
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
                    className="w-full bg-surface2/30 border-2 border-transparent focus:border-accent text-text rounded-2xl px-4 py-3 text-sm transition-all outline-none"
                    placeholder="San Francisco"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest px-1">State / Province</label>
                  <input
                    type="text"
                    name="billingState"
                    value={formData.billingState}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-surface2/30 border-2 border-transparent focus:border-accent text-text rounded-2xl px-4 py-3 text-sm transition-all outline-none"
                    placeholder="California"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest px-1">ZIP / Postal Code</label>
                  <input
                    type="text"
                    name="billingZip"
                    value={formData.billingZip}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-surface2/30 border-2 border-transparent focus:border-accent text-text rounded-2xl px-4 py-3 text-sm transition-all outline-none"
                    placeholder="94103"
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
                      className="w-full bg-surface2/30 border-2 border-transparent focus:border-accent text-text rounded-2xl pl-12 pr-4 py-3 text-sm appearance-none outline-none transition-all"
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
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-bl-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
              
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

        {/* Footer Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-8 border-t border-surface2 bg-surface/80 backdrop-blur-xl flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-4 border-2 border-surface2 text-muted text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-surface2 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-[2] py-4 bg-gradient-to-r from-accent to-accent2 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-glow-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}
