import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const sendVerificationEmail = async (email: string, otp: string) => {
  try {
    await transporter.sendMail({
      from: `"Insight Hub" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Verify your email - Insight Hub",
      html: `
        <div style="font-family:sans-serif;max-width:400px;margin:auto;padding:20px;background:#0f172a;color:white;border-radius:16px;">
          <h2 style="color:#ec4899;">Insight Hub</h2>
          <p>Your verification OTP is:</p>
          <h1 style="letter-spacing:8px;color:#00ff88;">${otp}</h1>
          <p style="color:#6b7280;">Valid for 10 minutes only.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Email error:", error);
  }
};

export const sendPasswordResetEmail = async (email: string, otp: string) => {
  try {
    await transporter.sendMail({
      from: `"Insight Hub" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Reset your password - Insight Hub",
      html: `
        <div style="font-family:sans-serif;max-width:400px;margin:auto;padding:20px;background:#0f172a;color:white;border-radius:16px;">
          <h2 style="color:#ec4899;">Insight Hub</h2>
          <p>Your password reset OTP is:</p>
          <h1 style="letter-spacing:8px;color:#00ff88;">${otp}</h1>
          <p style="color:#6b7280;">Valid for 10 minutes only.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Email error:", error);
  }
};
