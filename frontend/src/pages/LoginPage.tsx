import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Film, Loader2, UserPlus, LogIn, ShieldCheck, Zap } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('admin@gmail.com');
    const [password, setPassword] = useState('1234');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isOtpLoading, setIsOtpLoading] = useState(false);
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleError = (err: any) => {
        const data = err?.response?.data;
        if (typeof data === 'string') {
            setError(data);
        } else if (data && typeof data === 'object') {
            if (data.message) {
                setError(data.message);
            } else {
                // Handle Spring field validation errors (e.g. { "password": "Password must be at least 6 characters" })
                const errorMessages = Object.values(data).filter(msg => typeof msg === 'string');
                if (errorMessages.length > 0) {
                    setError(errorMessages.join(' | '));
                } else {
                    setError('Something went wrong. Please try again.');
                }
            }
        } else {
            setError(err?.message || 'Something went wrong. Please try again.');
        }
    };

    const handleRequestOtp = async () => {
        if (!email) {
            setError('Please enter your email first');
            return;
        }
        setError('');
        setIsOtpLoading(true);
        try {
            await authService.requestOtp(email);
            setIsOtpSent(true);
        } catch (err) {
            handleError(err);
        } finally {
            setIsOtpLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await authService.login({ email, password });
            login(res);
            if (res.role === 'ADMIN') navigate('/admin');
            else if (res.role === 'THEATRE_OWNER') navigate('/owner/dashboard');
            else navigate('/');
        } catch (err) {
            handleError(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setIsLoading(true);
        try {
            const res = await authService.register({ name, email, phone, password, otp });
            login(res);
            navigate('/');
        } catch (err) {
            handleError(err);
        } finally {
            setIsLoading(false);
        }
    };

    const switchMode = (m: 'login' | 'signup') => {
        setMode(m);
        setError('');
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6 relative overflow-hidden">

            {/* Background Aesthetic */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-red-600/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-red-600/5 blur-[120px] rounded-full" />

            <div className="w-full max-w-lg relative z-10 animate-in fade-in zoom-in-95 duration-700">
                {/* Logo & Header */}
                <div className="text-center mb-10">
                    <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
                        <div className="bg-red-600 p-2 rounded-xl group-hover:scale-110 transition-transform shadow-lg shadow-red-600/20">
                            <Film className="w-8 h-8 text-white" />
                        </div>
                        <span className="text-4xl font-bold text-white tracking-tighter uppercase italic">
                            MovieShark
                        </span>
                    </Link>
                    <div className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure Encryption Active
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-30" />

                    {/* Mode Toggle */}
                    <div className="flex bg-black/40 rounded-2xl p-1.5 mb-10 border border-white/5">
                        <button
                            onClick={() => switchMode('login')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${mode === 'login'
                                ? 'bg-red-600 text-white shadow-xl shadow-red-600/20'
                                : 'text-slate-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <LogIn className="w-4 h-4" /> Sign In
                        </button>
                        <button
                            onClick={() => switchMode('signup')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${mode === 'signup'
                                ? 'bg-red-600 text-white shadow-xl shadow-red-600/20'
                                : 'text-slate-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <UserPlus className="w-4 h-4" /> Sign Up
                        </button>
                    </div>

                    {error && (
                        <div className="mb-8 px-6 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold uppercase tracking-wide flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                            <Zap className="w-4 h-4" /> {error}
                        </div>
                    )}

                    <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-6">
                        {mode === 'signup' && (
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                                <input
                                    type="text" value={name} onChange={e => setName(e.target.value)} required
                                    placeholder="Enter your name"
                                    className="w-full bg-black/40 border border-white/10 text-white rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/5 transition-all placeholder-slate-700 shadow-inner"
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="flex gap-2">
                                <input
                                    type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                    placeholder="you@example.com"
                                    className="flex-1 bg-black/40 border border-white/10 text-white rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/5 transition-all placeholder-slate-700 shadow-inner"
                                />
                                {mode === 'signup' && (
                                    <button
                                        type="button"
                                        onClick={handleRequestOtp}
                                        disabled={isOtpLoading || isOtpSent}
                                        className="px-6 bg-red-600/20 hover:bg-red-600/40 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-red-500/20 transition-all disabled:opacity-50"
                                    >
                                        {isOtpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isOtpSent ? 'Sent' : 'Get OTP')}
                                    </button>
                                )}
                            </div>
                        </div>

                        {mode === 'signup' && isOtpSent && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">OTP Verification</label>
                                <input
                                    type="text" value={otp} onChange={e => setOtp(e.target.value)} required
                                    placeholder="Enter 6-digit OTP"
                                    className="w-full bg-black/40 border border-white/10 text-white rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/5 transition-all placeholder-slate-700 shadow-inner"
                                />
                            </div>
                        )}

                        {mode === 'signup' && (
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mobile Number</label>
                                <input
                                    type="tel" value={phone} onChange={e => setPhone(e.target.value)} required
                                    placeholder="10-digit primary contact"
                                    className="w-full bg-black/40 border border-white/10 text-white rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/5 transition-all placeholder-slate-700 shadow-inner"
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Secure Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                                    placeholder="••••••••"
                                    className="w-full bg-black/40 border border-white/10 text-white rounded-2xl px-5 py-4 pr-14 text-sm font-bold focus:outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/5 transition-all placeholder-slate-700 shadow-inner"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors">
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {mode === 'signup' && (
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirm Identity</label>
                                <input
                                    type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                                    placeholder="Re-enter password"
                                    className="w-full bg-black/40 border border-white/10 text-white rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/5 transition-all placeholder-slate-700 shadow-inner"
                                />
                            </div>
                        )}

                        <button
                            type="submit" disabled={isLoading}
                            className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-[1.5rem] transition-all duration-300 shadow-2xl shadow-red-600/30 flex items-center justify-center gap-3 disabled:opacity-50 text-sm uppercase tracking-widest group"
                        >
                            {isLoading ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Authorizing...</>
                            ) : (
                                <>{mode === 'login' ? 'Proceed to Dashboard' : 'Initialize Account'}</>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/5 text-center space-y-4">
                        <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">
                            Cinema Partner?{' '}
                            <Link to="/theatre/register" className="text-red-500 hover:text-red-400 font-black transition-colors">
                                Apply for Access →
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
