"use client";

import { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { verifyEmailSchema } from '@/lib/validations';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import axios from 'axios';

type VerifyFormValues = z.infer<typeof verifyEmailSchema>;

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<VerifyFormValues>({
    resolver: zodResolver(verifyEmailSchema)
  });

  useEffect(() => {
    if (!email) {
      router.push('/login');
    }
  }, [email, router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    
    try {
      const response = await axios.post('/api/auth/resend-otp', { email });
      toast.success(response.data.message || 'OTP sent successfully');
      setCooldown(60);
    } catch (error: any) {
      if (error.response?.data?.message) {
         toast.error(error.response.data.message);
      } else {
         toast.error('Unable to send OTP');
      }
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async (data: VerifyFormValues) => {
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/auth/verify-email', {
        email,
        otp: data.otp,
      });

      toast.success(response.data.message || 'Email verified successfully');
      // If we are verified, push them to login so they can establish a proper secure session
      router.push('/login');
    } catch (error: any) {
      if (error.response?.data?.message) {
         toast.error(error.response.data.message);
      } else {
         toast.error('Verification failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8 flex flex-col items-center">
        <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-6 h-6 text-accent" />
        </div>
        <h1 className="text-2xl font-bold text-text mb-2">Check your email</h1>
        <p className="text-muted text-sm px-4">
          We sent an 8-digit verification code to <br/>
          <span className="font-medium text-text">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1.5" htmlFor="otp">
            Verification Code
          </label>
          <input
            {...register('otp')}
            id="otp"
            type="text"
            placeholder="12345678"
            maxLength={8}
            disabled={isLoading}
            className={cn(
              "w-full bg-surface2 border border-surface2 text-text rounded-lg px-4 py-2.5 outline-none transition-all placeholder:text-muted/50 focus:border-accent focus:ring-1 focus:ring-accent text-center tracking-[0.5em] font-mono text-lg",
              errors.otp && "border-danger focus:border-danger focus:ring-danger"
            )}
          />
          {errors.otp && <p className="text-danger text-xs mt-1.5 text-center">{errors.otp.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-accent hover:bg-accent/90 text-white font-medium rounded-lg px-4 py-2.5 transition-all flex items-center justify-center mt-6 shadow-[0_0_20px_rgba(108,99,255,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Email"}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-surface2 text-center">
        <p className="text-sm text-muted mb-4">Didn&apos;t receive the code?</p>
        <button
          onClick={handleResend}
          disabled={cooldown > 0 || isResending}
          className={cn(
            "text-sm font-medium transition-colors flex items-center justify-center w-full",
            cooldown > 0 
              ? "text-muted cursor-not-allowed" 
              : "text-accent hover:text-accent2"
          )}
        >
          {isResending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend Code"}
        </button>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}
