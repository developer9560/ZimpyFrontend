'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { useAuthStore } from '@/src/store/authStore';
import { userAPI } from '@/src/lib/api';
import { UserProfile, Address } from '@/src/types';
import { Edit2, MapPin } from 'lucide-react';
import Link from 'next/link';

const profileSchema = z.object({
    fullName: z.string().min(3, 'Name must be at least 3 characters'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid phone number').or(z.literal('')),
    gender: z.enum(['male', 'female', 'other']).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const { user, fetchProfile } = useAuthStore();
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Fetch Profile
                const res = await userAPI.getProfile();
                if (res.success) { // Assuming response structure
                    setUserData(res.data);
                    setValue('fullName', res.data.fullName || '');
                    setValue('phone', res.data.phone || '');
                    // Gender might not be in UserProfile DTO shown by user, skipping if missing
                }

                // Fetch Default Address
                const addresses = await userAPI.getAddresses();
                const def = addresses.find(a => a.isDefault);
                if (def) setDefaultAddress(def);
                else if (addresses.length > 0) setDefaultAddress(addresses[0]); // Fallback to first

            } catch (error) {
                console.error('Failed to fetch user data:', error);
            }
        };
        fetchUserData();
    }, [setValue]);

    const onSubmit = async (data: ProfileFormData) => {
        try {
            await userAPI.updateProfile(data);
            await fetchProfile(); // Refresh store
            setIsEditing(false); // Disable edit mode
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error('Failed to update profile.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Personal Information</h1>
                        <p className="text-sm text-gray-500">Manage your personal details</p>
                    </div>
                    {!isEditing && (
                        <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2">
                            <Edit2 size={16} />
                            Edit
                        </Button>
                    )}
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        {/* Full Name */}
                        <div className="space-y-1">
                            <Input
                                {...register('fullName')}
                                label="Full Name"
                                error={errors.fullName?.message}
                                disabled={!isEditing || isSubmitting}
                                className={!isEditing ? "bg-gray-50 border-gray-100" : ""}
                            />
                        </div>

                        {/* Email - Read Only */}
                        <div className="space-y-1">
                            <Input
                                label="Email Address"
                                value={userData?.email || user?.email || ''}
                                disabled
                                className="bg-gray-50 text-gray-500 cursor-not-allowed"
                                hint="Email address cannot be changed"
                            />
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-1">
                            <Input
                                {...register('phone')}
                                label="Phone Number"
                                type="tel"
                                error={errors.phone?.message}
                                disabled={!isEditing || isSubmitting}
                                className={!isEditing ? "bg-gray-50 border-gray-100" : ""}
                            />
                        </div>
                    </div>

                    {isEditing && (
                        <div className="pt-4 flex gap-3">
                            <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="lg"
                                isLoading={isSubmitting}
                            >
                                Save Changes
                            </Button>
                        </div>
                    )}
                </form>
            </div>

            {/* Default Address Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Default Address</h2>
                    <Link href="/user/account/addresses" className="text-sm text-[#10B981] font-medium hover:underline">
                        Manage Addresses
                    </Link>
                </div>

                {defaultAddress ? (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex gap-3 items-start">
                        <MapPin className="text-gray-400 mt-1 shrink-0" size={20} />
                        <div className="text-sm text-gray-600">
                            <p className="font-medium text-gray-900">{defaultAddress.fullName || userData?.fullName || 'My Address'}</p>
                            <p>{defaultAddress.addressLine1}</p>
                            {defaultAddress.addressLine2 && <p>{defaultAddress.addressLine2}</p>}
                            <p>{defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode}</p>
                            <p className="mt-1 font-medium">{defaultAddress.phone}</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 italic">No default address set.</p>
                )}
            </div>
        </div>
    );
}
