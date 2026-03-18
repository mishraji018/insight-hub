"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/validations';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import axios from 'axios';

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/auth/login', {
        email: data.email,
        password: data.password,
      });

      toast.success(response.data.message);
      window.location.href = `/verify-otp?email=${encodeURIComponent(data.email)}&type=login`;
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Unable to connect to server');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-sm mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-text mb-2 tracking-tight">Welcome Back</h1>
        <p className="text-muted font-bold text-[10px] uppercase tracking-widest opacity-80">Access your insights</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-black text-muted uppercase tracking-widest mb-2 px-1" htmlFor="email">
            Email Address
          </label>
          <input
            {...register('email')}
            id="email"
            type="email"
            placeholder="name@company.com"
            disabled={isLoading}
            className={cn(
              "w-full bg-surface2/30 border-2 border-transparent text-text rounded-xl px-4 py-2.5 text-xs outline-none transition-all placeholder:text-muted/40",
              "focus:bg-surface2/50 focus:border-accent focus:shadow-[0_0_20px_rgba(var(--accent-rgb),0.1)]",
              errors.email && "border-danger/50 focus:border-danger"
            )}
          />
          {errors.email && <p className="text-danger text-[10px] font-bold uppercase tracking-wider mt-2 px-1">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2 px-1">
            <label className="block text-xs font-black text-muted uppercase tracking-widest" htmlFor="password">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs font-bold text-accent hover:text-accent2 transition-all hover:translate-x-1">
              Forgot?
            </Link>
          </div>
          <input
            {...register('password')}
            id="password"
            type="password"
            placeholder="••••••••"
            disabled={isLoading}
            className={cn(
              "w-full bg-surface2/30 border-2 border-transparent text-text rounded-xl px-4 py-2.5 text-xs outline-none transition-all placeholder:text-muted/40",
              "focus:bg-surface2/50 focus:border-accent focus:shadow-[0_0_20px_rgba(var(--accent-rgb),0.1)]",
              errors.password && "border-danger/50 focus:border-danger"
            )}
          />
          {errors.password && <p className="text-danger text-[10px] font-bold uppercase tracking-wider mt-2 px-1">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="group w-full relative h-12 bg-gradient-to-r from-accent to-accent2 active:scale-[0.98] transition-all rounded-xl overflow-hidden shadow-lg disabled:opacity-70 disabled:grayscale disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          <div className="relative flex items-center justify-center gap-3">
             {isLoading ? (
               <Loader2 className="w-5 h-5 animate-spin text-white" />
             ) : (
               <span className="text-white font-black uppercase text-xs tracking-[0.2em]">Sign In</span>
             )}
          </div>
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs font-bold text-muted uppercase tracking-widest">
          No account?{' '}
          <Link href="/register" className="text-accent hover:text-accent2 transition-colors inline-flex items-center gap-1 group">
            Create one <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
