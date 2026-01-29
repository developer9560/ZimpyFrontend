'use client';

import { Toaster } from 'react-hot-toast';

export const ToastProvider: React.FC = () => {
    return (
        <Toaster
            position="top-right"
            gutter={12}
            containerStyle={{
                top: 80,
            }}
            toastOptions={{
                // Default options
                duration: 4000,
                style: {
                    background: '#fff',
                    color: '#111827',
                    padding: '16px',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                    fontSize: '14px',
                    maxWidth: '400px',
                },
                // Success toast
                success: {
                    iconTheme: {
                        primary: '#10B981',
                        secondary: '#fff',
                    },
                    style: {
                        borderLeft: '4px solid #10B981',
                    },
                },
                // Error toast
                error: {
                    iconTheme: {
                        primary: '#EF4444',
                        secondary: '#fff',
                    },
                    style: {
                        borderLeft: '4px solid #EF4444',
                    },
                },
                // Loading toast
                loading: {
                    iconTheme: {
                        primary: '#3B82F6',
                        secondary: '#fff',
                    },
                },
            }}
        />
    );
};

// Toast utility functions (can be used directly)
export { toast } from 'react-hot-toast';

export default ToastProvider;
