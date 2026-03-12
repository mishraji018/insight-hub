import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
    BarChart3,
    Loader2,
    Eye,
    EyeOff,
    Check,
    ShieldAlert,
    UserPlus,
    Mail,
    ArrowRight,
    ShieldCheck
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

const RegisterPage = () => {
    const [searchParams] = useSearchParams();
    const inviteToken = searchParams.get("invite");
    const [isValidating, setIsValidating] = useState(true);
    const [validationError, setValidationError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirm_password: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const requirements = [
        { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
        { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
        { label: "Contains a number", test: (p: string) => /\d/.test(p) },
        { label: "Special character", test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
    ];

    const strength = requirements.filter(r => r.test(formData.password)).length;

    useEffect(() => {
        const validateToken = async () => {
            if (!inviteToken) {
                setValidationError("Invite token is required to register.");
                setIsValidating(false);
                return;
            }

            try {
                await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/validate-invite/?token=${inviteToken}`);
                setIsValidating(false);
            } catch (error: any) {
                setValidationError(error.response?.data?.error || "This invite link is invalid or has expired.");
                setIsValidating(false);
            }
        };

        validateToken();
    }, [inviteToken]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirm_password) {
            toast.error("Passwords do not match");
            return;
        }

        if (strength < 4) {
            toast.error("Please meet all password requirements");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register/`, {
                ...formData,
                invite_token: inviteToken
            });

            const { access, refresh, user } = response.data;
            useAuthStore.setState({
                user,
                accessToken: access,
                refreshToken: refresh,
                isAuthenticated: true,
                isApproved: user.is_approved,
                isStaff: user.is_staff || false
            });

            toast.success("Account created! Waiting for admin approval.");
            navigate("/pending-approval");
        } catch (error: any) {
            toast.error(error.response?.data?.email?.[0] || "Registration failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isValidating) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (validationError) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <div className="w-full max-w-md glass-card p-10 text-center border-destructive/20 scale-in-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
                        <ShieldAlert className="h-8 w-8 text-destructive" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-4">Invalid Invite</h1>
                    <p className="text-muted-foreground mb-8 text-balance">
                        {validationError}
                        <br />
                        Please contact the administrator for a new invite link.
                    </p>
                    <button
                        onClick={() => navigate("/login")}
                        className="w-full h-12 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-bold transition-all"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4 py-12 overflow-y-auto">
            <div className="w-full max-w-lg">
                <div className="flex items-center justify-center gap-2 mb-8">
                    <BarChart3 className="h-8 w-8 text-primary" />
                    <span className="text-3xl font-bold tracking-tight text-foreground">Insight Hub</span>
                </div>

                <div className="glass-card p-8 shadow-2xl animate-in zoom-in-95 duration-500">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
                        <p className="text-sm text-muted-foreground mt-1">Join the secure Insight Hub network</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">First Name</label>
                                <input
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-input bg-background/50 px-4 py-2.5 text-sm outline-none transition-all placeholder:text-white/10"
                                    placeholder="John"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Last Name</label>
                                <input
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-input bg-background/50 px-4 py-2.5 text-sm outline-none transition-all placeholder:text-white/10"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-foreground/40">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-input bg-background/50 px-4 py-2.5 text-sm outline-none transition-all placeholder:text-white/5"
                                placeholder="john@example.com"
                            />
                        </div>

                        <div className="space-y-1.5 pt-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-foreground/40">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-input bg-background/50 px-4 py-2.5 text-sm outline-none transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>

                            {/* Strength Indicator */}
                            {formData.password && (
                                <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-1">
                                    <div className="flex gap-1 h-1">
                                        {[1, 2, 3, 4].map((step) => (
                                            <div
                                                key={step}
                                                className={`flex-1 rounded-full transition-all duration-500 ${strength >= step
                                                        ? (strength <= 2 ? 'bg-destructive' : strength === 3 ? 'bg-amber-400' : 'bg-emerald-500')
                                                        : 'bg-white/5'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                        {requirements.map((req, i) => (
                                            <div key={i} className="flex items-center gap-1.5 text-[10px] font-medium transition-colors">
                                                <div className={`p-0.5 rounded-full ${req.test(formData.password) ? 'bg-emerald-500/20 text-emerald-500' : 'bg-white/5 text-white/10'}`}>
                                                    <Check className="h-2.5 w-2.5" />
                                                </div>
                                                <span className={req.test(formData.password) ? 'text-emerald-500' : 'text-muted-foreground'}>{req.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-foreground/40">Confirm Password</label>
                            <input
                                type="password"
                                name="confirm_password"
                                value={formData.confirm_password}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-input bg-background/50 px-4 py-2.5 text-sm outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-12 mt-6 flex items-center justify-center gap-2 rounded-xl bg-primary text-sm font-extrabold text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Complete Registration"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
