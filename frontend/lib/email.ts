import { Resend } from "resend";
import nodemailer from "nodemailer";

const resend = new Resend(process.env.RESEND_API_KEY);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const isProd = process.env.NODE_ENV === "production";

export const sendVerificationEmail = async (email: string, otp: string) => {
  const subject = "Verify your email - Insight Hub";
  const html = `<div style="font-family:sans-serif;max-width:400px;margin:auto;padding:20px;background:#0f172a;color:white;border-radius:16px;"><h2 style="color:#ec4899;">Insight Hub</h2><p>Your verification OTP is:</p><h1 style="letter-spacing:8px;color:#00ff88;">${otp}</h1><p style="color:#6b7280;">Valid for 10 minutes only.</p></div>`;

  try {
    if (isProd) {
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject,
        html,
      });
    } else {
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject,
        html,
      });
    }
  } catch (error) {
    console.error("Email error:", error);
  }
};

export const sendPasswordResetEmail = async (email: string, otp: string) => {
  const subject = "Reset your password - Insight Hub";
  const html = `<div style="font-family:sans-serif;max-width:400px;margin:auto;padding:20px;background:#0f172a;color:white;border-radius:16px;"><h2 style="color:#ec4899;">Insight Hub</h2><p>Your password reset OTP is:</p><h1 style="letter-spacing:8px;color:#00ff88;">${otp}</h1><p style="color:#6b7280;">Valid for 10 minutes only.</p></div>`;

  try {
    if (isProd) {
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject,
        html,
      });
    } else {
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject,
        html,
      });
    }
  } catch (error) {
    console.error("Email error:", error);
  }
};