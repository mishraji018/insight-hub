import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/client";
import {
    KeyRound,
    Loader2,
    Eye,
    EyeOff,
    Check,
    ShieldCheck,
    ArrowLeft,
    Lock
} from "lucide-react";
import toast from "react-hot-toast";

const ChangePasswordPage = () => {
    const [formData, setFormData] = useState({
        old_password: "",
        new_password: "",
        confirm_new_password: ""
    });

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    // Password strength checklist
    const requirements = [
        { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
        { label: "Contains uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
        { label: "Contains a number", test: (p: string) => /\d/.test(p) },
        { label: "Contains special character", test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
    ];

    const strength = requirements.filter(r => r.test(formData.new_password)).length;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.new_password !== formData.confirm_new_password) {
            toast.error("New passwords do not match");
            return;
        }

        if (strength < 4) {
            toast.error("New password must meet all requirements");
            return;
        }

        setIsSubmitting(true);
        try {
            await axiosInstance.post('/api/auth/change-password/', formData);
            toast.success("Password updated successfully");
            navigate("/dashboard");
        } catch (error: any) {
            const msg = error.response?.data?.old_password?.[0] || "Failed to update password";
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                <button
                    onClick={() => navigate(-1)}
                    className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </button>

                <div className="glass-card p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-8 flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                            <KeyRound className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">Update Password</h1>
                            <p className="text-xs text-muted-foreground mt-0.5">Keep your account secure with a strong password</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Lock className="h-3 w-3" /> Current Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showOldPassword ? "text" : "password"}
                                    name="old_password"
                                    value={formData.old_password}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-input bg-background/50 px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <ShieldCheck className="h-3 w-3" /> New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    name="new_password"
                                    value={formData.new_password}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-input bg-background/50 px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>

                            {/* Strength Indicator */}
                            {formData.new_password && (
                                <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex gap-1 h-1">
                                        {[1, 2, 3, 4].map((step) => (
                                            <div
                                                key={step}
                                                className={`flex-1 rounded-full transition-all duration-500 ${strength >= step
                                                        ? (strength <= 2 ? 'bg-destructive' : strength === 3 ? 'bg-amber-400' : 'bg-emerald-500')
                                                        : 'bg-white/10'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                        {requirements.map((req, i) => (
                                            <div key={i} className="flex items-center gap-1.5">
                                                <div className={`p-0.5 rounded-full ${req.test(formData.new_password) ? 'bg-emerald-500/20 text-emerald-500' : 'bg-white/5 text-white/20'}`}>
                                                    <Check className="h-3 w-3" />
                                                </div>
                                                <span className={`text-[10px] font-medium ${req.test(formData.new_password) ? 'text-emerald-500' : 'text-muted-foreground'}`}>{req.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Lock className="h-3 w-3" /> Confirm New Password
                            </label>
                            <input
                                type="password"
                                name="confirm_new_password"
                                value={formData.confirm_new_password}
                                onChange={handleChange}
                                required
                                className={`w-full rounded-lg border px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all ${formData.confirm_new_password && formData.new_password !== formData.confirm_new_password ? 'border-destructive/50' : 'border-input'
                                    }`}
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-primary-foreground hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                "Update Password"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordPage;
