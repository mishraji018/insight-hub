import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { 
  BarChart3, 
  Loader2, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ShieldCheck,
  QrCode,
  ArrowLeft
} from 'lucide-react';
import { authAPI } from '@/api/endpoints';
import { toast } from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);
  const isLoading = useAuthStore(s => s.isLoading);
  const error = useAuthStore(s => s.error);
  const clearError = useAuthStore(s => s.clearError);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const user = useAuthStore(s => s.user);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [tempEmail, setTempEmail] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  // Handle errors from store
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;
    
    try {
      const response = await login(formData.email, formData.password);
      if (response && response.requires_2fa) {
        setShow2FA(true);
        setTempEmail(formData.email);
        toast("Two-Factor Authentication Required", { icon: '🔐' });
      }
    } catch (err) {
      // Error handled by useEffect and toast
    }
  };

  const handle2FASubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (otpCode.length < 6) return;
    
    try {
      const response = await authAPI.verify2FA(tempEmail, otpCode);
      sessionStorage.setItem('accessToken', response.access);
      sessionStorage.setItem('refreshToken', response.refresh);
      await useAuthStore.getState().initializeAuth();
      toast.success("Login Successful");
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Invalid code");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <BarChart3 className="h-8 w-8 text-primary" />
          <span className="text-3xl font-bold tracking-tight text-foreground">Insight Hub</span>
        </div>

        <div className="glass-card p-8 shadow-2xl animate-in zoom-in-95 duration-500">
          {!show2FA ? (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
                <p className="text-sm text-muted-foreground mt-1">Sign in to access your secure dashboard</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-input bg-background/50 pl-10 pr-4 py-2.5 text-sm outline-none transition-all placeholder:text-white/5"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</label>
                    <Link to="/forgot-password" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-tighter">Forgot Password?</Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-input bg-background/50 pl-10 pr-10 py-2.5 text-sm outline-none transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary text-sm font-extrabold text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-8">
                <button 
                  onClick={() => setShow2FA(false)}
                  className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest mb-4"
                >
                  <ArrowLeft className="h-3 w-3" /> Back to Login
                </button>
                <h1 className="text-2xl font-bold text-foreground">Secure Verification</h1>
                <p className="text-sm text-muted-foreground mt-1">Enter the 6-digit code or a backup code</p>
              </div>

              <form onSubmit={handle2FASubmit} className="space-y-6">
                <div className="space-y-3">
                  <div className="relative">
                    <QrCode className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/60" />
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\s/g, ''))}
                      required
                      autoFocus
                      className="w-full rounded-2xl border border-input bg-white/5 pl-12 pr-4 py-4 text-xl font-black tracking-[0.2em] outline-none border-primary/20 focus:border-primary transition-all text-center"
                      placeholder="000000"
                    />
                  </div>
                  <p className="text-[10px] text-center font-medium text-muted-foreground">
                    Check your authenticator app for the current code.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={otpCode.length < 6 || isLoading}
                  className="w-full h-14 flex items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-black text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      Verify Identity
                      <ShieldCheck className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          <div className="pt-4 flex items-center gap-3 mt-4">
            <div className="h-px flex-1 bg-border/50"></div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">Secure Access</span>
            <div className="h-px flex-1 bg-border/50"></div>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <ShieldCheck className="h-3 w-3 text-emerald-500" />
              <span>End-to-end encrypted session</span>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-primary hover:underline">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;