'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { useAuthStore } from '@/src/store/authStore';

// Validation Schema
const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const router = useRouter();
    const { requestPasswordReset, isLoading, error } = useAuthStore();
    const [isOTPSent, setIsOTPSent] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        try {
            const response = await requestPasswordReset(data.email);

            setIsOTPSent(true);
            toast.success('OTP sent to your email!');
            router.push(`/auth/verify-otp?email=${encodeURIComponent(data.email)}`);

        } catch {
            toast.error(error || 'Failed to send OTP. Please try again.');
        }
    };

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
                        href="/auth/login"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
                    >
                        <ArrowLeft size={18} />
                        <span className="text-sm font-medium">Back to Login</span>
                    </Link>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Send size={28} className="text-[#10B981]" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Forgot Password?
                        </h1>
                        <p className="text-gray-500">
                            No worries! Enter your email and we'll send you an OTP to reset your password.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Email Input */}
                        <Input
                            {...register('email')}
                            type="email"
                            label="Email Address"
                            placeholder="Enter your registered email"
                            leftIcon={<Mail size={18} />}
                            error={errors.email?.message}
                            autoComplete="email"
                            autoFocus
                        />

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            isLoading={isLoading}
                        >
                            Send OTP
                        </Button>
                    </form>

                    {/* Info Box */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                        <p className="text-sm text-blue-800">
                            <strong>💡 Tip:</strong> Check your spam folder if you don't receive the OTP within 2 minutes.
                        </p>
                    </div>

                    {/* Sign Up Link */}
                    <p className="mt-8 text-center text-gray-500">
                        Don't have an account?{' '}
                        <button
                            onClick={() => router.push('/auth/signup')}
                            className="text-[#10B981] font-semibold hover:underline"
                        >
                            Sign up
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
