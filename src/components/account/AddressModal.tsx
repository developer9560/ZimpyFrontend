'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Button } from '@/src/components/ui/Button';
import { Input, Select, Textarea } from '@/src/components/ui/Input';
import { Modal } from '@/src/components/ui/Modal';
import { userAPI } from '@/src/lib/api';
import { Address } from '@/src/types';

// Indian States List
const STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
    "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
    "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry"
];

const addressSchema = z.object({
    fullName: z.string().min(3, 'Name is required'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Valid phone number required'),
    pincode: z.string().regex(/^\d{6}$/, 'Valid 6-digit pincode required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    addressLine1: z.string().min(5, 'Address is required (House No, Building, Street)'),
    addressLine2: z.string().optional(),
    landmark: z.string().optional(),
    type: z.enum(['home', 'office', 'other']),
    isDefault: z.boolean().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface AddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editAddress?: Address | null;
}

export const AddressModal = ({ isOpen, onClose, onSuccess, editAddress }: AddressModalProps) => {
    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<AddressFormData>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            type: 'home',
            isDefault: false,
        },
    });

    useEffect(() => {
        if (isOpen) {
            if (editAddress) {
                // Populate form for edit
                setValue('fullName', editAddress.fullName);
                setValue('phone', editAddress.phone);
                setValue('pincode', editAddress.pincode);
                setValue('city', editAddress.city);
                setValue('state', editAddress.state);
                setValue('addressLine1', editAddress.addressLine1);
                setValue('addressLine2', editAddress.addressLine2);
                setValue('landmark', editAddress.landmark);
                setValue('type', editAddress.type);
                setValue('isDefault', editAddress.isDefault);
            } else {
                reset({ type: 'home', isDefault: false });
            }
        }
    }, [isOpen, editAddress, setValue, reset]);

    const onSubmit = async (data: AddressFormData) => {
        try {
            if (editAddress) {
                await userAPI.updateAddress(editAddress.id, data);
                toast.success('Address updated successfully');
            } else {
                await userAPI.addAddress(data);
                toast.success('Address added successfully');
            }
            onSuccess();
            onClose();
        } catch (error) {
            toast.error('Failed to save address');
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editAddress ? "Edit Address" : "Add New Address"}
            size="lg"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        {...register('fullName')}
                        label="Full Name"
                        placeholder="Enter full name"
                        error={errors.fullName?.message}
                    />
                    <Input
                        {...register('phone')}
                        label="Phone Number"
                        placeholder="10-digit mobile number"
                        type="tel"
                        error={errors.phone?.message}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        {...register('pincode')}
                        label="Pincode"
                        placeholder="6-digit Pincode"
                        error={errors.pincode?.message}
                    />
                    <Input
                        {...register('city')}
                        label="City/District"
                        placeholder="City"
                        error={errors.city?.message}
                    />
                </div>

                <div className="space-y-4">
                    <Textarea
                        {...register('addressLine1')}
                        label="Address (Area and Street)"
                        placeholder="Flat/House No., Building, Street"
                        error={errors.addressLine1?.message}
                    />
                    <Select
                        {...register('state')}
                        label="State"
                        error={errors.state?.message}
                        options={STATES.map(s => ({ value: s, label: s }))}
                    />
                    <Input
                        {...register('landmark')}
                        label="Landmark (Optional)"
                        placeholder="E.g. Near Apollo Hospital"
                        error={errors.landmark?.message}
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
                                <span className="text-sm font-medium capitalize">{type}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isSubmitting}>
                        Save Address
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
