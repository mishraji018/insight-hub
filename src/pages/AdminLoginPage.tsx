import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);
  const isLoading = useAuthStore(s => s.isLoading);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const user = useAuthStore(s => s.user);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email?.toLowerCase().endsWith('@kiet.edu')) {
      setError('Access Denied: Only @kiet.edu email addresses are authorized for admin access.');
      return;
    }
    setError('');
    
    try {
      await login(email, password);
      // navigation is handled by the useEffect above
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid admin credentials.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative background elements for a more premium "admin" feel */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md z-10">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.2)]">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <span className="text-3xl font-bold tracking-tight text-foreground">KIET Admin</span>
        </div>

        <div className="glass-card p-8 shadow-2xl border-primary/20 animate-in zoom-in-95 duration-500 relative overflow-hidden">
          {/* Top glow line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Administrator Login</h1>
            <p className="text-sm text-muted-foreground mt-1">Authorized KIET personnel only</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  required
                  className="w-full rounded-lg border border-input bg-background/50 pl-10 pr-4 py-2.5 text-sm outline-none transition-all placeholder:text-white/10 focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="admin@kiet.edu"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={(e) => e.target.placeholder = ''}
                  onBlur={(e) => e.target.placeholder = 'Enter admin password'}
                  required
                  className="w-full rounded-lg border border-input bg-background/50 pl-10 pr-10 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Enter admin password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full h-12 mt-6 flex items-center justify-center gap-2 rounded-xl bg-primary text-sm font-extrabold text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
            >
              Access Admin Panel
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          
          <div className="mt-8 flex justify-center">
            <button onClick={() => navigate('/login')} className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1">
              Return to User Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
