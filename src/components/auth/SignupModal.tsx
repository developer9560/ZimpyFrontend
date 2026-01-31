'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Phone, User, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Checkbox } from '@/src/components/ui/Input';
import { useAuthStore } from '@/src/store/authStore';
import { ROUTES } from '@/src/lib/constants';
import { getPasswordStrength, cn } from '@/src/lib/utils';
import { Modal } from '@/src/components/ui/Modal';

// Validation Schema
const signupSchema = z
    .object({
        fullName: z.string().min(3, 'Name must be at least 3 characters'),
        email: z.string().email('Please enter a valid email'),
        phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid phone number').optional().or(z.literal('')),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string(),
        terms: z.boolean().refine((val) => val === true, {
            message: 'You must accept the terms and conditions',
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

type SignupFormData = z.infer<typeof signupSchema>;

export const SignupModal = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const router = useRouter();
    const { signup, isLoading, error, isSignupOpen, closeSignup, openLogin } = useAuthStore();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            terms: false,
        },
    });

    const password = watch('password', '');
    const passwordStrength = getPasswordStrength(password);

    const onSubmit = async (data: SignupFormData) => {
        try {
            await signup({
                fullName: data.fullName,
                email: data.email,
                phone: data.phone,
                password: data.password,
            });
            toast.success('Account created successfully! Please login.');
            closeSignup();
            openLogin();
        } catch {
            // Error handled by store, displayed below
        }
    };

    const handleLoginClick = () => {
        closeSignup();
        openLogin();
    };

    return (
        <Modal
            isOpen={isSignupOpen}
            onClose={closeSignup}
            title="Create Account 🎉"
            description="Join Zimpy for fresh groceries delivered fast"
            size="md"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                {/* Full Name */}
                <Input
                    {...register('fullName')}
                    type="text"
                    label="Full Name"
                    placeholder="Enter your full name"
                    leftIcon={<User size={18} />}
                    error={errors.fullName?.message}
                    autoComplete="name"
                />

                {/* Email */}
                <Input
                    {...register('email')}
                    type="email"
                    label="Email Address"
                    placeholder="Enter your email"
                    leftIcon={<Mail size={18} />}
                    error={errors.email?.message}
                    autoComplete="email"
                />

                {/* Phone */}
                <Input
                    {...register('phone')}
                    type="tel"
                    label="Phone Number (Optional)"
                    placeholder="Enter your phone number"
                    leftIcon={<Phone size={18} />}
                    error={errors.phone?.message}
                    autoComplete="tel"
                />

                {/* Password */}
                <div className="space-y-2">
                    <div className="relative">
                        <Input
                            {...register('password')}
                            type={showPassword ? 'text' : 'password'}
                            label="Password"
                            placeholder="Create a password"
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

                    {/* Password Strength Indicator */}
                    {/* {password && (
                        <div className="space-y-1">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5, 6].map((level) => (
                                    <div
                                        key={level}
                                        className={cn(
                                            'h-1.5 flex-1 rounded-full transition-colors',
                                            level <= passwordStrength.score
                                                ? `bg-[${passwordStrength.color}]`
                                                : 'bg-gray-200'
                                        )}
                                        style={{
                                            backgroundColor:
                                                level <= passwordStrength.score
                                                    ? passwordStrength.color
                                                    : undefined,
                                        }}
                                    />
                                ))}
                            </div>
                            <p
                                className="text-xs font-medium"
                                style={{ color: passwordStrength.color }}
                            >
                                {passwordStrength.label} password
                            </p>
                        </div>
                    )} */}
                </div>

                {/* Confirm Password */}
                <div className="relative">
                    <Input
                        {...register('confirmPassword')}
                        type={showConfirmPassword ? 'text' : 'password'}
                        label="Confirm Password"
                        placeholder="Confirm your password"
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

                {/* Terms Checkbox */}
                <div className="pt-1">
                    <Checkbox
                        {...register('terms')}
                        id="terms"
                        label={
                            <>
                                I agree to the{' '}
                                <Link
                                    href="/terms"
                                    onClick={closeSignup}
                                    className="text-[#10B981] hover:underline"
                                >
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link
                                    href="/privacy"
                                    onClick={closeSignup}
                                    className="text-[#10B981] hover:underline"
                                >
                                    Privacy Policy
                                </Link>
                            </>
                        }
                    />
                    {errors.terms && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.terms.message}
                        </p>
                    )}
                </div>

                {error && (
                    <div className="p-3 bg-red-50 text-red-500 text-sm rounded-lg">
                        {error}
                    </div>
                )}

                {/* Submit Button */}
                <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    isLoading={isLoading}
                    className="mt-4"
                >
                    Create Account
                </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
                Already have an account?{' '}
                <button
                    onClick={handleLoginClick}
                    className="text-[#10B981] font-semibold hover:underline"
                >
                    Sign in
                </button>
            </div>
        </Modal>
    );
};
