import React, { useState } from 'react';
import { 
    Dialog, 
    DialogContent, 
} from "@/components/ui/dialog";

import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/api/endpoints';
import { 
    Rocket, 
    Camera, 
    Sun, 
    Moon, 
    ArrowRight, 
    Check, 
    LayoutDashboard,
    Bell,
    Settings,
    Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface OnboardingModalProps {
    open: boolean;
    onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ open, onClose }) => {
    const { user, toggleTheme } = useAuthStore() as any;
    const [step, setStep] = useState(1);
    const [uploading, setUploading] = useState(false);
    const [tourStep, setTourStep] = useState(0);

    const totalSteps = 4;

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = async () => {
        try {
            await authAPI.completeOnboarding();
            onClose();
            toast.success("Welcome aboard!");
        } catch (error) {
            toast.error("Failed to complete onboarding");
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            await authAPI.uploadAvatar(file);
            toast.success("Avatar updated!");
        } catch (error) {
            toast.error("Upload failed.");
        } finally {
            setUploading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6 py-4 text-center animate-in slide-in-from-right duration-500">
                        <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                            <Rocket className="h-10 w-10 text-primary" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-foreground italic">Welcome to Insight Hub, <span className="text-primary not-italic">{user?.first_name || 'User'}</span>! 🎉</h2>
                            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                                Your all-in-one platform for data analytics and predictive insights. 
                                Let's get you set up in less than a minute.
                            </p>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6 py-4 text-center animate-in slide-in-from-right duration-500">
                        <div className="relative h-32 w-32 mx-auto">
                            <div className="h-full w-full rounded-full border-4 border-primary/20 p-2">
                                {user?.avatar ? (
                                    <img src={user.avatar} className="h-full w-full rounded-full object-cover" alt="avatar" />
                                ) : (
                                    <div className="h-full w-full rounded-full bg-muted flex items-center justify-center">
                                        <Camera className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 h-10 w-10 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg">
                                {uploading ? <Loader2 className="h-5 w-5 animate-spin text-white" /> : <Camera className="h-5 w-5 text-white" />}
                                <input type="file" className="hidden" onChange={handleAvatarUpload} />
                            </label>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold">Add a profile picture</h2>
                            <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">Optional but recommended for identity</p>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6 py-4 animate-in slide-in-from-right duration-500">
                        <h2 className="text-xl font-bold text-center">Choose your style</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => user?.theme_preference !== 'light' && toggleTheme()}
                                className={`p-6 rounded-3xl border-2 transition-all space-y-4 text-center ${user?.theme_preference === 'light' ? 'border-primary bg-primary/5' : 'border-white/5 hover:border-white/20'}`}
                            >
                                <div className="h-12 w-12 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto">
                                    <Sun className="h-6 w-6 text-orange-500" />
                                </div>
                                <p className="text-xs font-black uppercase tracking-widest">Light Mode</p>
                            </button>
                            <button 
                                onClick={() => user?.theme_preference !== 'dark' && toggleTheme()}
                                className={`p-6 rounded-3xl border-2 transition-all space-y-4 text-center ${user?.theme_preference === 'dark' ? 'border-primary bg-primary/20' : 'border-white/5 hover:border-white/20'}`}
                            >
                                <div className="h-12 w-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto">
                                    <Moon className="h-6 w-6 text-blue-500" />
                                </div>
                                <p className="text-xs font-black uppercase tracking-widest">Dark Mode</p>
                            </button>
                        </div>
                        <p className="text-[10px] text-center text-muted-foreground font-bold uppercase tracking-tighter">You can change this anytime in settings</p>
                    </div>
                );
            case 4:
                const tourPoints = [
                    { title: "Main Dashboard", desc: "Access your core analytics and metrics here.", icon: <LayoutDashboard /> },
                    { title: "Notifications", desc: "Stay updated with security and system alerts.", icon: <Bell /> },
                    { title: "Account Settings", desc: "Manage 2FA, sessions, and your personal data.", icon: <Settings /> }
                ];
                return (
                    <div className="space-y-6 py-4 animate-in slide-in-from-right duration-500">
                        <h2 className="text-xl font-bold text-center">Quick Feature Tour</h2>
                        <div className="space-y-3">
                            {tourPoints.map((point, idx) => (
                                <div key={idx} className={`p-4 rounded-2xl border transition-all flex items-center gap-4 ${idx === tourStep ? 'bg-primary/10 border-primary/20' : 'bg-white/5 border-white/5 opacity-50'}`}>
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${idx === tourStep ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                                        {point.icon}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold">{point.title}</p>
                                        <p className="text-[10px] text-muted-foreground">{point.desc}</p>
                                    </div>
                                    {idx === tourStep && (
                                        <div className="ml-auto">
                                            <Check className="h-4 w-4 text-primary" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {tourStep < tourPoints.length - 1 ? (
                            <button 
                                onClick={() => setTourStep(tourStep + 1)}
                                className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-bold transition-all"
                            >
                                Next Feature
                            </button>
                        ) : (
                            <p className="text-[10px] text-center text-primary font-black uppercase italic animate-pulse">You're all set to go!</p>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && handleComplete()}>
            <DialogContent className="sm:max-w-[450px] bg-background/95 backdrop-blur-3xl border-white/10 rounded-[2.5rem] shadow-2xl p-8">
                <div className="absolute top-0 left-0 w-full p-1 space-x-1 flex">
                    {[...Array(totalSteps)].map((_, i) => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i + 1 <= step ? 'bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]' : 'bg-white/10'}`} />
                    ))}
                </div>

                <div className="mt-4">
                    {renderStep()}
                </div>

                <div className="mt-8 flex items-center justify-between gap-4">
                    <button 
                        onClick={handleComplete}
                        className="text-[10px] font-black text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors"
                    >
                        Skip All
                    </button>
                    <button 
                        onClick={handleNext}
                        className="px-8 py-3 rounded-2xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-xl shadow-primary/20"
                    >
                        {step === totalSteps ? 'Start Exploring' : 'Continue'}
                        <ArrowRight className="h-3 w-3" />
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
