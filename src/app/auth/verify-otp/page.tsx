'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ShieldCheck, RotateCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/src/components/ui/Button';
import { useAuthStore } from '@/src/store/authStore';

function VerifyOTPContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';
    const { verifyResetOTP, resendResetOTP, isLoading, error } = useAuthStore();

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [canResend, setCanResend] = useState(false);
    const [countdown, setCountdown] = useState(60);

    // Countdown timer forresend
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [countdown]);

    // Handle OTP input
    const handleOTPChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // Only numbers

        const newOTP = [...otp];
        newOTP[index] = value.slice(-1); // Only last character
        setOtp(newOTP);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }

        // Auto-submit when all fields filled
        if (index === 5 && value) {
            const fullOTP = [...newOTP.slice(0, 5), value].join('');
            handleVerify(fullOTP);
        }
    };

    // Handle backspace
    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    // Handle paste
    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOTP = pastedData.split('');
        setOtp([...newOTP, ...Array(6 - newOTP.length).fill('')]);

        if (pastedData.length === 6) {
            handleVerify(pastedData);
        }
    };

    // Verify OTP
    const handleVerify = async (otpValue: string = otp.join('')) => {
        if (otpValue.length !== 6) {
            toast.error('Please enter all 6 digits');
            return;
        }

        try {
            await verifyResetOTP(email, otpValue);
            toast.success('OTP verified! Set your new password.');
            router.push(`/auth/reset-password?email=${encodeURIComponent(email)}&otp=${otpValue}`);
        } catch {
            toast.error(error || 'Invalid OTP. Please try again.');
            setOtp(['', '', '', '', '', '']);
            document.getElementById('otp-0')?.focus();
        }
    };

    // Resend OTP
    const handleResend = async () => {
        try {
            await resendResetOTP(email);
            toast.success('New OTP sent to your email!');
            setCanResend(false);
            setCountdown(60);
        } catch {
            toast.error('Failed to resend OTP. Please try again.');
        }
    };

    if (!email) {
        // Redirect if no email (handled in component mount better but this works for render)
        return null;
    }

    return (
        <div className="w-full max-w-md">
            {/* Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#10B981]/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#F59E0B]/10 rounded-full blur-3xl" />

                <div className="relative">
                    {/* Back Button */}
                    <Link
                        href="/auth/forgot-password"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
                    >
                        <ArrowLeft size={18} />
                        <span className="text-sm font-medium">Back</span>
                    </Link>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck size={28} className="text-[#10B981]" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Verify OTP
                        </h1>
                        <p className="text-gray-500">
                            We've sent a 6-digit code to
                        </p>
                        <p className="text-[#10B981] font-semibold mt-1">{email}</p>
                    </div>

                    {/* OTP Input */}
                    <div className="mb-8">
                        <div className="flex gap-2 justify-center mb-6">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`otp-${index}`}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOTPChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={index === 0 ? handlePaste : undefined}
                                    className="w-12 h-14 text-center text-black text-2xl font-bold border-2 border-gray-200 rounded-xl outline-none focus:border-[#10B981] transition-colors"
                                    autoFocus={index === 0}
                                />
                            ))}
                        </div>

                        {/* Resend OTP */}
                        <div className="text-center">
                            {canResend ? (
                                <button
                                    onClick={handleResend}
                                    disabled={isLoading}
                                    className="inline-flex items-center gap-2 text-[#10B981] font-semibold hover:underline disabled:opacity-50"
                                >
                                    <RotateCw size={16} />
                                    Resend OTP
                                </button>
                            ) : (
                                <p className="text-gray-500 text-sm">
                                    Resend OTP in <span className="font-bold text-[#10B981]">{countdown}s</span>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Verify Button */}
                    <Button
                        onClick={() => handleVerify()}
                        fullWidth
                        size="lg"
                        isLoading={isLoading}
                    >
                        Verify & Continue
                    </Button>

                    {/* Info Box */}
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
                        <p className="text-sm text-yellow-800">
                            <strong>⏰ Note:</strong> This OTP will expire in 10 minutes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function VerifyOTPPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981]" />
            </div>
        }>
            <VerifyOTPContent />
        </Suspense>
    );
}
