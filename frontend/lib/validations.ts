import * as z from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const newPasswordSchema = z.object({
  password: registerSchema.shape.password,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const verifyEmailSchema = z.object({
  otp: z.string().length(8, 'OTP must be exactly 8 characters'),
});

export const profileUpdateSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  phoneNumber: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  dateOfBirth: z.string().datetime().optional().nullable(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional().nullable(),
  country: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  timezone: z.string().optional().nullable(),
  language: z.string().optional(),
  avatar: z.string().optional().nullable(), // Will expect base64 strings
  themePreference: z.enum(['LIGHT', 'DARK']).optional(),
  digestEnabled: z.boolean().optional(),
  securityAlertsEnabled: z.boolean().optional(),
});

export const _2faVerifySchema = z.object({
  token: z.string().length(6, 'Token must be exactly 6 characters'),
});

export const apiKeyGenerateSchema = z.object({
  name: z.string().min(2, 'Key name is required').max(50, 'Key name too long'),
});
