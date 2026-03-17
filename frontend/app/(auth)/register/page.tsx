"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/lib/validations';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import axios from 'axios';

// Extend the register schema to include confirmPassword for the frontend form
const registerFormSchema = registerSchema.extend({
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema)
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/auth/register', {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      toast.success(response.data.message || 'Registration successful');
      router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
    } catch (error: any) {
      if (error.response?.data?.message) {
         toast.error(error.response.data.message);
      } else {
         toast.error('Unable to connect to server');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-text mb-2">Create an Account</h1>
        <p className="text-muted text-sm">Join Insight Hub today</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5" htmlFor="firstName">
              First Name
            </label>
            <input
              {...register('firstName')}
              id="firstName"
              placeholder="John"
              disabled={isLoading}
              className={cn(
                "w-full bg-surface2 border border-surface2 text-text rounded-lg px-4 py-2.5 outline-none transition-all placeholder:text-muted/50 focus:border-accent focus:ring-1 focus:ring-accent",
                errors.firstName && "border-danger focus:border-danger focus:ring-danger"
              )}
            />
            {errors.firstName && <p className="text-danger text-xs mt-1.5">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5" htmlFor="lastName">
              Last Name
            </label>
            <input
              {...register('lastName')}
              id="lastName"
              placeholder="Doe"
              disabled={isLoading}
              className={cn(
                "w-full bg-surface2 border border-surface2 text-text rounded-lg px-4 py-2.5 outline-none transition-all placeholder:text-muted/50 focus:border-accent focus:ring-1 focus:ring-accent",
                errors.lastName && "border-danger focus:border-danger focus:ring-danger"
              )}
            />
            {errors.lastName && <p className="text-danger text-xs mt-1.5">{errors.lastName.message}</p>}
          </div>
        </div>

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
          <label className="block text-sm font-medium text-text mb-1.5" htmlFor="password">
            Password
          </label>
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

        <div>
          <label className="block text-sm font-medium text-text mb-1.5" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            {...register('confirmPassword')}
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            disabled={isLoading}
            className={cn(
              "w-full bg-surface2 border border-surface2 text-text rounded-lg px-4 py-2.5 outline-none transition-all placeholder:text-muted/50 focus:border-accent focus:ring-1 focus:ring-accent",
              errors.confirmPassword && "border-danger focus:border-danger focus:ring-danger"
            )}
          />
          {errors.confirmPassword && <p className="text-danger text-xs mt-1.5">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-accent hover:bg-accent/90 text-white font-medium rounded-lg px-4 py-2.5 transition-all flex items-center justify-center mt-6 shadow-[0_0_20px_rgba(108,99,255,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link href="/login" className="text-accent hover:text-accent2 font-medium transition-colors">
          Log in
        </Link>
      </div>
    </div>
  );
}
