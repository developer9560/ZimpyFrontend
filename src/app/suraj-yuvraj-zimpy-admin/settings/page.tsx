'use client';

import React from 'react';
import { Settings, Shield, Bell, Globe, Mail, Phone, Lock, Save, RefreshCcw } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';

export default function AdminSettingsPage() {
    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
                    <p className="text-sm text-gray-500 font-medium">Configure platform-wide settings and security.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="zimpy-btn-outline gap-2 h-11 px-4">
                        <RefreshCcw size={18} />
                        <span>Reset Defaults</span>
                    </Button>
                    <Button className="zimpy-btn-primary gap-2 h-11 px-6 shadow-xl shadow-[#10B981]/20">
                        <Save size={18} />
                        <span>Save Changes</span>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Navigation Sidebar (Settings Specific) */}
                <div className="space-y-4">
                    {[
                        { label: 'General Settings', icon: <Settings size={18} />, active: true },
                        { label: 'Security & Auth', icon: <Shield size={18} />, active: false },
                        { label: 'Notifications', icon: <Bell size={18} />, active: false },
                        { label: 'Support & Help', icon: <Phone size={18} />, active: false },
                    ].map((item) => (
                        <div key={item.label} className={`flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all border ${item.active ? 'bg-[#10B981] text-white border-[#10B981] shadow-lg shadow-[#10B981]/20' : 'bg-white text-gray-600 border-gray-100 hover:border-gray-200'
                            }`}>
                            {item.icon}
                            <span className="text-sm font-bold">{item.label}</span>
                        </div>
                    ))}
                </div>

                {/* Settings Form */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Store Configuration</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Store Name</label>
                                <input type="text" defaultValue="Zimpy" className="w-full h-11 px-4 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-[#10B981] transition-all text-sm font-medium" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Support Email</label>
                                <input type="email" defaultValue="support@zimpy.com" className="w-full h-11 px-4 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-[#10B981] transition-all text-sm font-medium" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Platform URL</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Globe size={16} /></div>
                                    <input type="text" defaultValue="https://zimpy.com" className="w-full h-11 pl-11 pr-4 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-[#10B981] transition-all text-sm font-medium" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Phone size={16} /></div>
                                    <input type="text" defaultValue="+91 9876543210" className="w-full h-11 pl-11 pr-4 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-[#10B981] transition-all text-sm font-medium" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5 pt-4">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Metadescription (SEO)</label>
                            <textarea className="w-full h-32 p-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#10B981] transition-all text-sm font-medium resize-none">Zimpy is India&apos;s fastest growing online grocery platform delivering fresh fruits, vegetables, and daily essentials within 30 minutes.</textarea>
                        </div>
                    </section>

                    <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                            <h3 className="text-lg font-bold text-gray-900">Danger Zone</h3>
                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">High Risk Actions</span>
                        </div>

                        <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-red-900">Maintenance Mode</p>
                                <p className="text-[10px] text-red-600 font-medium">Temporarily disable public access to your store</p>
                            </div>
                            <div className="w-12 h-6 bg-gray-200 rounded-full p-1 cursor-pointer">
                                <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
