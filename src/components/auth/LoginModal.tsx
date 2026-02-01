'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Checkbox } from '@/src/components/ui/Input';
import { useAuthStore } from '@/src/store/authStore';
import { ROUTES } from '@/src/lib/constants';
import { cn } from '@/src/lib/utils';
import { Modal } from '@/src/components/ui/Modal';

// Validation Schema
const loginSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginModal = () => {
    const [showPassword, setShowPassword] = useState(false);
    // const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
    const router = useRouter();
    const { login, isLoading, error, isLoginOpen, closeLogin, openSignup } = useAuthStore();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            const response = await login({
                email: data.email,
                password: data.password,
            });

            toast.success('Login successful!');
            closeLogin();

        } catch {
            // Error is handled by store but showing toast for feedback too if store error isn't enough
            // toast.error(error || 'Login failed. Please try again.'); 
        }
    };

    const handleSignupClick = () => {
        closeLogin();
        openSignup();
    };

    return (
        <Modal
            isOpen={isLoginOpen}
            onClose={closeLogin}
            title="Welcome Back!"
            description="Sign in to continue shopping"
            size="md"
        >
            <div className="space-y-6">
                {/* Login Method Toggle */}
                {/* <div className="flex p-1 bg-gray-100 rounded-xl">
                    <button
                        type="button"
                        onClick={() => setLoginMethod('email')}
                        className={cn(
                            'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all',
                            loginMethod === 'email'
                                ? 'bg-white shadow-sm text-gray-900'
                                : 'text-gray-500 hover:text-gray-700'
                        )}
                    >
                        Email
                    </button> */}
                {/* <button
                        type="button"
                        onClick={() => setLoginMethod('phone')}
                        className={cn(
                            'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all',
                            loginMethod === 'phone'
                                ? 'bg-white shadow-sm text-gray-900'
                                : 'text-gray-500 hover:text-gray-700'
                        )}
                    >
                        Phone
                    </button> */}
                {/* </div> * */}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Email/Phone Input */}

                    <Input
                        {...register('email')}
                        type="email"
                        label="Email Address"
                        placeholder="Enter your email"
                        leftIcon={<Mail size={18} />}
                        error={errors.email?.message}
                        autoComplete="email"
                    />


                    {/* Password Input */}
                    <div className="relative">
                        <Input
                            {...register('password')}
                            type={showPassword ? 'text' : 'password'}
                            label="Password"
                            placeholder="Enter your password"
                            leftIcon={<Lock size={18} />}
                            error={errors.password?.message}
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        {/* Empty div for alignment if remember me is removed, or put remember me back if desired, 
                            but keeping it minimal based on previous requests */}
                        <div></div>
                        <Link
                            href="/auth/forgot-password"
                            onClick={closeLogin}
                            className="text-sm text-[#10B981] hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-500 text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        isLoading={isLoading}
                    >
                        Sign In
                    </Button>
                </form>

                {/* Divider */}
                {/* <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center">
                        <span className="px-4 text-xs text-gray-500 bg-white">
                            or continue with
                        </span>
                    </div>
                </div> */}

                {/* Social Login */}
                {/* <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        className="flex items-center justify-center gap-2 h-10 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        <span className="text-sm font-medium text-gray-600">Google</span>
                    </button>
                    <button
                        type="button"
                        className="flex items-center justify-center gap-2 h-10 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                        <Phone size={20} className="text-[#10B981]" />
                        <span className="text-sm font-medium text-gray-600">OTP</span>
                    </button>
                </div> */}

                <div className="mt-6 text-center text-sm text-gray-500">
                    Don&apos;t have an account?{' '}
                    <button
                        onClick={handleSignupClick}
                        className="text-[#10B981] font-semibold hover:underline"
                    >
                        Sign up
                    </button>
                </div>
            </div>
        </Modal>
    );
};
