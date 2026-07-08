'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  Users,
  FileText,
  AlignLeft,
  Network,
  BarChart3,
  Zap,
  LogOut,
  Menu,
  X,
  User,
  Settings,
  CreditCard,
  Smartphone,
  BookOpen,
  MessageCircle,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/content', label: 'Content', icon: FileText },
  { href: '/activities', label: 'Activities', icon: AlignLeft },
  { href: '/team', label: 'Team', icon: Network },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/automations', label: 'Automations', icon: Zap },
];

interface NavBarProps {
  userName: string;
  userEmail: string;
  company?: string;
}

export default function NavBar({ userName, userEmail, company = 'ezyloan.co.in' }: NavBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav className="bg-[#faf9fb] border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <div className="relative flex items-center justify-center h-16">
          {/* Logo — far left */}
          <Link href="/clients" className="absolute left-0 flex items-center gap-2">
            <span className="w-9 h-9 rounded-2xl bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-400 flex items-center justify-center shadow-md">
              <span className="text-white text-xl font-bold italic font-serif leading-none">e</span>
            </span>
          </Link>

          {/* Centered nav */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative flex items-center gap-1.5 py-5 text-[15px] font-medium transition-colors ${
                    active ? 'text-teal-600' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Icon size={17} className={active ? 'text-teal-600' : 'text-gray-400'} />
                  {label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-teal-500" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Profile — far right */}
          <div className="absolute right-0 flex items-center gap-2">
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 ring-2 ring-white shadow flex items-center justify-center text-white text-xs font-bold overflow-hidden"
                aria-label="Account menu"
              >
                {initials}
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                  <div className="flex flex-col items-center px-4 py-3 border-b border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-sm font-bold mb-2">
                      {initials}
                    </div>
                    <p className="text-sm font-semibold text-gray-900 capitalize">{userName}</p>
                    <p className="text-xs text-gray-500 truncate max-w-full">{company}</p>
                  </div>
                  <div className="py-1">
                    {[
                      { label: 'Profile', icon: User },
                      { label: 'Settings', icon: Settings },
                      { label: 'Subscription', icon: CreditCard },
                      { label: 'Mobile App', icon: Smartphone },
                      { label: 'User Guide', icon: BookOpen },
                      { label: 'Live Chat Support', icon: MessageCircle },
                    ].map(({ label, icon: Icon }) => (
                      <button
                        key={label}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
                      >
                        <Icon size={15} className="text-gray-400" />
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition font-medium"
                    >
                      <LogOut size={15} />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-1.5 text-gray-500 hover:text-gray-800"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium ${
                  active ? 'text-teal-600 bg-teal-50' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
