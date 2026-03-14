import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authAPI } from "@/api/endpoints";
import { Mail, Loader2, CheckCircle2, ShieldAlert, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";

const EmailVerificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const emailParam = queryParams.get("email") || localStorage.getItem("pending_verification_email");
    if (emailParam) {
      setEmail(emailParam);
    } else {
      toast.error("Invalid verification session.");
      navigate("/login");
    }
  }, [location, navigate]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.verifyEmail({ email, otp });
      toast.success("Email verified successfully!");
      localStorage.removeItem("pending_verification_email");
      setVerified(true);
    } catch (error: any) {
      toast.error(error.response?.data?.otp?.[0] || error.response?.data?.detail || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setResending(true);
    try {
      await authAPI.resendVerification(email);
      toast.success("New verification code sent!");
      setResendTimer(60);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.1)_0%,transparent_70%)]" />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10 animate-in zoom-in-95 duration-500">
        {!verified ? (
          <>
            <div className="text-center">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-black mb-2 italic">Verify <span className="text-primary not-italic">Identity</span></h1>
              <p className="text-muted-foreground text-sm font-medium"> We've sent a 6-digit code to <span className="text-foreground font-bold">{email}</span></p>
            </div>

            <form onSubmit={handleVerify} className="glass-card p-10 space-y-8 border-none shadow-2xl">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground block text-center">Enter Verification Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full h-16 rounded-2xl bg-black/20 border border-white/5 focus:border-primary/50 text-center text-3xl font-black tracking-[0.6em] transition-all outline-none shadow-inner"
                  placeholder="000000"
                />
              </div>

              <button
                disabled={loading || otp.length < 6}
                type="submit"
                className="w-full h-14 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify Account"}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendTimer > 0 || resending}
                  className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all disabled:opacity-50"
                >
                  {resending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                  {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Didn't receive code? Resend"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="h-24 w-24 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/20 rotate-12 shadow-2xl shadow-emerald-500/10">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 -rotate-12" />
            </div>
            <div className="space-y-3">
              <h2 className="text-4xl font-black tracking-tighter italic">Verified<span className="text-primary not-italic">!</span></h2>
              <p className="text-muted-foreground font-medium text-sm leading-relaxed px-8">Your email has been successfully verified. You can now access all features of Insight Hub.</p>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="w-full h-14 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:opacity-90 active:scale-[0.98] transition-all shadow-xl shadow-emerald-500/20"
            >
              Continue to Login
            </button>
          </div>
        )}

        <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0" />
          <p className="text-[10px] text-amber-500/80 font-bold leading-relaxed uppercase tracking-widest">
            Always check your spam folder if you haven't received the verification email within 2 minutes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
