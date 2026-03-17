"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { Camera, Save, User, MapPin, Settings, Shield, Bell } from 'lucide-react';

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
    themePreference: 'DARK',
    digestEnabled: true,
    securityAlertsEnabled: true,
    avatar: '',
  });

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
            themePreference: data.themePreference || 'DARK',
            digestEnabled: data.digestEnabled ?? true,
            securityAlertsEnabled: data.securityAlertsEnabled ?? true,
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
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
        toast.success('Profile updated successfully');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-text">Profile Settings</h1>
        <p className="text-muted text-sm mt-1">Manage your account settings and preferences.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Photo Section */}
        <div className="bg-surface border border-surface2 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold text-text mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-muted" />
            Profile Photo
          </h2>
          <div className="flex items-center space-x-6">
            <div className="relative w-24 h-24 rounded-full bg-surface2 border-2 border-surface2 overflow-hidden flex-shrink-0">
              {formData.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text font-bold text-2xl uppercase">
                  {formData.firstName?.[0] || ''}{formData.lastName?.[0] || 'U'}
                </div>
              )}
            </div>
            <div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange}
                accept="image/*" 
                className="hidden" 
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-surface2 hover:bg-surface2/80 text-text px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
              >
                <Camera className="w-4 h-4 mr-2" />
                Choose Photo
              </button>
              <p className="text-xs text-muted mt-2">JPG, GIF or PNG. Max size of 2MB.</p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-surface border border-surface2 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold text-text mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">First Name</label>
              <input 
                type="text" 
                name="firstName" 
                value={formData.firstName} 
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-background border border-surface2 rounded-lg text-sm text-text focus:outline-none focus:border-accent transition-colors"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Last Name</label>
              <input 
                type="text" 
                name="lastName" 
                value={formData.lastName} 
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-background border border-surface2 rounded-lg text-sm text-text focus:outline-none focus:border-accent transition-colors"
                placeholder="Doe"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text mb-1 flex items-center">
                Email 
                <span className="ml-2 text-xs bg-surface2 px-2 py-0.5 rounded-md text-muted font-medium border border-surface2">Read-only</span>
              </label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                className="w-full px-4 py-2 bg-surface2/30 border border-surface2 rounded-lg text-sm text-muted cursor-not-allowed"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Phone Number</label>
              <input 
                type="tel" 
                name="phoneNumber" 
                value={formData.phoneNumber} 
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-background border border-surface2 rounded-lg text-sm text-text focus:outline-none focus:border-accent transition-colors"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Gender</label>
              <div className="relative">
                <select 
                  name="gender" 
                  value={formData.gender} 
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-background border border-surface2 rounded-lg text-sm text-text focus:outline-none focus:border-accent appearance-none transition-colors"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-muted">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Date of Birth</label>
              <input 
                type="date" 
                name="dateOfBirth" 
                value={formData.dateOfBirth} 
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-background border border-surface2 rounded-lg text-sm text-text focus:outline-none focus:border-accent transition-colors [color-scheme:dark]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text mb-1">Bio / About Me</label>
              <textarea 
                name="bio" 
                value={formData.bio} 
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 bg-background border border-surface2 rounded-lg text-sm text-text focus:outline-none focus:border-accent resize-none transition-colors"
                placeholder="Tell us a bit about yourself..."
              ></textarea>
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="bg-surface border border-surface2 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold text-text mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-muted" />
            Location Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Country</label>
              <input 
                type="text" 
                name="country" 
                value={formData.country} 
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-background border border-surface2 rounded-lg text-sm text-text focus:outline-none focus:border-accent transition-colors"
                placeholder="e.g. United States"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">City</label>
              <input 
                type="text" 
                name="city" 
                value={formData.city} 
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-background border border-surface2 rounded-lg text-sm text-text focus:outline-none focus:border-accent transition-colors"
                placeholder="e.g. San Francisco"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-text mb-1">Timezone</label>
              <div className="relative">
                <select 
                  name="timezone" 
                  value={formData.timezone} 
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-background border border-surface2 rounded-lg text-sm text-text focus:outline-none focus:border-accent appearance-none transition-colors"
                >
                  <option value="">Select Timezone</option>
                  <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                  <option value="America/New_York">Eastern Time (US & Canada)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                  <option value="Asia/Kolkata">India (IST)</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-muted">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-surface border border-surface2 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold text-text mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-muted" />
            Preferences
          </h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Theme</label>
                <div className="relative">
                  <select 
                    name="themePreference" 
                    value={formData.themePreference} 
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-background border border-surface2 rounded-lg text-sm text-text focus:outline-none focus:border-accent appearance-none transition-colors"
                  >
                    <option value="DARK">Dark Mode</option>
                    <option value="LIGHT">Light Mode</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-muted">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Language</label>
                <div className="relative">
                  <select 
                    name="language" 
                    value={formData.language} 
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-background border border-surface2 rounded-lg text-sm text-text focus:outline-none focus:border-accent appearance-none transition-colors"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-muted">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-surface2 pt-5 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text flex items-center">
                    <Bell className="w-4 h-4 mr-2 text-accent" />
                    Email Digest
                  </p>
                  <p className="text-xs text-muted mt-1 whitespace-pre-wrap">Receive a weekly summary of activities 
                    and key metrics straight to your inbox.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
                  <input 
                    type="checkbox" 
                    name="digestEnabled" 
                    checked={formData.digestEnabled} 
                    onChange={handleInputChange}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-surface2 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent ring-1 ring-white/10"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-success" />
                    Security Alerts
                  </p>
                  <p className="text-xs text-muted mt-1">Get notified immediately about new logins 
                    and security-related events.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
                  <input 
                    type="checkbox" 
                    name="securityAlertsEnabled" 
                    checked={formData.securityAlertsEnabled} 
                    onChange={handleInputChange}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-surface2 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent ring-1 ring-white/10"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-accent hover:bg-accent/90 disabled:opacity-70 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md shadow-accent/20 flex items-center"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
