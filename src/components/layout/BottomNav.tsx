'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Tag, ShoppingCart, User, Blocks, CirclePlus } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useCartStore } from '@/src/store/cartStore';
import { ROUTES } from '@/src/lib/constants';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Blocks, label: 'Categories', href: '/user/category' },
  { icon: CirclePlus, label: 'Add', href: '/user/add' },
  { icon: ShoppingCart, label: 'Cart', href: '/user/cart' },
  { icon: User, label: 'Account', href: '/user/account' },
];

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { itemCount } = useCartStore();

  // Don't show on certain pages
  const hiddenRoutes = ['/auth/login', '/auth/signup', '/admin'];
  if (hiddenRoutes.some((route) => pathname?.startsWith(route))) {
    return null;
  }

  return (
    <>
      {/* Spacer */}
      <div className="h-20 sm:hidden" />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive =
              item.href === '/user'
                ? pathname === '/user' || pathname === '/'
                : pathname?.startsWith(item.href);
            const isCart = item.label === 'Cart';

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 py-2 relative transition-colors',
                  isActive
                    ? 'text-[#10B981]'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <div className="relative">
                  <item.icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {/* Cart Badge */}
                  {isCart && itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#10B981] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    'text-[10px] mt-1 font-medium',
                    isActive && 'font-semibold'
                  )}
                >
                  {item.label}
                </span>
                {/* Active Indicator */}
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#10B981] rounded-b-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Safe Area for iOS */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </>
  );
};

export default BottomNav;
