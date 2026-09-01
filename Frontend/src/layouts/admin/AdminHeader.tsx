import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Globe,
  IndianRupee,
  Bell,
  HelpCircle,
  Settings,
  ChevronDown,
  User,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { useUIStore } from '../../store/ui.store';
import { Dropdown } from '../../components/ui/Dropdown';
import { ThemeSwitcher } from '../../components/ui/ThemeSwitcher';

export const AdminHeader: React.FC = () => {
  const {
    toggleSidebar,
    setIsMobileSidebarOpen,
    searchQuery,
    setSearchQuery,
    language,
    setLanguage,
    currency,
    setCurrency,
  } = useUIStore();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const languageOptions = [
    { value: 'EN', label: 'EN', icon: <Globe className="w-3.5 h-3.5 text-gray-400" /> },
    { value: 'HI', label: 'HI', icon: <Globe className="w-3.5 h-3.5 text-gray-400" /> },
  ];

  const currencyOptions = [
    { value: 'INR', label: 'INR', icon: <IndianRupee className="w-3.5 h-3.5 text-gray-400" /> },
    { value: 'USD', label: 'USD', icon: <span className="text-xs font-bold text-gray-400">$</span> },
  ];

  return (
    <header className="h-16 bg-white dark:bg-[#111827] border-b border-[#E6E8EE] dark:border-[#1F2937] flex items-center justify-between px-4 sm:px-6 flex-shrink-0 z-30 sticky top-0 transition-colors duration-200">
      {/* Left side: Hamburger & Search */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 text-[#686E7D] dark:text-[#94A3B8] hover:text-[#12141C] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg lg:hidden transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop sidebar collapse trigger */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="hidden lg:flex p-2 text-[#686E7D] dark:text-[#94A3B8] hover:text-[#12141C] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Toggle sidebar collapse"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses, orders, students, instructors..."
            className="w-full pl-9 pr-12 py-2 bg-[#F6F7FA] dark:bg-[#1F2937] border border-[#E6E8EE] dark:border-[#374151] rounded-xl text-xs font-medium text-[#12141C] dark:text-gray-100 placeholder:text-[#9DA2AF] dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2451D9]/20 focus:border-[#2451D9] transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 border border-gray-300/80 dark:border-gray-600 rounded-md text-[10px] text-gray-400 font-semibold bg-white dark:bg-gray-800 select-none hidden sm:block">
            ⌘K
          </div>
        </div>
      </div>

      {/* Right side: Language, Currency, Actions, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language dropdown */}
        <div className="hidden sm:block">
          <Dropdown
            options={languageOptions}
            value={language}
            onChange={setLanguage}
            variant="outline"
          />
        </div>

        {/* Currency dropdown */}
        <div className="hidden sm:block">
          <Dropdown
            options={currencyOptions}
            value={currency}
            onChange={setCurrency}
            variant="outline"
          />
        </div>

        <div className="h-5 w-px bg-[#E6E8EE] dark:bg-[#334155] mx-1 hidden sm:block" />

        {/* Theme Switcher Component (Placed directly to the left of the notification bell) */}
        <ThemeSwitcher variant="button" />

        {/* Notification Bell */}
        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 text-[#686E7D] dark:text-[#94A3B8] hover:text-[#12141C] dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-[#DC5B3E] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-[#111827] leading-none">
              12
            </span>
          </button>

          {/* Quick Notification Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.18)] py-3 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 pb-2 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#12141C] dark:text-white">Notifications</h4>
                <span className="text-[10px] font-semibold text-[#2451D9] dark:text-[#60A5FA] bg-[#EAF0FE] dark:bg-[#2451D9]/20 px-2 py-0.5 rounded-full">
                  12 unread
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                <div className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-xs transition-colors cursor-pointer">
                  <p className="font-semibold text-gray-900 dark:text-white">New order #ORD-00093</p>
                  <p className="text-gray-500 dark:text-gray-400 text-[11px]">Rahul Sharma enrolled in Maths 9th</p>
                  <span className="text-[10px] text-gray-400">5 min ago</span>
                </div>
                <div className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-xs transition-colors cursor-pointer">
                  <p className="font-semibold text-gray-900 dark:text-white">Course Submitted for Review</p>
                  <p className="text-gray-500 dark:text-gray-400 text-[11px]">Physics 12th by Khabib Nurmagomedov</p>
                  <span className="text-[10px] text-gray-400">22 min ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Help Icon */}
        <button
          type="button"
          className="p-2 text-[#686E7D] dark:text-[#94A3B8] hover:text-[#12141C] dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors hidden sm:flex"
          aria-label="Help"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Settings Icon */}
        <button
          type="button"
          className="p-2 text-[#686E7D] dark:text-[#94A3B8] hover:text-[#12141C] dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors hidden sm:flex"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Admin Profile */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2.5 pl-1.5 pr-2 py-1 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-[#E6E8EE] dark:hover:border-[#334155]"
          >
            <div className="w-8 h-8 rounded-full bg-[#EAF0FE] dark:bg-[#2451D9]/20 text-[#2451D9] dark:text-[#60A5FA] flex items-center justify-center font-bold text-xs shadow-xs">
              FE
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-[#12141C] dark:text-white leading-tight">Admin</p>
              <p className="text-[10px] font-medium text-[#686E7D] dark:text-[#94A3B8] leading-tight flex items-center gap-1">
                <span>Super Admin</span>
                <ChevronDown className="w-2.5 h-2.5 text-gray-400" />
              </p>
            </div>
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.18)] py-1.5 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3.5 py-2 border-b border-gray-100 dark:border-gray-700 md:hidden">
                <p className="text-xs font-bold text-gray-900 dark:text-white">Admin</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Super Admin</p>
              </div>
              <button
                type="button"
                className="w-full text-left px-3.5 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-2"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <User className="w-3.5 h-3.5 text-gray-400" /> My Profile
              </button>
              <button
                type="button"
                className="w-full text-left px-3.5 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-2"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-gray-400" /> Security
              </button>
              <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />
              <button
                type="button"
                className="w-full text-left px-3.5 py-2 text-xs text-[#DC5B3E] hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 font-medium"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <LogOut className="w-3.5 h-3.5 text-[#DC5B3E]" /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
