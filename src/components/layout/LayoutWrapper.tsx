"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import Footer from "./Footer";

interface LayoutWrapperProps {
    children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
    const pathname = usePathname();
    const isAdminPage = pathname?.startsWith("/suraj-yuvraj-zimpy-admin");
    const isAuthPage = pathname?.startsWith("/auth");

    // Don't show navbar/footer on auth pages or admin pages
    // Note: BottomNav has its own logic, but hiding the wrapper's navbar/footer here is cleaner for those routes.
    const hiddenRoutes = ["/auth/login", "/auth/signup", "/suraj-yuvraj-zimpy-admin", "/user/search"];
    const shouldHide = hiddenRoutes.some((route) => pathname?.startsWith(route));

    if (isAdminPage) {
        return <div className="min-h-screen flex flex-col">{children}</div>;
    }

    return (
        <>
            {!shouldHide && <Navbar />}
            <main className="flex-grow">{children}</main>
            {!shouldHide && <Footer />}
            <BottomNav />
        </>
    );
}
