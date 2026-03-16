import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build');

export const sendVerificationEmail = async (email: string, otp: string) => {
  try {
    await resend.emails.send({
      from: 'Insight Hub <onboarding@resend.dev>', // Replace with custom domain
      to: email,
      subject: 'Verify your email address - Insight Hub',
      html: `
        <div>
          <h1>Welcome to Insight Hub!</h1>
          <p>Your email verification code is:</p>
          <h2>${otp}</h2>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending verification email', error);
  }
};

export const sendPasswordResetEmail = async (email: string, otp: string) => {
  try {
    await resend.emails.send({
      from: 'Insight Hub <security@resend.dev>', // Replace with custom domain
      to: email,
      subject: 'Reset your password - Insight Hub',
      html: `
        <div>
          <h1>Password Reset Request</h1>
          <p>Your password reset code is:</p>
          <h2>${otp}</h2>
          <p>This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending reset email', error);
  }
};
