import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Headset, LogOut, X, Sun, Moon, ChevronRight, ChevronDown } from 'lucide-react';
import { SIDEBAR_GROUPS, type SidebarGroup, type SidebarItem } from './sidebar/sidebar.config';
import { isRouteActive } from './sidebar/sidebar.utils';
import { useUIStore } from '../../store/ui.store';
import fukeyLogo from '../../assets/images/fukey-logo.png';

export const AdminSidebar: React.FC = () => {
  const {
    isSidebarCollapsed,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    sidebarWidth,
    setSidebarWidth,
    theme,
    toggleTheme,
    setTheme,
  } = useUIStore();

  const navigate = useNavigate();
  const location = useLocation();
  const currentRoute = location.pathname;

  const [isResizing, setIsResizing] = useState(false);
  const asideRef = useRef<HTMLElement>(null);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!asideRef.current) return;
      const rect = asideRef.current.getBoundingClientRect();
      const newWidth = e.clientX - rect.left;
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, setSidebarWidth]);

  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    SIDEBAR_GROUPS.forEach((group) => {
      group.items.forEach((item) => {
        if (item.children?.some((child) => isRouteActive(child.route, currentRoute))) {
          initial[item.id] = true;
        }
      });
    });
    return initial;
  });

  const toggleMenuExpand = (itemId: string) => {
    setExpandedMenus((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const closeMobileSidebar = () => {
    if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
  };

  const handleParentClick = (item: SidebarItem) => {
    const hasChildren = !!item.children?.length;

    if (hasChildren) {
      toggleMenuExpand(item.id);
      const alreadyActive = item.children!.some((c) => isRouteActive(c.route, currentRoute));
      if (!alreadyActive) {
        navigate(item.children![0].route);
        closeMobileSidebar();
      }
    } else {
      navigate(item.route);
      closeMobileSidebar();
    }
  };

  const renderTreeGroup = (items: SidebarItem[]) => (
    <div className="relative pl-4 space-y-1">
      <div
        className="absolute left-[21px] top-4 bottom-5 w-[1.5px] bg-[#dbe2ed] dark:bg-[#293244] pointer-events-none rounded-full"
        aria-hidden="true"
      />

      {items.map((item) => {
        const hasChildren = !!item.children?.length;
        const isExpanded = !!expandedMenus[item.id];
        const isParentActive = hasChildren
          ? item.children!.some((c) => isRouteActive(c.route, currentRoute))
          : isRouteActive(item.route, currentRoute);
        const Icon = item.icon;

        return (
          <div key={item.id} className="relative">
            <div
              className="absolute left-[5px] top-[19px] w-[14px] h-[1.5px] bg-[#dbe2ed] dark:bg-[#293244] pointer-events-none rounded-full"
              aria-hidden="true"
            />

            <button
              type="button"
              onClick={() => handleParentClick(item)}
              className={`w-full flex items-center justify-between pl-6 pr-3 py-2 rounded-xl text-[13.5px] transition-all text-left group cursor-pointer ${
                isParentActive
                  ? 'bg-[#eff3ff] dark:bg-brand/20 text-[#4f46e5] dark:text-[#818CF8] font-semibold shadow-2xs'
                  : 'text-ink dark:text-gray-300 hover:bg-app-bg dark:hover:bg-gray-800/60 hover:text-[#4f46e5] dark:hover:text-[#818CF8] font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  strokeWidth={1.8}
                  className={`w-[17px] h-[17px] shrink-0 transition-colors ${
                    isParentActive
                      ? 'text-[#4f46e5] dark:text-[#818CF8]'
                      : 'text-ink-soft dark:text-gray-400 group-hover:text-[#4f46e5] dark:group-hover:text-[#818CF8]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {item.badge === 'dot' && <span className="w-2 h-2 rounded-full bg-[#DC5B3E]" />}
                {typeof item.badge === 'number' && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                    {item.badge}
                  </span>
                )}

                {hasChildren ? (
                  isExpanded ? (
                    <ChevronDown
                      strokeWidth={2}
                      className={`w-3.5 h-3.5 ${isParentActive ? 'text-[#4f46e5] dark:text-[#818CF8]' : 'text-[#8592a6]'}`}
                    />
                  ) : (
                    <ChevronRight
                      strokeWidth={2}
                      className={`w-3.5 h-3.5 ${isParentActive ? 'text-[#4f46e5] dark:text-[#818CF8]' : 'text-[#8592a6]'}`}
                    />
                  )
                ) : (
                  <ChevronRight
                    strokeWidth={2}
                    className="w-3.5 h-3.5 text-[#8592a6] opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                )}
              </div>
            </button>

            {hasChildren && isExpanded && (
              <div className="relative pl-6 mt-1 space-y-1">
                <div
                  className="absolute left-[34px] top-1 bottom-3.5 w-[1.5px] bg-[#dbe2ed] dark:bg-[#293244] pointer-events-none rounded-full"
                  aria-hidden="true"
                />

                {item.children!.map((child) => {
                  const isChildActive = isRouteActive(child.route, currentRoute);

                  return (
                    <div key={child.id} className="relative">
                      <div
                        className="absolute left-[10px] top-1/2 -translate-y-1/2 w-[15px] h-[1.5px] bg-[#dbe2ed] dark:bg-[#293244] pointer-events-none rounded-full"
                        aria-hidden="true"
                      />

                      <Link
                        to={child.route}
                        onClick={closeMobileSidebar}
                        className={`w-full flex items-center justify-between pl-8 pr-3 py-1.5 rounded-lg text-[12.5px] transition-all text-left cursor-pointer ${
                          isChildActive
                            ? 'bg-[#eff3ff] dark:bg-brand/20 text-[#4f46e5] dark:text-[#818CF8] font-semibold'
                            : 'text-[#64748b] dark:text-gray-400 hover:text-ink dark:hover:text-white hover:bg-app-bg dark:hover:bg-gray-800/60 font-medium'
                        }`}
                      >
                        <span className="truncate">{child.label}</span>
                        {isChildActive && (
                          <span className="w-2 h-2 rounded-full bg-[#4f46e5] dark:bg-[#818CF8] shrink-0 ml-2" />
                        )}
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderFlatGroup = (items: SidebarItem[]) => (
    <ul className="space-y-0.5">
      {items.map((item) => {
        const isActive = isRouteActive(item.route, currentRoute);
        const Icon = item.icon;

        return (
          <li key={item.id}>
            <Link
              to={item.route}
              onClick={closeMobileSidebar}
              title={isSidebarCollapsed ? item.label : undefined}
              className={`group relative flex items-center gap-3 px-3 py-2 rounded-xl text-[13.5px] font-medium transition-colors select-none ${
                isActive
                  ? 'bg-[#eff3ff] dark:bg-brand/20 text-[#4f46e5] dark:text-[#818CF8] font-semibold'
                  : 'text-ink dark:text-gray-300 hover:bg-app-bg dark:hover:bg-gray-800/60 hover:text-[#4f46e5] dark:hover:text-[#818CF8]'
              } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive
                    ? 'text-[#4f46e5] dark:text-[#818CF8]'
                    : 'text-ink-soft dark:text-gray-400 group-hover:text-[#4f46e5] dark:group-hover:text-[#818CF8]'
                }`}
              />

              {!isSidebarCollapsed && <span className="truncate flex-1">{item.label}</span>}

              {item.badge === 'dot' && (
                <span
                  className={`w-2 h-2 rounded-full bg-[#DC5B3E] shrink-0 ${
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
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <aside
        ref={asideRef}
        style={!isSidebarCollapsed ? { width: `${sidebarWidth}px` } : undefined}
        className={`fixed lg:static top-0 left-0 h-full bg-white dark:bg-[#111827] border-r border-border-subtle dark:border-[#1F2937] flex flex-col shrink-0 z-50 ${
          isResizing ? '' : 'transition-all duration-300'
        } ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${
          isSidebarCollapsed ? 'lg:w-[76px]' : 'w-[270px]'
        }`}
      >
        <div className="h-16 flex items-center justify-center px-5 border-b border-border-subtle dark:border-[#1F2937] shrink-0 relative">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={fukeyLogo}
              alt="Fukey Education"
              className={`object-contain shrink-0 rounded-xl border border-border-subtle dark:border-[#334155] p-1 transition-all duration-300 ${
                isSidebarCollapsed ? 'w-10 h-10' : 'w-[150px] h-12'
              }`}
            />
          </div>

          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="absolute right-5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 lg:hidden rounded-md"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-none py-4 px-3 flex flex-col gap-5 select-none">
          {SIDEBAR_GROUPS.map((group: SidebarGroup) => (
            <div key={group.id} className="space-y-1">
              {!isSidebarCollapsed ? (
                <p className="px-3 text-[11px] font-bold text-ink-mute dark:text-[#64748B] uppercase tracking-wider mb-1.5 select-none">
                  {group.label}
                </p>
              ) : (
                <div className="h-px bg-gray-100 dark:bg-gray-800 my-2 mx-2" />
              )}

              {isSidebarCollapsed ? renderFlatGroup(group.items) : renderTreeGroup(group.items)}
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-border-subtle dark:border-[#1F2937] flex flex-col gap-2 shrink-0 bg-white dark:bg-[#111827]">
          {!isSidebarCollapsed ? (
            <div className="p-1 bg-app-bg dark:bg-[#1F2937] rounded-xl border border-border-subtle dark:border-[#374151]/50 flex items-center justify-between gap-1">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  theme === 'light'
                    ? 'bg-white text-ink shadow-xs'
                    : 'text-ink-soft dark:text-gray-400 hover:text-ink dark:hover:text-white'
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
                    : 'text-ink-soft dark:text-gray-400 hover:text-ink dark:hover:text-white'
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
              className="w-full flex items-center justify-center p-2 text-ink-soft dark:text-gray-400 hover:text-ink dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
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
            className={`flex items-center justify-center gap-2 w-full py-2.5 bg-[#4f46e5] text-white rounded-xl font-semibold text-xs hover:bg-[#4338CA] active:scale-[0.99] transition-all shadow-sm ${
              isSidebarCollapsed ? 'px-0' : 'px-4'
            }`}
            title="Help Center"
          >
            <Headset className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>Help Center</span>}
          </button>

          <button
            type="button"
            className={`flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold text-ink-soft dark:text-gray-400 hover:text-danger hover:bg-red-50/70 dark:hover:bg-red-950/20 rounded-xl transition-colors ${
              isSidebarCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Log Out"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>Log Out</span>}
          </button>
        </div>

        {/* Drag-to-resize handle — only active when sidebar isn't collapsed, desktop only */}
        {!isSidebarCollapsed && (
          <div
            onMouseDown={handleResizeStart}
            className={`hidden lg:block absolute top-0 right-0 h-full w-1.5 cursor-col-resize group z-10 ${
              isResizing ? 'bg-[#4f46e5]/40' : 'hover:bg-[#4f46e5]/20'
            }`}
          >
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1 h-10 bg-gray-300 dark:bg-gray-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </aside>
    </>
  );
};

export default AdminSidebar;