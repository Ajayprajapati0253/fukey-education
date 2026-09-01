import React from 'react';
import { Headset, LogOut, X, Sun, Moon } from 'lucide-react';
import { SIDEBAR_GROUPS, type SidebarGroup, type SidebarItem } from './sidebar/sidebar.config';
import { isRouteActive } from './sidebar/sidebar.utils';
import { useUIStore } from '../../store/ui.store';
import fukeyLogo from '../../assets/images/fukey-logo.png';

interface AdminSidebarProps {
  onNavigate?: (route: string) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onNavigate }) => {
  const {
    isSidebarCollapsed,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    currentRoute,
    setCurrentRoute,
    theme,
    toggleTheme,
    setTheme,
  } = useUIStore();

  const handleItemClick = (e: React.MouseEvent, item: SidebarItem) => {
    e.preventDefault();
    setCurrentRoute(item.route);
    if (onNavigate) {
      onNavigate(item.route);
    }
    if (isMobileSidebarOpen) {
      setIsMobileSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full bg-white dark:bg-[#111827] border-r border-[#E6E8EE] dark:border-[#1F2937] flex flex-col flex-shrink-0 z-50 transition-all duration-300 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isSidebarCollapsed ? 'lg:w-[76px]' : 'lg:w-[260px] w-[270px]'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#E6E8EE] dark:border-[#1F2937] flex-shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
  <img
    src={fukeyLogo}
    alt="Fukey Education"
    className={`object-contain flex-shrink-0 transition-all duration-300 ${
  isSidebarCollapsed ? 'w-10 h-10' : 'w-[150px] h-12'
}`}
  />
</div>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 lg:hidden rounded-md"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto scrollbar-none py-4 px-3 flex flex-col gap-5">
          {SIDEBAR_GROUPS.map((group: SidebarGroup) => (
            <div key={group.id} className="space-y-1">
              {!isSidebarCollapsed ? (
                <p className="px-3 text-[11px] font-bold text-[#9DA2AF] dark:text-[#64748B] uppercase tracking-wider mb-1.5 select-none">
                  {group.label}
                </p>
              ) : (
                <div className="h-px bg-gray-100 dark:bg-gray-800 my-2 mx-2" />
              )}

              <ul className="space-y-0.5">
                {group.items.map((item: SidebarItem) => {
                  const isActive = isRouteActive(item.route, currentRoute);
                  const Icon = item.icon;

                  return (
                    <li key={item.id}>
                      <a
                        href={item.route}
                        onClick={(e) => handleItemClick(e, item)}
                        title={isSidebarCollapsed ? item.label : undefined}
                        className={`group relative flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors select-none ${
                          isActive
                            ? 'bg-[#EAF0FE] dark:bg-[#2451D9]/20 text-[#2451D9] dark:text-[#60A5FA] font-semibold'
                            : 'text-[#12141C] dark:text-gray-300 hover:bg-[#F6F7FA] dark:hover:bg-gray-800/60 hover:text-[#2451D9] dark:hover:text-[#60A5FA]'
                        } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                      >
                        <Icon
                          className={`w-4 h-4 flex-shrink-0 transition-colors ${
                            isActive
                              ? 'text-[#2451D9] dark:text-[#60A5FA]'
                              : 'text-[#686E7D] dark:text-gray-400 group-hover:text-[#2451D9] dark:group-hover:text-[#60A5FA]'
                          }`}
                        />

                        {!isSidebarCollapsed && (
                          <span className="truncate flex-1">{item.label}</span>
                        )}

                        {/* Red dot badge for pending items */}
                        {item.badge === 'dot' && (
                          <span
                            className={`w-2 h-2 rounded-full bg-[#DC5B3E] flex-shrink-0 ${
                              isSidebarCollapsed ? 'absolute top-1.5 right-1.5' : 'ml-auto'
                            }`}
                          />
                        )}

                        {typeof item.badge === 'number' && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 ${
                              isSidebarCollapsed ? 'absolute top-1 right-1' : 'ml-auto'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Fixed Actions */}
        <div className="p-3 border-t border-[#E6E8EE] dark:border-[#1F2937] flex flex-col gap-2 flex-shrink-0 bg-white dark:bg-[#111827]">
          {/* Theme Switcher Toggle */}
          {!isSidebarCollapsed ? (
            <div className="p-1 bg-[#F6F7FA] dark:bg-[#1F2937] rounded-xl border border-[#E6E8EE] dark:border-[#374151]/50 flex items-center justify-between gap-1">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  theme === 'light'
                    ? 'bg-white text-[#12141C] shadow-xs'
                    : 'text-[#686E7D] dark:text-gray-400 hover:text-[#12141C] dark:hover:text-white'
                }`}
                title="Light Mode"
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  theme === 'dark'
                    ? 'bg-[#111827] text-white shadow-xs'
                    : 'text-[#686E7D] dark:text-gray-400 hover:text-[#12141C] dark:hover:text-white'
                }`}
                title="Dark Mode"
              >
                <Moon className="w-3.5 h-3.5 text-blue-400" />
                <span>Dark</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={toggleTheme}
              className="w-full flex items-center justify-center p-2 text-[#686E7D] dark:text-gray-400 hover:text-[#12141C] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-blue-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
            </button>
          )}

          <button
            type="button"
            className={`flex items-center justify-center gap-2 w-full py-2.5 bg-[#2451D9] text-white rounded-xl font-semibold text-xs hover:bg-[#1E44B8] active:scale-[0.99] transition-all shadow-sm ${
              isSidebarCollapsed ? 'px-0' : 'px-4'
            }`}
            title="Help Center"
          >
            <Headset className="w-4 h-4 flex-shrink-0" />
            {!isSidebarCollapsed && <span>Help Center</span>}
          </button>

          <button
            type="button"
            className={`flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold text-[#686E7D] dark:text-gray-400 hover:text-[#DC5B3E] hover:bg-red-50/70 dark:hover:bg-red-950/20 rounded-xl transition-colors ${
              isSidebarCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Log Out"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!isSidebarCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
