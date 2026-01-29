'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { userAPI } from '@/src/lib/api';
import { Address } from '@/src/types';
import { Button } from '@/src/components/ui/Button';
import { ConfirmModal } from '@/src/components/ui/Modal';
import Link from 'next/link';

export default function AddressesPage() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchAddresses = async () => {
        try {
            const data = await userAPI.getAddresses();
            setAddresses(data);
        } catch (error) {
            // Silent fail
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleDelete = async () => {
        if (!deletingId) return;
        try {
            await userAPI.deleteAddress(deletingId);
            toast.success('Address deleted successfully');
            fetchAddresses();
        } catch {
            toast.error('Failed to delete address');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Manage Addresses</h1>
                    <p className="text-sm text-gray-500">Add, edit or remove your delivery addresses</p>
                </div>
                <Link href="/user/account/addresses/new">
                    <Button className="gap-2">
                        <Plus size={18} />
                        Add New Address
                    </Button>
                </Link>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-gray-500">Loading addresses...</div>
            ) : addresses.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No Addresses Found</h3>
                    <p className="text-gray-500 mb-6">Add a new to address to speed up checkout</p>
                    <Link href="/user/account/addresses/new">
                        <Button variant="outline">
                            Add Your First Address
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                        <div key={address.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all relative group">
                            <div className="flex justify-between items-start mb-3">
                                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600 uppercase tracking-wide">
                                    {address.type}
                                </span>
                                {address.isDefault && (
                                    <span className="px-2 py-0.5 rounded-full bg-[#10B981]/10 text-xs font-medium text-[#10B981]">
                                        Default
                                    </span>
                                )}
                                <div className="flex gap-2">
                                    <Link href={`/user/account/addresses/edit/${address.id}`}>
                                        <button
                                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => setDeletingId(address.id)}
                                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1 text-sm text-gray-600">
                                <p className="font-semibold text-gray-900 text-base">{'Address'}</p>
                                <p>{address.addressLine1}</p>
                                {address.addressLine2 && <p>{address.addressLine2}</p>}
                                <p>{address.city}, {address.state} - <span className="font-semibold text-gray-900">{address.postalCode}</span></p>
                                <p className="pt-2 font-medium text-gray-900">Phone: {address.contactNumber}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmModal
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={handleDelete}
                title="Delete Address"
                message="Are you sure you want to delete this address?"
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
}
