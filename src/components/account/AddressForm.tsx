'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { check, z } from 'zod';
import { toast } from 'react-hot-toast';
import { Button } from '@/src/components/ui/Button';
import { Input, Select, Textarea } from '@/src/components/ui/Input';
import { userAPI } from '@/src/lib/api';
import { Address } from '@/src/types';
import { useRouter } from 'next/navigation';

// Indian States List
const STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
    "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
    "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry"
];

const addressSchema = z.object({
    contactNumber: z.string().regex(/^[6-9]\d{9}$/, 'Valid phone number required'),
    postalCode: z.string().regex(/^\d{6}$/, 'Valid 6-digit pincode required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    addressLine1: z.string().min(5, 'Address is required (House No, Building, Street)'),
    addressLine2: z.string().optional(),
    type: z.enum(['home', 'office', 'other']),
    isDefault: z.boolean().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface AddressFormProps {
    existingAddress?: Address | null;
}

export const AddressForm = ({ existingAddress }: AddressFormProps) => {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<AddressFormData>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            type: 'home',
            isDefault: false,
        },
    });

    useEffect(() => {
        if (existingAddress) {
            setValue('contactNumber', existingAddress.contactNumber);
            setValue('postalCode', existingAddress.postalCode);
            setValue('city', existingAddress.city);
            setValue('state', existingAddress.state);
            setValue('addressLine1', existingAddress.addressLine1);
            setValue('addressLine2', existingAddress.addressLine2);
            setValue('type', existingAddress.type);
            setValue('isDefault', existingAddress.isDefault);
        }
    }, [existingAddress, setValue]);

    const onSubmit = async (data: AddressFormData) => {
        try {
            const payload = {
                ...data,
                country: 'India' as const,
                isDefault: data.isDefault || false
            };

            if (existingAddress) {
                await userAPI.updateAddress(existingAddress.id, payload);
                toast.success('Address updated successfully');
            } else {
                await userAPI.addAddress(payload);
                toast.success('Address added successfully');
            }
            router.back();
        } catch (error) {
            toast.error('Failed to save address');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-4 mb-4">
                {existingAddress ? 'Edit Address' : 'Add New Address'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    {...register('contactNumber')}
                    label="Phone Number"
                    placeholder="10-digit mobile number"
                    type="tel"
                    error={errors.contactNumber?.message}
                />
                <Select
                    {...register('state')}
                    label="State"
                    error={errors.state?.message}
                    options={STATES.map(s => ({ value: s, label: s }))}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    {...register('postalCode')}
                    label="Pincode"
                    placeholder="6-digit Pincode"
                    error={errors.postalCode?.message}
                />
                <Input
                    {...register('city')}
                    label="City/District"
                    placeholder="City"
                    error={errors.city?.message}
                />
            </div>

            <div className="space-y-4">
                <Input
                    {...register('addressLine1')}
                    label="Address Line 1"
                    placeholder="Flat/House No., Building, Street"
                    error={errors.addressLine1?.message}
                />
                <Input
                    {...register('addressLine2')}
                    label="Address Line 2"
                    placeholder="Flat/House No., Building, Street"
                    error={errors.addressLine2?.message}
                />
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">Type of Address</label>
                <div className="flex gap-4">
                    {['home', 'office', 'other'].map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer border rounded-lg px-4 py-2 hover:bg-gray-50 has-[:checked]:border-[#10B981] has-[:checked]:bg-[#10B981]/5 transition-colors">
                            <input
                                type="radio"
                                value={type}
                                {...register('type')}
                                className="text-[#10B981] focus:ring-[#10B981]"
                            />
                            <span className="text-sm font-medium text-gray-700 capitalize">{type}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
                {existingAddress?.isDefault ? (
                    <input
                        type="checkbox"
                        id="isDefault"
                        {...register('isDefault')}
                        className="w-4 h-4 text-[#10B981] border-gray-300 rounded focus:ring-[#10B981]"
                    />
                ) : (
                    <input
                        type="checkbox"
                        id="isDefault"
                        {...register('isDefault')}
                        className="w-4 h-4 text-[#10B981] border-gray-300 rounded focus:ring-[#10B981]"
                    />
                )}
                <label htmlFor="isDefault" className="text-sm text-gray-700 cursor-pointer select-none">
                    Make this my default address
                </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                    Save Address
                </Button>
            </div>
        </form>
    );
};
