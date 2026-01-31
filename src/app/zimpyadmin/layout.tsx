'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    MapPin,
    Calendar,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    Plane,
    BarChart3,
    Package,
    CreditCard,
    FileText,
    ChevronLeft,
    ChevronRight,
    Home,
    MapPin as DestinationIcon
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
        full_name: 'Admin User',
        email: 'admin@wandertrips.com',
        role: 'admin'
    });
    const router = useRouter();
    const pathname = usePathname();

    const navigation = [
        { name: 'Dashboard', href: '/Admin/dashboard', icon: LayoutDashboard },
        { name: 'Destination', href: '/Admin/destinations', icon: DestinationIcon },
        { name: 'Trips', href: '/Admin/trips', icon: MapPin },
        { name: 'Enquiries', href: '/Admin/enquiry', icon: FileText },
        { name: 'Bookings', href: '/Admin/booking', icon: Calendar },
        { name: 'Festival Banners', href: '/Admin/festivals', icon: Calendar },
        { name: 'Mobile Festival', href: '/Admin/festival_mobile', icon: Plane },
        { name: 'Users', href: '/Admin/users', icon: Users },
        // { name: 'Payments', href: '/Admin/payments', icon: CreditCard },
        // { name: 'Analytics', href: '/Admin/analytics', icon: BarChart3 },
        // { name: 'Content', href: '/Admin/content', icon: Package },
        // { name: 'Settings', href: '/Admin/settings', icon: Settings },
    ];

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        router.push('/Admin/login');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (pathname === '/Admin/login') {
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
                            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                                <div className="flex items-center">
                                    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-2 rounded-lg">
                                        <Plane className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="ml-3 text-xl font-bold text-gray-900">WanderTrips</span>
                                </div>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2 rounded-md hover:bg-gray-100"
                                >
                                    <X className="w-5 h-5" />
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
                                                    ? 'bg-indigo-600 text-white shadow-lg'
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
                className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 bg-white shadow-xl border-r border-gray-200 z-40"
            >
                {/* Logo Section */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                    <motion.div
                        animate={{ opacity: sidebarCollapsed ? 0 : 1 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center"
                    >
                        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-2 rounded-lg">
                            <Plane className="w-6 h-6 text-white" />
                        </div>
                        {!sidebarCollapsed && (
                            <span className="ml-3 text-xl font-bold text-gray-900">Zimpy</span>
                        )}
                    </motion.div>

                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        {sidebarCollapsed ? (
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        ) : (
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        )}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group relative ${isActive
                                    ? 'bg-indigo-600 text-white shadow-lg'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${sidebarCollapsed ? '' : 'mr-3'}`} />

                                {!sidebarCollapsed && <span>{item.name}</span>}

                                {/* Tooltip for collapsed state */}
                                {sidebarCollapsed && (
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                        {item.name}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile Section */}
                <div className="border-t border-gray-200 p-4">
                    <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''}`}>
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                                {adminUser?.full_name?.charAt(0) || 'A'}
                            </span>
                        </div>

                        {!sidebarCollapsed && (
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-gray-900">{adminUser?.full_name || 'Admin'}</p>
                                <p className="text-xs text-gray-500">{adminUser?.email}</p>
                            </div>
                        )}

                        <button
                            onClick={handleLogout}
                            className={`p-2 text-gray-400 hover:text-red-500 transition-colors ${sidebarCollapsed ? 'ml-0' : 'ml-2'
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
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <button
                                    onClick={() => setMobileMenuOpen(true)}
                                    className="lg:hidden p-2 rounded-md hover:bg-gray-100"
                                >
                                    <Menu className="w-6 h-6" />
                                </button>

                                <div className="flex items-center ml-4 lg:ml-0">
                                    <Home className="w-5 h-5 text-gray-400 mr-2" />
                                    <nav className="flex" aria-label="Breadcrumb">
                                        <ol className="flex items-center space-x-2">
                                            <li>
                                                <span className="text-gray-500 text-sm">Admin</span>
                                            </li>
                                            <li>
                                                <span className="text-gray-400">/</span>
                                            </li>
                                            <li>
                                                <span className="text-gray-900 font-medium text-sm">
                                                    {navigation.find(item => item.href === pathname)?.name || 'Dashboard'}
                                                </span>
                                            </li>
                                        </ol>
                                    </nav>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                {/* Search */}
                                <div className="hidden md:block relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                {/* Notifications */}
                                <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                                        <span className="text-xs text-white font-bold">3</span>
                                    </span>
                                </button>

                                {/* Profile Dropdown */}
                                <div className="flex items-center space-x-3">
                                    <div className="hidden md:block text-right">
                                        <p className="text-sm font-medium text-gray-900">{adminUser?.full_name}</p>
                                        <p className="text-xs text-gray-500 capitalize">{adminUser?.role}</p>
                                    </div>
                                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-medium">
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
                        initial={{ opacity: 0, y: 20 }}
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
