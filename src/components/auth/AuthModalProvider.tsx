'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/src/store/authStore';
import { LoginModal } from './LoginModal';
import { SignupModal } from './SignupModal';

export const AuthModalProvider = () => {
    // Prevent hydration mismatch
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <>
            <LoginModal />
            <SignupModal />
        </>
    );
};
