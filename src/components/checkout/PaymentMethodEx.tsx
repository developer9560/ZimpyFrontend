'use client';

import React, { useState } from 'react';
import { CreditCard, Wallet, Banknote, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const PAYMENT_METHODS = [
    {
        id: 'razorpay',
        name: 'Online Payment',
        description: 'UPI, Cards, Netbanking',
        icon: <CreditCard size={20} />,
        available: true
    },
    {
        id: 'cod',
        name: 'Cash on Delivery',
        description: 'Pay on delivery via cash/UPI',
        icon: <Banknote size={20} />,
        available: true
    }
];

interface PaymentMethodProps {
    onSelect: (methodId: string) => void;
}

export const PaymentMethodEx: React.FC<PaymentMethodProps> = ({ onSelect }) => {
    const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS[0].id);

    const handleSelect = (id: string) => {
        setSelectedMethod(id);
        onSelect(id);
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck size={20} className="text-[#10B981]" />
                Payment Method
            </h3>

            <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => (
                    <div
                        key={method.id}
                        onClick={() => handleSelect(method.id)}
                        className={cn(
                            "flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer group",
                            selectedMethod === method.id
                                ? "border-[#10B981] bg-green-50/30"
                                : "border-gray-100 bg-white hover:border-gray-200"
                        )}
                    >
                        <div className={cn(
                            "p-3 rounded-xl transition-all",
                            selectedMethod === method.id
                                ? "bg-[#10B981] text-white"
                                : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                        )}>
                            {method.icon}
                        </div>

                        <div className="flex-1">
                            <p className="text-sm font-bold text-gray-900">{method.name}</p>
                            <p className="text-xs text-gray-500">{method.description}</p>
                        </div>

                        <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                            selectedMethod === method.id
                                ? "border-[#10B981] bg-[#10B981]"
                                : "border-gray-300 bg-white"
                        )}>
                            {selectedMethod === method.id && (
                                <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <p className="text-[10px] text-gray-400 mt-4 flex items-center gap-1.5 justify-center">
                <ShieldCheck size={12} />
                Your transaction is secured with industry-standard encryption
            </p>
        </div>
    );
};

export default PaymentMethodEx;
