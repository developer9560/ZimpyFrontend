'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { useAuthStore } from '@/src/store/authStore';
import { getPasswordStrength, cn } from '@/src/lib/utils';
import { ROUTES } from '@/src/lib/constants';

// Validation Schema
const resetPasswordSchema = z
    .object({
        password: z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';
    const otp = searchParams.get('otp') || '';

    const { resetPassword, isLoading, error, openLogin } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const password = watch('password', '');
    const passwordStrength = getPasswordStrength(password);

    const onSubmit = async (data: ResetPasswordFormData) => {
        try {
            await resetPassword(email, otp, data.password);
            toast.success('Password reset successfully! Please login.');
            router.push('/');
            setTimeout(() => openLogin(), 300); // Open login modal after redirect
        } catch {
            toast.error(error || 'Failed to reset password. Please try again.');
        }
    };

    if (!email || !otp) {
        // router.push('/auth/forgot-password');
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
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock size={28} className="text-[#10B981]" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            New Password 🔒
                        </h1>
                        <p className="text-gray-500">
                            Create a strong password for your account
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Password */}
                        <div className="space-y-2">
                            <div className="relative">
                                <Input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    label="New Password"
                                    placeholder="Enter new password"
                                    leftIcon={<Lock size={18} />}
                                    error={errors.password?.message}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                        </div>

                        {/* Confirm Password */}
                        <div className="relative">
                            <Input
                                {...register('confirmPassword')}
                                type={showConfirmPassword ? 'text' : 'password'}
                                label="Confirm New Password"
                                placeholder="Confirm new password"
                                leftIcon={<Lock size={18} />}
                                error={errors.confirmPassword?.message}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            isLoading={isLoading}
                            className="mt-6"
                        >
                            Reset Password
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981]" />
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}
