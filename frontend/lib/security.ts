import bcrypt from 'bcryptjs';
import { authenticator } from 'otplib';
import crypto from 'crypto';
import { prisma } from './prisma';

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 12);
};

export const comparePassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

// Rate Limiting Config
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 10 * 60 * 1000; // 10 minutes

export const logAudit = async (
  userId: string | null,
  action: string,
  metadata: any = null,
  reqDetails: { ip?: string, userAgent?: string } = {}
) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
        ipAddress: reqDetails.ip || null,
        userAgent: reqDetails.userAgent || null,
      }
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
};

// 2FA TOTP functions
export const generateTwoFaSecret = () => {
  return authenticator.generateSecret();
};

export const generateTwoFaUri = (email: string, secret: string) => {
  const issuer = process.env.TOTP_ISSUER || 'InsightHub';
  return authenticator.keyuri(email, issuer, secret);
};

export const verifyTwoFaToken = (token: string, secret: string) => {
  return authenticator.verify({ token, secret });
};

export const generateBackupCodes = () => {
  const codes = [];
  for (let i = 0; i < 8; i++) {
    codes.push(crypto.randomBytes(4).toString('hex'));
  }
  return codes;
};

// API Key hashing
export const createApiKey = () => {
  const prefix = crypto.randomBytes(4).toString('hex');
  const secret = crypto.randomBytes(24).toString('base64url');
  const fullKey = `ih_${prefix}_${secret}`;
  
  const hash = crypto.createHash('sha256').update(fullKey).digest('hex');
  
  return { prefix, secret, fullKey, hash };
};

export const hashApiSecret = (secretKey: string) => {
  return crypto.createHash('sha256').update(secretKey).digest('hex');
};

// OTP (Email generation)
export const generateDigitOTP = () => {
  return Math.floor(10000000 + Math.random() * 90000000).toString(); // 8 digits
};
