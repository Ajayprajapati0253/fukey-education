import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}

interface ActionMenuProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
}

const MENU_WIDTH = 208;

export const ActionMenu: React.FC<ActionMenuProps> = ({ trigger, items }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight ?? items.length * 36 + 12;
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow < menuHeight + 12 ? rect.top - menuHeight - 6 : rect.bottom + 6;
    const left = Math.max(8, Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8));
    setPos({ top, left });
  }, [open, items.length]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex"
        onClick={() => {
          setPos(null);
          setOpen((v) => !v);
        }}
      >
        {trigger}
      </span>

      {open && (
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: pos?.top ?? -9999,
            left: pos?.left ?? -9999,
            width: MENU_WIDTH,
          }}
          className="z-[60] bg-white dark:bg-[#1E293B] border border-[#E6E8EE] dark:border-[#334155] rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.18)] py-1.5 animate-in fade-in zoom-in-95 duration-100"
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
              className={`w-full text-left px-3.5 py-2 flex items-center gap-2 text-xs transition-colors cursor-pointer ${
                item.danger
                  ? 'text-[#DC5B3E] dark:text-rose-400 hover:bg-[#FCEAE4] dark:hover:bg-rose-500/10'
                  : 'text-[#12141C] dark:text-gray-200 hover:bg-[#F6F7FA] dark:hover:bg-gray-700/50'
              }`}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export default ActionMenu;