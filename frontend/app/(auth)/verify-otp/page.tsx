"use client";

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Loader2, ShieldCheck, Mail, RefreshCw, Sparkles, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/Logo';
import Link from 'next/link';

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const type = searchParams.get('type') || 'register';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Masking utility: p***@gmail.com
  const maskEmail = (emailStr: string | null) => {
    if (!emailStr) return '';
    const [name, domain] = emailStr.split('@');
    if (!domain) return emailStr;
    const maskedName = name.length > 2 ? `${name[0]}***` : `${name}***`;
    return `${maskedName}@${domain}`;
  };

  useEffect(() => {
    if (!email) {
      toast.error('No email provided');
      router.push('/login');
    }
  }, [email, router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]$/.test(value) && value !== '') return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value !== '' && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8);
    if (!pastedData) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, i) => {
      if (i < 8) newOtp[i] = char;
    });
    setOtp(newOtp);
    
    // Focus last input filled
    const lastFilledIdx = Math.min(pastedData.length, 7);
    inputRefs.current[lastFilledIdx]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 8) {
      toast.error('Please enter all 8 digits');
      return;
    }

    setIsLoading(true);
    
    try {
      // Step 1: Verify OTP using consolidated route
      const response = await axios.post('/api/auth/verify-otp', { email, otp: otpString, type });
      
      if (type === 'login') {
        // Step 2: Finalize NextAuth session for login
        const result = await signIn('credentials', {
          email,
          isOtpVerified: 'true',
          redirect: false,
        });

        if (result?.error) {
          toast.error(result.error);
          setIsLoading(false);
        } else {
          const firstName = response.data.firstName || 'User';
          toast.success(`Login successful! Welcome ${firstName}.`);
          setTimeout(() => {
            router.push(`/welcome?name=${encodeURIComponent(firstName)}`);
            router.refresh();
          }, 100);
        }
      } else {
        // Registration verification flow
        toast.success('Email verified! You can now log in.');
        setTimeout(() => {
          router.push('/login');
        }, 100);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Verification failed';
      toast.error(msg);
      if (msg.toLowerCase().includes('expired')) {
        setOtp(['', '', '', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    try {
      await axios.post('/api/auth/resend-otp', { email });
      toast.success('A new OTP has been sent to your email');
      setCooldown(60);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-sm mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-text mb-2 tracking-tight">Check Your Email</h2>
        <p className="text-muted font-bold text-[10px] uppercase tracking-widest leading-relaxed px-4">
          Enter the 8-digit OTP sent to <br/>
          <span className="text-text decoration-accent decoration-2 underline underline-offset-4 font-black">{maskEmail(email)}</span>
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-8">
        <div className="flex justify-between items-center gap-1.5 sm:gap-2" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={cn(
                "w-full h-11 sm:h-14 bg-surface2/30 border-2 border-transparent text-text text-xl font-black rounded-xl text-center outline-none transition-all shadow-glow-hover",
                "focus:border-accent focus:bg-surface2/50 focus:scale-110 focus:shadow-[0_20px_40px_rgba(var(--accent-rgb),0.2)]",
                "shadow-[inset_0_2px_4px_rgba(255,255,255,0.05),0_4px_8px_rgba(0,0,0,0.2)]",
                digit !== '' && "border-accent/40 bg-accent/5 backdrop-blur-sm"
              )}
            />
          ))}
        </div>

        <div className="space-y-4">
          <button
            type="submit"
            disabled={isLoading || otp.some(d => d === '')}
            className="group w-full relative h-12 bg-gradient-to-r from-accent to-accent2 hover:scale-[1.02] active:scale-[0.98] transition-all rounded-xl overflow-hidden shadow-glow-sm disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <div className="relative flex items-center justify-center gap-3">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                <span className="text-white font-black uppercase text-xs tracking-[0.2em]">Verify Account</span>
              )}
            </div>
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="group text-xs font-black text-muted hover:text-accent transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-50 uppercase tracking-widest"
            >
              {resending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className={cn("w-4 h-4 group-hover:rotate-180 transition-transform duration-700", cooldown > 0 && "animate-spin-slow")} />
              )}
              {cooldown > 0 ? `Resend in ${cooldown}s` : "No code? Resend"}
            </button>
          </div>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-white/5 text-center">
        <Link href="/login" className="text-xs font-black text-muted hover:text-text flex items-center justify-center gap-2 transition-all group uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-lg bg-surface/50 backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    }>
      <VerifyOTPContent />
    </Suspense>
  );
}
