import { Fragment, ReactNode } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { clsx } from 'clsx';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

type DropdownItem =
  | { label: string; onClick?: () => void; icon?: ReactNode; disabled?: boolean; danger?: boolean; divider?: false; href?: never }
  | { divider: true; label?: undefined; onClick?: undefined; icon?: undefined; disabled?: undefined; danger?: undefined; href?: never };

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ trigger, items, align = 'right', className }: DropdownProps) {
  return (
    <Menu as="div" className={clsx('relative inline-block text-left', className)}>
      <Menu.Button as={Fragment}>{trigger}</Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={clsx(
            'absolute z-10 min-w-[160px] mt-2 origin-top-right rounded-xl bg-[var(--color-surface)] py-1 border border-[var(--color-border)] shadow-[var(--shadow-xl)] focus:outline-none',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {items.map((item, index) => {
            if ('divider' in item && item.divider) {
              return <div key={index} className="border-t border-[var(--color-border)] my-1" />;
            }

            return (
              <Menu.Item key={index}>
                {({ active }) => (
                  <button
                    type="button"
                    onClick={item.onClick}
                    disabled={item.disabled}
                    className={clsx(
                      'w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors',
                      active ? 'bg-[var(--color-surface-hover)]' : '',
                      item.danger ? 'text-[var(--color-gray-500)]' : 'text-[var(--color-text)]',
                      item.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--color-surface-hover)]'
                    )}
                  >
                    {item.icon && <span className="w-5 h-5 flex-shrink-0 text-[var(--color-text-muted)]">{item.icon}</span>}
                    {item.label}
                  </button>
                )}
              </Menu.Item>
            );
          })}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

interface UserMenuProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
    plan: string;
  };
  onProfileClick: () => void;
  onSettingsClick: () => void;
  onLogout: () => void;
  onUpgradeClick?: () => void;
}

export function UserMenu({ user, onProfileClick, onSettingsClick, onLogout, onUpgradeClick }: UserMenuProps) {
  const items: DropdownItem[] = [
    {
      label: 'Profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      onClick: onProfileClick,
    },
    {
      label: 'Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      onClick: onSettingsClick,
    },
    { divider: true } as DropdownItem,
    ...(onUpgradeClick && user.plan !== 'agency'
      ? [
          {
            label: 'Upgrade Plan',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            ),
            onClick: onUpgradeClick,
          },
          { divider: true } as DropdownItem,
        ]
      : []),
    {
      label: 'Log out',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
      onClick: onLogout,
      danger: true,
    },
  ];

  const trigger = (
    <button
      type="button"
      className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-[var(--glass-bg)] transition-colors"
      aria-expanded="false"
      aria-haspopup="true"
    >
      <div className="w-8 h-8 rounded-full bg-[var(--color-accent-muted)] flex items-center justify-center">
        {user.avatar ? (
          <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
        ) : (
          <span className="text-[var(--color-accent)] font-medium text-sm">
            {user.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="hidden sm:block text-left">
        <p className="text-sm font-medium text-[var(--color-text)]">{user.name}</p>
        <p className="text-xs text-[var(--color-text-muted)]">{user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}</p>
      </div>
      <ChevronDownIcon className="w-4 h-4 text-[var(--color-text-subtle)]" />
    </button>
  );

  return <Dropdown align="right" items={items} trigger={trigger} />;
}