import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login | Zimpy",
};

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex-1 flex items-center justify-center bg-gray-50 p-4">
            {children}
        </div>
    );
}
