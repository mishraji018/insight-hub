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
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        if (result.error.includes("verify your email")) {
          toast.error("Please verify your email first.");
          router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
        } else {
          toast.error(result.error);
        }
        setIsLoading(false);
      } else {
        toast.success("Login successful");
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      toast.error('Unable to connect to server');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-text mb-2">Welcome Back</h1>
        <p className="text-muted text-sm">Enter your credentials to access your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1.5" htmlFor="email">
            Email Address
          </label>
          <input
            {...register('email')}
            id="email"
            type="email"
            placeholder="name@company.com"
            disabled={isLoading}
            className={cn(
              "w-full bg-surface2 border border-surface2 text-text rounded-lg px-4 py-2.5 outline-none transition-all placeholder:text-muted/50 focus:border-accent focus:ring-1 focus:ring-accent",
              errors.email && "border-danger focus:border-danger focus:ring-danger"
            )}
          />
          {errors.email && <p className="text-danger text-xs mt-1.5">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-sm font-medium text-text" htmlFor="password">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs text-accent hover:text-accent2 transition-colors">
              Forgot password?
            </Link>
          </div>
          <input
            {...register('password')}
            id="password"
            type="password"
            placeholder="••••••••"
            disabled={isLoading}
            className={cn(
              "w-full bg-surface2 border border-surface2 text-text rounded-lg px-4 py-2.5 outline-none transition-all placeholder:text-muted/50 focus:border-accent focus:ring-1 focus:ring-accent",
              errors.password && "border-danger focus:border-danger focus:ring-danger"
            )}
          />
          {errors.password && <p className="text-danger text-xs mt-1.5">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-accent hover:bg-accent/90 text-white font-medium rounded-lg px-4 py-2.5 transition-all flex items-center justify-center mt-6 shadow-[0_0_20px_rgba(108,99,255,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-muted">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-accent hover:text-accent2 font-medium transition-colors">
          Create one now
        </Link>
      </div>
    </div>
  );
}
