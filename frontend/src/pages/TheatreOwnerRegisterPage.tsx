import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Film, Building2, CheckCircle, AlertCircle, Loader2, ShieldCheck, MapPin, Smartphone, Briefcase } from 'lucide-react';
import { authService, type TheatreRegisterRequest } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const TheatreOwnerRegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState<TheatreRegisterRequest>({
        theatreName: '',
        ownerName: '',
        email: '',
        phone: '',
        city: '',
        address: '',
        screensCount: 1,
        verificationDocUrl: '',
        password: '',
        otp: '',
    });

    const [isOtpLoading, setIsOtpLoading] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const set = (field: keyof TheatreRegisterRequest, value: string | number) => {
        setForm(f => ({ ...f, [field]: value }));
    };

    const handleRequestOtp = async () => {
        if (!form.email) {
            setError('Please enter your business email first');
            return;
        }
        setError(null);
        setIsOtpLoading(true);
        try {
            await authService.requestOtp(form.email);
            setIsOtpSent(true);
        } catch (err: any) {
            const errData = err?.response?.data;
            setError(typeof errData === 'string' ? errData : errData?.message || 'Failed to send OTP.');
        } finally {
            setIsOtpLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const data = await authService.registerTheatre(form);
            login(data);
            setSuccess(true);
            setTimeout(() => navigate('/owner/dashboard'), 3000);
        } catch (err: any) {
            const errData = err?.response?.data;
            setError(typeof errData === 'string' ? errData : errData?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/5 blur-[120px] rounded-full translate-y-1/2" />
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-12 text-center max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-700 relative z-10">
                    <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.3)] mx-auto mb-8">
                        <CheckCircle className="w-12 h-12 text-white fill-white/10" />
                    </div>
                    <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter">Application Sent</h2>
                    <p className="text-slate-400 font-medium leading-relaxed">Your theatre registration is now in our verification queue. Our administrators will review the details and approve your access shortly.</p>
                    <div className="mt-10 flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Initializing Dashboard Environment</p>
                    </div>
                </div>
            </div>
        );
    }

    const inputCls = "w-full bg-black/40 border border-white/10 text-white rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/5 transition-all placeholder-slate-700 shadow-inner";
    const labelCls = "block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2";

    return (
        <div className="min-h-screen bg-[#0a0a0f] py-20 px-6 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-red-600/5 blur-[120px] rounded-full" />

            <div className="max-w-3xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                    <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
                        <div className="bg-red-600 p-2 rounded-xl group-hover:scale-110 transition-transform shadow-lg shadow-red-600/20">
                            <Film className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-3xl font-black text-white tracking-tighter uppercase italic">MovieShark</span>
                    </Link>
                    <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none mb-4">Partner Portal</h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> Authorized Business Registration
                    </p>
                </div>

                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 md:p-14 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-1000">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-20" />

                    {error && (
                        <div className="mb-10 px-6 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold uppercase tracking-wide flex items-center gap-3">
                            <AlertCircle className="w-5 h-5" /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-12">
                        {/* Section 1: Theatre */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-600/10 rounded-2xl border border-red-500/20">
                                    <Building2 className="w-6 h-6 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Cinema Details</h3>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Physical property information</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className={labelCls}>Theatre Legal Name *</label>
                                    <input type="text" required value={form.theatreName} onChange={e => set('theatreName', e.target.value)} className={inputCls} placeholder="e.g. Cinema Paradise" />
                                </div>
                                <div className="space-y-2">
                                    <label className={labelCls}>Auditorium Count *</label>
                                    <input type="number" required min={1} max={50} value={form.screensCount} onChange={e => set('screensCount', parseInt(e.target.value))} className={inputCls} />
                                </div>
                                <div className="space-y-2">
                                    <label className={labelCls}>Operating City *</label>
                                    <div className="relative">
                                        <MapPin className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                                        <input type="text" required value={form.city} onChange={e => set('city', e.target.value)} className={inputCls} placeholder="City Name" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className={labelCls}>Security Clearance URL</label>
                                    <input type="url" value={form.verificationDocUrl} onChange={e => set('verificationDocUrl', e.target.value)} className={inputCls} placeholder="Document Link (Optional)" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className={labelCls}>Detailed Location Address *</label>
                                    <textarea required value={form.address} onChange={e => set('address', e.target.value)} className={inputCls + " resize-none min-h-[100px]"} placeholder="Full property address for mapping" />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Owner */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                    <Briefcase className="w-6 h-6 text-emerald-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Ownership Profile</h3>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Admin access credentials</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className={labelCls}>Primary Owner Name *</label>
                                    <input type="text" required value={form.ownerName} onChange={e => set('ownerName', e.target.value)} className={inputCls} placeholder="Legal Full Name" />
                                </div>
                                <div className="space-y-2">
                                    <label className={labelCls}>Verified Mobile *</label>
                                    <div className="relative">
                                        <Smartphone className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                                        <input type="tel" required pattern="[6-9][0-9]{9}" value={form.phone} onChange={e => set('phone', e.target.value)} className={inputCls} placeholder="10-digit mobile" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className={labelCls}>Business Email *</label>
                                    <div className="flex gap-2">
                                        <input type="email" required value={form.email} onChange={e => set('email', e.target.value)} className={inputCls + " flex-1"} placeholder="name@theatre.com" />
                                        <button
                                            type="button"
                                            onClick={handleRequestOtp}
                                            disabled={isOtpLoading || isOtpSent}
                                            className="px-6 bg-red-600/20 hover:bg-red-600/40 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-red-500/20 transition-all disabled:opacity-50"
                                        >
                                            {isOtpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isOtpSent ? 'Sent' : 'Get OTP')}
                                        </button>
                                    </div>
                                </div>
                                {isOtpSent && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                        <label className={labelCls}>OTP Verification *</label>
                                        <input type="text" required value={form.otp} onChange={e => set('otp', e.target.value)} className={inputCls} placeholder="Enter 6-digit OTP" />
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className={labelCls}>Dashboard Password *</label>
                                    <input type="password" required minLength={6} value={form.password} onChange={e => set('password', e.target.value)} className={inputCls} placeholder="Secure access phrase" />
                                </div>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="bg-red-500/5 border border-red-500/10 rounded-3xl p-6 flex items-start gap-4">
                            <div className="bg-red-500 p-1.5 rounded-lg mt-0.5 shadow-lg shadow-red-500/20">
                                <AlertCircle className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-[11px] text-slate-400 font-bold leading-relaxed uppercase tracking-tight">
                                Submission of this form initiates a <span className="text-red-500">Pending Review</span>. You will gain access to ticket inventory management once our verification team validates your property details.
                            </p>
                        </div>

                        <button
                            type="submit" disabled={isLoading}
                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-900/50 text-white font-black py-6 rounded-[2rem] transition-all duration-300 shadow-2xl shadow-red-600/30 flex items-center justify-center gap-4 text-sm uppercase tracking-widest active:scale-95 group"
                        >
                            {isLoading ? (
                                <><Loader2 className="w-5 h-5 animate-spin text-white/50" /> Transmitting...</>
                            ) : (
                                <>Apply for Partnership <div className="bg-white/20 p-1 rounded-md"><Building2 className="w-4 h-4" /></div></>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 pt-10 border-t border-white/5 text-center">
                        <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">
                            Authorized Representative?{' '}
                            <Link to="/login" className="text-red-500 hover:text-red-400 font-black transition-colors">
                                Authenticate Here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TheatreOwnerRegisterPage;
