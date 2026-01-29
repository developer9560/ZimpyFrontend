'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    Package,
    ShoppingCart,
    Tag,
    Image as ImageIcon,
    ChevronLeft,
    ChevronRight,
    Home,
} from 'lucide-react';
import Link from 'next/link';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [isAuthenticated] = useState(true); // Set to true for development
    const [isLoading] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [adminUser] = useState({
        full_name: 'Suraj Admin',
        email: 'suraj@zimpy.com',
        role: 'Super Admin'
    });
    const router = useRouter();
    const pathname = usePathname();

    const BASE_PATH = '/suraj-yuvraj-zimpy-admin';

    const navigation = [
        { name: 'Dashboard', href: `${BASE_PATH}/dashboard`, icon: LayoutDashboard },
        { name: 'Products', href: `${BASE_PATH}/products`, icon: Package },
        { name: 'Categories', href: `${BASE_PATH}/categories`, icon: Tag },
        { name: 'Orders', href: `${BASE_PATH}/orders`, icon: ShoppingCart },
        { name: 'Banner Management', href: `${BASE_PATH}/banners`, icon: ImageIcon },
        { name: 'Users', href: `${BASE_PATH}/users`, icon: Users },
        { name: 'Settings', href: `${BASE_PATH}/settings`, icon: Settings },
    ];

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('rzp_checkout_anon_id');
        localStorage.removeItem('rzp_device_id');
        localStorage.removeItem('rzp_test_device_id');
        router.push(`${BASE_PATH}/adminlogin`);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981]"></div>
            </div>
        );
    }

    if (pathname === `${BASE_PATH}/adminlogin`) {
        return <>{children}</>;
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile sidebar overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 lg:hidden"
                    >
                        <div className="fixed inset-0 bg-gray-900/50" onClick={() => setMobileMenuOpen(false)} />
                        <motion.div
                            initial={{ x: -300 }}
                            animate={{ x: 0 }}
                            exit={{ x: -300 }}
                            className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-xl"
                        >
                            {/* Mobile Sidebar Content */}
                            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    <div className="bg-[#10B981] p-1.5 rounded-lg">
                                        <span className="text-white font-bold text-xl leading-none">Z</span>
                                    </div>
                                    <span className="text-xl font-bold text-gray-900">Zimpy Admin</span>
                                </div>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2 rounded-md hover:bg-gray-100"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <nav className="mt-8 px-4">
                                <div className="space-y-1">
                                    {navigation.map((item) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                                                    ? 'bg-[#10B981] text-white shadow-lg'
                                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                                    }`}
                                            >
                                                <item.icon className="w-5 h-5 mr-3" />
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </nav>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <motion.div
                animate={{ width: sidebarCollapsed ? 80 : 256 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 bg-white shadow-sm border-r border-gray-200 z-40"
            >
                {/* Logo Section */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
                    <motion.div
                        animate={{ opacity: sidebarCollapsed ? 0 : 1 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2"
                    >
                        <div className="bg-[#10B981] p-1.5 rounded-lg flex-shrink-0">
                            <span className="text-white font-bold text-xl leading-none">Z</span>
                        </div>
                        {!sidebarCollapsed && (
                            <span className="text-xl font-bold text-gray-900 whitespace-nowrap">Zimpy Admin</span>
                        )}
                    </motion.div>

                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        {sidebarCollapsed ? (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        ) : (
                            <ChevronLeft className="w-5 h-5 text-gray-400" />
                        )}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto no-scrollbar">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group relative ${isActive
                                    ? 'bg-[#10B981] text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-[#10B981]'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${sidebarCollapsed ? '' : 'mr-3'}`} />

                                {!sidebarCollapsed && <span>{item.name}</span>}

                                {/* Tooltip for collapsed state */}
                                {sidebarCollapsed && (
                                    <div className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                        {item.name}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile Section */}
                <div className="border-t border-gray-100 p-4">
                    <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''}`}>
                        <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-[#10B981] font-bold border border-gray-200">
                            {adminUser?.full_name?.charAt(0) || 'A'}
                        </div>

                        {!sidebarCollapsed && (
                            <div className="ml-3 flex-1 overflow-hidden">
                                <p className="text-xs font-bold text-gray-900 truncate">{adminUser?.full_name || 'Admin'}</p>
                                <p className="text-[10px] text-gray-500 truncate">{adminUser?.email}</p>
                            </div>
                        )}

                        <button
                            onClick={handleLogout}
                            className={`p-2 text-gray-400 hover:text-red-500 transition-colors ${sidebarCollapsed ? 'ml-0' : 'ml-1'
                                }`}
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className={`flex-1 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'} transition-all duration-300`}>
                {/* Top Navigation Bar */}
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <button
                                    onClick={() => setMobileMenuOpen(true)}
                                    className="lg:hidden p-2 rounded-md hover:bg-gray-100"
                                >
                                    <Menu className="w-6 h-6 text-gray-600" />
                                </button>

                                <div className="flex items-center ml-4 lg:ml-0">
                                    <Home className="w-4 h-4 text-gray-400 mr-2" />
                                    <nav className="flex" aria-label="Breadcrumb">
                                        <ol className="flex items-center space-x-2">
                                            <li>
                                                <span className="text-gray-400 text-xs">Admin</span>
                                            </li>
                                            <li>
                                                <span className="text-gray-300 text-xs">/</span>
                                            </li>
                                            <li>
                                                <span className="text-[#10B981] font-bold text-xs uppercase tracking-wider">
                                                    {navigation.find(item => item.href === pathname)?.name || 'Dashboard'}
                                                </span>
                                            </li>
                                        </ol>
                                    </nav>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                {/* Search */}
                                <div className="hidden sm:block relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Quick search..."
                                        className="pl-9 pr-4 py-2 w-48 lg:w-64 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-[#10B981] focus:bg-white transition-all outline-none"
                                    />
                                </div>

                                {/* Notifications */}
                                <button className="relative p-2 text-gray-400 hover:text-[#10B981] transition-colors rounded-lg hover:bg-gray-50">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                                </button>

                                {/* Profile Dropdown */}
                                <div className="flex items-center space-x-3 pl-2 border-l border-gray-100">
                                    <div className="hidden md:block text-right">
                                        <p className="text-[10px] uppercase font-bold text-gray-400 leading-none mb-1">{adminUser?.role}</p>
                                        <p className="text-xs font-bold text-gray-900 leading-none">{adminUser?.full_name}</p>
                                    </div>
                                    <div className="w-8 h-8 bg-[#10B981]/10 rounded-lg flex items-center justify-center border border-[#10B981]/20">
                                        <span className="text-[#10B981] text-sm font-bold">
                                            {adminUser?.full_name?.charAt(0) || 'A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
}

