import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, generateDigitOTP, logAudit } from "@/lib/security";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Missing email or password" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.password) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ message: "Account is inactive" }, { status: 403 });
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return NextResponse.json({ message: "Account is temporarily locked" }, { status: 423 });
    }

    const isPasswordCorrect = await comparePassword(password, user.password);

    if (!isPasswordCorrect) {
      // Logic for lockout/failed attempts could be added here
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    // Step 1 Passed: Generate OTP
    const otp = generateDigitOTP();
    
    await prisma.oTP.create({
      data: {
        userId: user.id,
        otp,
        type: "LOGIN",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
      }
    });

    // Send OTP
    await sendVerificationEmail(email, otp);

    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    await logAudit(user.id, "LOGIN_OTP_TRIGGERED", { email }, { ip });

    return NextResponse.json({ 
      message: "Credentials verified. Please enter the OTP sent to your email.",
      email 
    });
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
