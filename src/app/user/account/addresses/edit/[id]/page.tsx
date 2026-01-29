'use client';

import React, { useEffect, useState } from 'react';
import { AddressForm } from '@/src/components/account/AddressForm';
import { userAPI } from '@/src/lib/api';
import { Address } from '@/src/types';
import { useParams } from 'next/navigation';

export default function EditAddressPage() {
    const params = useParams();
    const [address, setAddress] = useState<Address | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAddress = async () => {
            try {
                // In a real app we might fetch single address API, but listing all is safer fallback
                // userAPI.getAddress(params.id) // If exists
                const addresses = await userAPI.getAddresses();
                const found = addresses.find(a => a.id === params.id);
                if (found) setAddress(found);
            } catch (error) {
                console.error("Failed to load address", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) {
            fetchAddress();
        }
    }, [params.id]);

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Edit Address</h1>
                    <p className="text-sm text-gray-500">Update your delivery details</p>
                </div>
            </div>

            {address ? <AddressForm existingAddress={address} /> : <div>Address not found</div>}
        </div>
    );
}
