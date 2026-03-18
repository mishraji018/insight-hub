"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { Camera, Save, User, MapPin, Settings, Shield, Bell, Clock, FileText, Globe, Loader2, LogOut, Mail, Calendar } from 'lucide-react';
import { ThemeFontPicker } from '@/components/ui/ThemeFontPicker';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    gender: '',
    dateOfBirth: '',
    bio: '',
    country: '',
    city: '',
    timezone: '',
    language: 'en',
    themePreference: 'cherry',
    fontPreference: 'Inter',
    digestEnabled: true,
    securityAlertsEnabled: true,
    weeklyReportEnabled: false,
    avatar: '',
  });

  const { t } = useTranslation(formData.language);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/auth/profile');
        if (res.ok) {
          const data = await res.json();
          setFormData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phoneNumber: data.phoneNumber || '',
            gender: data.gender || '',
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
            bio: data.bio || '',
            country: data.country || '',
            city: data.city || '',
            timezone: data.timezone || '',
            language: data.language || 'en',
            themePreference: data.themePreference || 'cherry',
            fontPreference: data.fontPreference || 'Inter',
            digestEnabled: data.digestEnabled ?? true,
            securityAlertsEnabled: data.securityAlertsEnabled ?? true,
            weeklyReportEnabled: data.weeklyReportEnabled ?? false,
            avatar: data.avatar || '',
          });
        } else {
          toast.error('Failed to load profile details.');
        }
      } catch (error) {
        toast.error('Failed to connect to the server.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const savePreference = async (updates: Partial<typeof formData>) => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        toast.success(t('saved'), { id: 'pref-save' });
      } else {
        toast.error('Failed to save preference');
      }
    } catch (err) {
      toast.error('Connection error');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      savePreference({ [name]: checked });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (name === 'language') {
        localStorage.setItem('app-lang', value);
        savePreference({ language: value });
        // Handle RTL
        if (value === 'ar') {
          document.documentElement.setAttribute('dir', 'rtl');
        } else {
          document.documentElement.setAttribute('dir', 'ltr');
        }
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error('Image must be less than 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const payload = { ...formData };
      
      // We don't want to send email as it's read-only
      delete (payload as any).email;
      
      if (payload.dateOfBirth) {
        payload.dateOfBirth = new Date(payload.dateOfBirth).toISOString();
      } else {
        payload.dateOfBirth = null as any;
      }
      
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        toast.success(t('success') + ': ' + t('saved'));
        const data = await res.json();
        // Update session if name or avatar changed
        if (session) {
          await updateSession({
            ...session,
            user: {
              ...session.user,
              name: `${data.user.firstName} ${data.user.lastName}`.trim(),
            }
          });
        }
        window.dispatchEvent(new Event('profile-updated'));
      } else {
        const err = await res.json();
        toast.error(err.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const [isPickerOpen, setIsPickerOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={cn("max-w-4xl mx-auto space-y-5 animate-in fade-in duration-500 pb-12", formData.language === 'ar' && "rtl")}>
      {/* ── Page Header ── */}
      <div className="bg-surface border border-surface2 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-16 h-16 rounded-full bg-accent/10 border-2 border-accent/20 flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:border-accent shadow-glow-sm">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-accent font-black text-xl bg-accent/5 capitalize">
                    {formData.firstName?.[0] || 'U'}
                  </div>
                )}
              </div>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-1 bg-accent text-white rounded-lg shadow-glow-sm hover:scale-110 active:scale-90 transition-all border border-white/20"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>
            <div>
              <h1 className="text-xl font-black text-text tracking-tight flex items-center gap-2">
                {formData.firstName} {formData.lastName}
                <span className="px-2 py-0.5 bg-accent/10 text-accent text-[9px] rounded-full uppercase tracking-widest font-black">Pro</span>
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1">
                <p className="text-[11px] text-muted font-bold flex items-center gap-1.5 opacity-80 email-display">
                  <Mail className="w-3 h-3" />
                  {formData.email}
                </p>
                <p className="text-[11px] text-muted font-bold flex items-center gap-1.5 opacity-60">
                  <Clock className="w-3 h-3" />
                  Last login: 2 hours ago
                </p>
                <p className="text-[11px] text-muted font-bold flex items-center gap-1.5 opacity-60">
                  <Calendar className="w-3 h-3" />
                  Member since: Mar 2024
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-surface2 hover:bg-surface2/80 text-text rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
              <Clock className="w-3.5 h-3.5" />
              Activity
            </button>
            <button 
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-glow-sm disabled:opacity-70 disabled:grayscale"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Forms */}
        <div className="lg:col-span-8 space-y-5">
          {/* Profile Completion Bar */}
          <section className="bg-surface border border-surface2 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="text-[10px] font-black text-muted uppercase tracking-widest">Profile Completion</h3>
              <span className="text-[10px] font-black text-accent">{
                Math.round(([
                  formData.firstName, formData.lastName, formData.bio, 
                  formData.phoneNumber, formData.avatar, formData.country, 
                  formData.city, formData.timezone
                ].filter(Boolean).length / 8) * 100)
              }%</span>
            </div>
            <div className="w-full h-2 bg-surface2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent transition-all duration-1000 ease-out shadow-glow-sm"
                style={{ 
                  width: `${Math.round(([
                    formData.firstName, formData.lastName, formData.bio, 
                    formData.phoneNumber, formData.avatar, formData.country, 
                    formData.city, formData.timezone
                  ].filter(Boolean).length / 8) * 100)}%` 
                }}
              />
            </div>
          </section>

          {/* Personal Details */}
          <section className="bg-surface border border-surface2 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-accent/10 text-accent rounded-lg">
                <User className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-text">Personal Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest px-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full bg-surface2/30 border border-surface2 focus:border-accent rounded-lg px-3 py-2 text-xs font-bold outline-none transition-all placeholder:text-muted/30"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest px-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full bg-surface2/30 border border-surface2 focus:border-accent rounded-lg px-3 py-2 text-xs font-bold outline-none transition-all placeholder:text-muted/30"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest px-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full bg-surface2/30 border border-surface2 focus:border-accent rounded-lg px-3 py-2 text-xs font-bold outline-none transition-all cursor-pointer"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest px-1">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full bg-surface2/30 border border-surface2 focus:border-accent rounded-lg px-3 py-2 text-xs font-bold outline-none transition-all [color-scheme:dark]"
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest">Bio</label>
                  <span className={cn(
                    "text-[9px] font-bold uppercase tracking-tighter",
                    formData.bio.length > 450 ? "text-danger" : "text-muted"
                  )}>
                    {formData.bio.length} / 500
                  </span>
                </div>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  maxLength={500}
                  rows={3}
                  className="w-full bg-surface2/30 border border-surface2 focus:border-accent rounded-xl px-4 py-3 text-xs font-medium outline-none transition-all resize-none placeholder:text-muted/30"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          </section>

          {/* Location & Contact */}
          <section className="bg-surface border border-surface2 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-accent/10 text-accent rounded-lg">
                <Globe className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-text uppercase tracking-tight">Location & Contact</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest px-1">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full bg-surface2/30 border border-surface2 focus:border-accent rounded-lg px-3 py-2 text-xs font-bold outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest px-1">Timezone</label>
                <select 
                  name="timezone" 
                  value={formData.timezone} 
                  onChange={handleInputChange}
                  className="w-full bg-surface2/30 border border-surface2 focus:border-accent rounded-lg px-3 py-2 text-xs font-bold outline-none transition-all cursor-pointer"
                >
                  <option value="">Select Timezone</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Asia/Kolkata">India (IST)</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Preferences & Metadata */}
        <div className="lg:col-span-4 space-y-5">
          <section className="bg-surface border border-surface2 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-accent/10 text-accent rounded-lg">
                <Settings className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-text uppercase tracking-tight">Preferences</h2>
            </div>

            <div className="space-y-3">
                <ThemeFontPicker 
                  currentTheme={formData.themePreference}
                  currentFont={formData.fontPreference}
                  onThemeChange={(id) => {
                    setFormData(prev => ({ ...prev, themePreference: id }));
                    savePreference({ themePreference: id });
                  }}
                  onFontChange={(id) => {
                    setFormData(prev => ({ ...prev, fontPreference: id }));
                    savePreference({ fontPreference: id });
                  }}
                />

              <div className="flex items-center gap-3 p-3 bg-surface2/20 rounded-lg border border-surface2">
                <div className="p-2 bg-accent/5 rounded-lg text-accent">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest block opacity-70">{t('language')}</label>
                  <select 
                    name="language" 
                    value={formData.language} 
                    onChange={handleInputChange}
                    className="w-full bg-transparent text-xs font-bold border-none outline-none p-0 cursor-pointer text-text focus:ring-0"
                  >
                    <option value="en">English (US)</option>
                    <option value="hi">Hindi (हिंदी)</option>
                    <option value="ar">Arabic (العربية)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <h3 className="text-[10px] font-black text-muted uppercase tracking-widest px-1">Notifications</h3>
                <div className="flex items-center justify-between p-2.5 bg-surface2/10 rounded-lg border border-surface2/30">
                  <span className="text-xs font-bold text-text opacity-90">{t('digest')}</span>
                  <input 
                    type="checkbox" 
                    name="digestEnabled" 
                    checked={formData.digestEnabled} 
                    onChange={handleInputChange}
                    className="w-4 h-4 accent-accent cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between p-2.5 bg-surface2/10 rounded-lg border border-surface2/30">
                  <span className="text-xs font-bold text-text opacity-90">{t('security')}</span>
                  <input 
                    type="checkbox" 
                    name="securityAlertsEnabled" 
                    checked={formData.securityAlertsEnabled} 
                    onChange={handleInputChange}
                    className="w-4 h-4 accent-accent cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-surface border border-surface2 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-accent/10 text-accent rounded-lg">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-black text-text uppercase tracking-widest">Account Details</h2>
            </div>
            
            <div className="space-y-3">
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Member Since</span>
                  <span className="text-[10px] font-black text-text uppercase">Mar 2024</span>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Plan</span>
                  <span className="text-[10px] font-black text-accent uppercase">Enterprise</span>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Active Sessions</span>
                  <span className="text-[10px] font-black text-success uppercase">3 Devices</span>
               </div>
            </div>
            
            <div className="pt-4 mt-4 border-t border-surface2 border-dashed">
               <p className="text-[9px] font-black text-danger uppercase tracking-widest mb-3 italic">Danger Zone</p>
               <button 
                 className="w-full py-2.5 bg-danger/5 hover:bg-danger text-danger hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border border-danger/10"
                 onClick={() => toast.error("Account deletion requires support contact")}
                >
                 Delete Data & Account
               </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
