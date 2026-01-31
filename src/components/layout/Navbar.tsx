'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  User,
  MapPin,
  Menu,
  X,
  Heart,
  Bell,
  ChevronDown,
  LogOut,
  Package,
  Settings,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useCartStore } from '@/src/store/cartStore';
import { useAuthStore } from '@/src/store/authStore';
import { ROUTES, CATEGORIES } from '@/src/lib/constants';
import { Button } from '@/src/components/ui/Button';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  const { itemCount } = useCartStore();
  const { user, isAuthenticated, logout, openLogin } = useAuthStore();

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  }, [pathname]);

  const handleSearchClick = () => {
    router.push('/user/search');
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('zimpy-auth');
    localStorage.removeItem('rzp_checkout_anon_id');
    localStorage.removeItem('rzp_device_id');

    router.push(ROUTES.HOME);
  };

  const userNamme = user?.fullName?.split(' ')[0];
  useEffect(() => {

  }, []);

  return (

    <header
      className={cn(
        'top-0 sticky z-50 transition-all duration-300 navbar-shadow',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-white'
      )}
    >
      {/* Top Bar - Desktop Only */}
      <div className="hidden lg:block bg-[#10B981] text-white py-1.5">
        <div className="container flex items-center justify-between text-xs">
          <p>🎉 Free delivery on orders above ₹499!</p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:underline">
              About Us
            </Link>
            <Link href="/contact" className="hover:underline">
              Help & Support
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="container">
        <div className="flex items-center justify-between h-16 lg:h-20 gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 flex-shrink-0"
          >
            <div className="w-10 h-10 bg-[#10B981] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">Z</span>
            </div>
            <span className=" sm:block text-2xl font-bold text-[#111827]">
              Zimpy
            </span>
          </Link>

          {/* Location Selector - Desktop */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
            <MapPin size={20} className="text-[#10B981]" />
            <div className="text-left">
              <p className="text-xs text-gray-500">Deliver to</p>
              <p className="text-sm font-medium text-gray-900">
                Delhi 110001
              </p>
            </div>
            {/* <ChevronDown size={16} className="text-gray-400" /> */}
          </div>

          {/* Search Bar - Desktop */}
          <div
            onClick={handleSearchClick}
            className='hidden md:flex items-center flex-1 max-w-xl mx-6 px-4 h-11 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-all duration-200'
          >
            <div className='w-10 h-10 flex items-center justify-center'>
              <Search size={20} className="text-[#10B981] flex-shrink-0 ml-2" />
            </div>
            <input
              type="text"
              readOnly
              placeholder="Search for fresh groceries..."
              className="w-full h-full ml-3 bg-transparent border-none outline-none text-gray-700 placeholder:text-gray-400 cursor-pointer"
              suppressHydrationWarning
            />
          </div>


          {/* Right Actions */}
          <div className="flex items-center gap-6">

            {/* Wishlist - Desktop */}
            <Link
              href={ROUTES.WISHLIST}
              className="lg:flex p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative"
            >
              <Heart size={22} />
            </Link>

            {/* Cart */}
            <Link
              href={ROUTES.CART}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative"
            >
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#10B981] text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* Profile / Login */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="hidden sm:flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                >
                  <div className="w-8 h-8 bg-[#10B981]/10 rounded-full flex items-center justify-center">
                    <User size={18} className="text-[#10B981]" />
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
                    {user?.fullName?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown size={16} className="hidden lg:block text-gray-400" />
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsProfileOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-scaleIn">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-medium text-gray-900">
                          {user?.fullName || 'User'}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <Link
                        href={ROUTES.ACCOUNT}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <User size={18} className="text-gray-400" />
                        <span className="text-sm text-gray-700">
                          My Profile
                        </span>
                      </Link>
                      <Link
                        href={ROUTES.MY_ORDERS}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <Package size={18} className="text-gray-400" />
                        <span className="text-sm text-gray-700">
                          My Orders
                        </span>
                      </Link>
                      <Link
                        href={ROUTES.WISHLIST}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <Heart size={18} className="text-gray-400" />
                        <span className="text-sm text-gray-700">
                          Wishlist
                        </span>
                      </Link>
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 w-full hover:bg-gray-50 transition-colors text-red-600"
                        >
                          <LogOut size={18} />
                          <span className="text-sm">Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Button
                  onClick={openLogin}
                  variant="outline"
                  size="md"
                  className="zimpy-btn-outline btn-visible px-5"
                >
                  Login
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Category Bar - Mobile Search */}
        <div
          onClick={handleSearchClick}
          className='md:hidden mt-2 flex items-center flex-1 w-full mx-auto px-4 h-11 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-all duration-200'
        >
          <div className='w-10 h-10 flex items-center justify-center'>
            <Search size={20} className="text-[#10B981] flex-shrink-0 ml-2" />
          </div>
          <input
            type="text"
            readOnly
            placeholder="Search for fresh groceries..."
            className="w-full h-full ml-3 bg-transparent border-none outline-none text-gray-700 placeholder:text-gray-400 cursor-pointer text-sm"
          />
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
