'use client';

import React from 'react';
import { AddressForm } from '@/src/components/account/AddressForm';

export default function NewAddressPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Add New Address</h1>
                    <p className="text-sm text-gray-500">Enter your delivery details below</p>
                </div>
            </div>

            <AddressForm />
        </div>
    );
}
