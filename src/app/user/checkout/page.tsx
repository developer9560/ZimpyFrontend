'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, ShoppingCart, Calendar, Clock, CreditCard } from 'lucide-react';
import { useCartStore } from '@/src/store/cartStore';
import { useAuthStore } from '@/src/store/authStore';
import { AddressSelector } from '@/src/components/checkout/AddressSelector';
import { PaymentMethodEx } from '@/src/components/checkout/PaymentMethodEx';
import { Button } from '@/src/components/ui/Button';
import { formatPrice } from '@/src/lib/utils';
import Image from 'next/image';
import { orderAPI, paymentAPI } from '@/src/lib/api';

import { toast } from 'react-hot-toast';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function CheckoutPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { items, total, subtotal, discount, deliveryCharges, clearCart } = useCartStore();
    const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('razorpay');

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthLoading && !isAuthenticated) {
            router.push('/auth/login?redirect=/user/checkout');
        }
    }, [isAuthenticated, isAuthLoading, router]);

    // Redirect if cart is empty
    useEffect(() => {
        if (!isAuthLoading && items.length === 0) {
            router.push('/user/cart');
        }
    }, [items, isAuthLoading, router]);

    const handleRazorpayPayment = async (orderData: any) => {
        const { orderId, totalAmount, razorpayOrderId } = orderData;

        const options = {
            key: "rzp_live_S9fDinBw9EX5IM",
            amount: totalAmount * 100, // paise
            currency: "INR",
            name: "Zimpy",
            description: "Grocery Order Payment",
            order_id: razorpayOrderId,
            handler: async (response: any) => {
                try {
                    const verifyRes = await paymentAPI.verify({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                    });

                    if (verifyRes.success) {
                        toast.success("Payment successful!");
                        router.push(`/user/order-success/${orderId}`);
                        clearCart();
                    } else {
                        toast.error("Payment verification failed. Please contact support.");
                        // Cancel the order since verification failed
                        try {
                            await orderAPI.cancelPayment(orderId.toString());
                        } catch (error) {
                            console.error("Failed to cancel order:", error);
                        }
                    }
                } catch (error) {
                    toast.error("An error occurred during verification.");
                    // Cancel the order on verification error
                    try {
                        await orderAPI.cancelPayment(orderId.toString());
                    } catch (err) {
                        console.error("Failed to cancel order:", err);
                    }
                } finally {
                    setIsPlacingOrder(false);
                }
            },
            modal: {
                ondismiss: async function () {
                    // User closed the modal without completing payment
                    toast.error("Payment cancelled");
                    try {
                        await orderAPI.cancelPayment(orderId.toString());
                    } catch (error) {
                        console.error("Failed to cancel order:", error);
                    }
                    setIsPlacingOrder(false);
                }
            },
            prefill: {
                name: user?.fullName || "",
                email: user?.email || "",
                contact: user?.phone || "",
            },
            theme: {
                color: "#10B981",
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', async function (response: any) {
            toast.error("Payment failed. Please try again.");
            console.error(response.error);
            // Cancel the order on payment failure
            try {
                await orderAPI.cancelPayment(orderId.toString());
            } catch (error) {
                console.error("Failed to cancel order:", error);
            }
            setIsPlacingOrder(false);
        });
        rzp.open();
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            toast.error("Please select a delivery address");
            return;
        }

        setIsPlacingOrder(true);
        try {
            const response = await orderAPI.checkout({
                addressId: selectedAddressId,
                paymentMethod: selectedPaymentMethod
            });

            if (response.success && response.status === 200) {
                if (selectedPaymentMethod === 'razorpay' && response.data.razorpayOrderId) {
                    await handleRazorpayPayment(response.data);
                    setIsPlacingOrder(false); // Modal opened, so we can stop loading state
                } else {
                    toast.success("Order placed successfully!");
                    router.push(`/user/order-success/${response.data.orderId}`);
                    clearCart();
                }
            } else {
                toast.error(response.message);
                setIsPlacingOrder(false);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to place order. Please try again.");
            setIsPlacingOrder(false);
        }
    };

    if (isAuthLoading || items.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24 md:pb-12 animate-fadeIn">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/user/cart" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-lg font-bold text-gray-900">Checkout</h1>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-xs font-medium text-gray-400">
                        <ShieldCheck size={16} className="text-[#10B981]" />
                        100% Secure Checkout
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column: Flow */}
                    <div className="flex-1 space-y-6">
                        {/* Address Selection */}
                        <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <AddressSelector onSelect={(id) => setSelectedAddressId(id)} />
                        </section>

                        {/* Delivery Time Slot (Mock) */}
                        <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                                <Calendar size={20} className="text-[#10B981]" />
                                Delivery Slot
                            </h3>
                            <div className="flex gap-4">
                                <div className="flex-1 p-4 rounded-xl border-2 border-[#10B981] bg-green-50/30">
                                    <p className="text-xs font-bold text-[#10B981] uppercase mb-1">Standard</p>
                                    <p className="text-sm font-bold text-gray-900">Today, 20 Jan</p>
                                    <p className="text-xs text-gray-500">6:00 PM - 8:00 PM</p>
                                </div>
                                <div className="flex-1 p-4 rounded-xl border-2 border-gray-100 bg-white opacity-50 cursor-not-allowed">
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Express</p>
                                    <p className="text-sm font-bold text-gray-400">Not Available</p>
                                    <p className="text-xs text-gray-300">Under 30 mins</p>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <PaymentMethodEx onSelect={(method) => setSelectedPaymentMethod(method)} />
                        </section>
                    </div>

                    {/* Right Column: Summary */}
                    <div className="w-full lg:w-[400px]">
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-[80px]">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h3>

                            {/* Items List (Compact) */}
                            <div className="space-y-4 mb-6 max-h-[200px] overflow-y-auto pr-2 no-scrollbar">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-3">
                                        <div className="relative w-12 h-12 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                                            <Image
                                                src={item.product.images?.[0]?.imageUrl || '/placeholder.png'}
                                                alt={item.product.name}
                                                fill
                                                className="object-contain p-1"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-gray-900 truncate">{item.product.name}</p>
                                            <p className="text-[10px] text-gray-500">{item.quantity} x {formatPrice(item.price)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-gray-900">{formatPrice(item.total)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 border-t border-gray-100 pt-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Items Total</span>
                                    <span className="font-medium text-gray-900">{formatPrice(subtotal + (discount > 0 ? discount : 0))}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Product Discount</span>
                                    <span className="font-medium text-green-600">-{formatPrice(discount)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Delivery Charges</span>
                                    <span className="font-medium text-gray-900">
                                        {deliveryCharges === 0 ? 'FREE' : formatPrice(deliveryCharges)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-base font-bold border-t border-dashed border-gray-200 pt-4 mt-2">
                                    <span className="text-gray-900">Total Payable</span>
                                    <span className="text-[#10B981]">{formatPrice(total)}</span>
                                </div>
                            </div>

                            <Button
                                onClick={handlePlaceOrder}
                                disabled={isPlacingOrder}
                                className="w-full h-12 zimpy-btn-primary mt-8 flex items-center justify-center gap-2"
                            >
                                {isPlacingOrder ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Placing Order...</span>
                                    </>
                                ) : (
                                    <>
                                        <CreditCard size={20} />
                                        <span>Place Order {formatPrice(total)}</span>
                                    </>
                                )}
                            </Button>

                            <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-100">
                                <p className="text-[10px] text-center text-green-700 font-medium">
                                    You will save {formatPrice(discount)} on this order
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
