'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/src/components/ui/Button';
import axios from 'axios';
import api, { authAPI } from '@/src/lib/api'
import { toast, ToastContainer } from 'react-toastify';
import { handleSuccess, handleError } from '@/src/lib/Error';

export default function AdminLoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await authAPI.login({
                email: formData.email,
                password: formData.password
            });

            if (response && response.success && response.data.accessToken) {
                const token = response.data.accessToken;
                localStorage.setItem('accessToken', token);
                localStorage.setItem('adminToken', token);
                handleSuccess('Login successful!');
                router.push('/suraj-yuvraj-zimpy-admin/dashboard');
            } else {
                handleError(response.message || 'Login failed! Please try again.');
            }
        } catch (err: any) {
            console.error('Admin Login error:', err);
            const errorMessage = typeof err.response?.data === 'string' ? err.response.data : (err.response?.data?.message || 'Invalid email or password');
            setError(errorMessage);
            handleError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    {/* Header */}
                    <div className="px-8 pt-8 pb-6 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#10B981]/10 rounded-2xl mb-4 border border-[#10B981]/20">
                            <span className="text-[#10B981] font-bold text-3xl">Z</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
                        <p className="text-gray-500 text-sm mt-1">Please sign in to manage Zimpy</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#10B981] transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="admin@zimpy.com"
                                    className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-black outline-none focus:border-[#10B981] focus:bg-white focus:ring-4 focus:ring-[#10B981]/10 transition-all text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#10B981] transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full h-12 pl-12 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-black outline-none focus:border-[#10B981] focus:bg-white focus:ring-4 focus:ring-[#10B981]/10 transition-all text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#10B981] focus:ring-[#10B981]" />
                                <span className="text-xs text-gray-500 font-medium group-hover:text-gray-700 transition-colors">Remember for 30 days</span>
                            </label>
                            <button type="button" className="text-xs font-bold text-[#10B981] hover:underline">Forgot password?</button>
                        </div>

                        <Button
                            disabled={isLoading}
                            className="w-full h-12 zimpy-btn-primary flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Sign In to Dashboard</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </Button>

                        <div className="pt-4 flex items-center justify-center gap-2 text-[10px] text-gray-400 font-medium border-t border-gray-100">
                            <ShieldCheck size={14} className="text-[#10B981]" />
                            Authorized access only. All actions are logged.
                        </div>
                    </form>
                </div>

                <p className="text-center text-gray-400 text-xs mt-8">
                    &copy; 2026 Zimpy Grocery. Built by Suraj & Yuvraj.
                </p>
            </motion.div>
            <ToastContainer />
        </div>
    );
}
