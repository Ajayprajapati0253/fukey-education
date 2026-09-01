import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Check, Monitor } from 'lucide-react';
import { useUIStore } from '../../store/ui.store';
import type { ThemeMode } from '../../store/ui.store';

export interface ThemeSwitcherProps {
  /** Display variant: 'button' for one-click toggle, 'dropdown' for menu with choices */
  variant?: 'button' | 'dropdown' | 'segmented';
  /** Extra CSS classes */
  className?: string;
  /** Whether to show text label beside the icon */
  showLabel?: boolean;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  variant = 'button',
  className = '',
  showLabel = false,
}) => {
  const { theme, setTheme, toggleTheme } = useUIStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (variant !== 'dropdown') return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [variant]);

  // Segmented Pill Variant
  if (variant === 'segmented') {
    return (
      <div
        id="theme-switcher-segmented"
        className={`inline-flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}
      >
        <button
          type="button"
          id="theme-btn-light"
          onClick={() => setTheme('light')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
            theme === 'light'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          }`}
          aria-label="Set light mode"
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span>Light</span>
        </button>
        <button
          type="button"
          id="theme-btn-dark"
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
            theme === 'dark'
              ? 'bg-[#1E293B] text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          }`}
          aria-label="Set dark mode"
        >
          <Moon className="w-3.5 h-3.5 text-blue-400" />
          <span>Dark</span>
        </button>
      </div>
    );
  }

  // Dropdown Variant
  if (variant === 'dropdown') {
    return (
      <div className={`relative inline-block ${className}`} ref={menuRef} id="theme-switcher-dropdown">
        <button
          type="button"
          id="theme-switcher-dropdown-trigger"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-[#686E7D] dark:text-[#94A3B8] hover:text-[#12141C] dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 group"
          aria-label="Theme options"
          aria-expanded={isOpen}
        >
          {theme === 'dark' ? (
            <Moon className="w-5 h-5 text-blue-400 fill-blue-400/20 transition-transform duration-200 group-hover:scale-110" />
          ) : (
            <Sun className="w-5 h-5 text-amber-500 fill-amber-500/20 transition-transform duration-200 group-hover:rotate-45 group-hover:scale-110" />
          )}
          {showLabel && (
            <span className="text-xs font-medium capitalize text-gray-700 dark:text-gray-200">
              {theme} Mode
            </span>
          )}
        </button>

        {isOpen && (
          <div
            id="theme-switcher-menu"
            className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.18)] p-1.5 z-50 animate-in fade-in zoom-in-95"
          >
            <div className="px-3 py-1.5 text-[10px] font-bold text-[#9DA2AF] dark:text-[#64748B] uppercase tracking-wider">
              Color Theme
            </div>
            <button
              type="button"
              id="theme-select-light"
              onClick={() => {
                setTheme('light');
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                theme === 'light'
                  ? 'bg-[#EAF0FE] text-[#2451D9] font-bold'
                  : 'text-[#12141C] dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500 fill-amber-400/30" /> Light Mode
              </span>
              {theme === 'light' && <Check className="w-3.5 h-3.5 text-[#2451D9]" />}
            </button>
            <button
              type="button"
              id="theme-select-dark"
              onClick={() => {
                setTheme('dark');
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                theme === 'dark'
                  ? 'bg-[#2451D9]/20 text-[#60A5FA] font-bold'
                  : 'text-[#12141C] dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-blue-400 fill-blue-400/30" /> Dark Mode
              </span>
              {theme === 'dark' && <Check className="w-3.5 h-3.5 text-[#60A5FA]" />}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Default Button Toggle Variant
  return (
    <div className={`relative inline-flex items-center ${className}`} id="theme-switcher-wrapper">
      <button
        type="button"
        id="theme-toggle-btn"
        onClick={toggleTheme}
        className="relative p-2 text-[#686E7D] dark:text-[#94A3B8] hover:text-[#12141C] dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group flex items-center justify-center"
        title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        aria-label={`Toggle theme (currently ${theme} mode)`}
      >
        {theme === 'dark' ? (
          <Moon className="w-5 h-5 text-blue-400 fill-blue-400/20 transition-transform duration-200 group-hover:-rotate-12 group-hover:scale-110" />
        ) : (
          <Sun className="w-5 h-5 text-amber-500 fill-amber-400/20 transition-transform duration-200 group-hover:rotate-45 group-hover:scale-110" />
        )}
        {showLabel && (
          <span className="ml-2 text-xs font-semibold capitalize text-gray-700 dark:text-gray-200">
            {theme === 'dark' ? 'Dark' : 'Light'}
          </span>
        )}
      </button>
    </div>
  );
};
