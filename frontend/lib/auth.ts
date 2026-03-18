import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { comparePassword } from "./security";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error("Missing email");
        }

        // Special case: Session creation after OTP verification
        if ((credentials as any).isOtpVerified === 'true') {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string }
          });
          
          if (!user) throw new Error("User not found");
          if (!user.isActive) throw new Error("Account deactivated");
          
          return {
            id: user.id,
            email: user.email,
            name: user.firstName ? `${user.firstName} ${user.lastName}` : null,
            role: user.role,
          };
        }

        if (!credentials?.password) {
          throw new Error("Password is required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new Error("Account is temporarily locked. Try again later.");
        }

        const isValid = await comparePassword(credentials.password as string, user.password);

        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        if (!user.isActive) {
          throw new Error("Your account has been deactivated. Please contact support.");
        }

        // NOTE: We no longer block here for isEmailVerified because 
        // the new flow handles both verified and unverified users via OTP.
        
        return {
          id: user.id,
          email: user.email,
          name: user.firstName ? `${user.firstName} ${user.lastName}` : null,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Only track for credentials provider (not OAuth)
      if (account?.provider !== "credentials" || !user?.id) return true;

      try {
        // Generate a deterministic session token tied to this login event
        const sessionToken = `${user.id}-${Date.now()}`;

        // Write LoginHistory + create/update UserSession in one transaction
        await prisma.$transaction([
          prisma.loginHistory.create({
            data: {
              userId: user.id,
              // Browser/IP available only server-side per-request;
              // these are omitted here (no request headers in signIn callback)
              // and can be enriched by the /api/track/session route if needed
            },
          }),
          prisma.userSession.create({
            data: {
              userId: user.id,
              sessionToken,
              isActive: true,
              lastActive: new Date(),
            },
          }),
          // Security Notification for Login
          prisma.notification.create({
            data: {
              userId: user.id,
              title: "Security Alert: New Login",
              message: `A new login was detected on your account at ${new Date().toLocaleTimeString()}. If this wasn't you, please change your password immediately.`,
              type: "SECURITY"
            }
          }),
        ]);

        // Clean up sessions older than 30 days (non-blocking, best-effort)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        prisma.userSession
          .updateMany({
            where: { userId: user.id, createdAt: { lt: thirtyDaysAgo } },
            data: { isActive: false },
          })
          .catch(() => { /* swallow — not critical */ });
      } catch (err) {
        // Never block sign-in due to tracking errors
        console.error("[auth] signIn tracking error:", err);
      }

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 15 * 60, // 15 minutes access token duration
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
});
