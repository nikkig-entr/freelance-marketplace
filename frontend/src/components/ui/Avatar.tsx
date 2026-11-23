import { clsx } from 'clsx';
import { UserCircleIcon } from '@heroicons/react/24/outline';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'square';
  className?: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
  statusPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-24 h-24 text-2xl',
};

const statusSizeClasses = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-3.5 h-3.5',
  '2xl': 'w-4 h-4',
};

const statusColorClasses = {
  online: 'bg-success-500',
  offline: 'bg-secondary-400',
  busy: 'bg-danger-500',
  away: 'bg-warning-500',
};

const statusPositionClasses = {
  'bottom-right': 'bottom-0 right-0',
  'bottom-left': 'bottom-0 left-0',
  'top-right': 'top-0 right-0',
  'top-left': 'top-0 left-0',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getColorFromName(name: string): string {
  const colors = [
    'bg-primary-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-teal-500',
    'bg-orange-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  shape = 'circle',
  className,
  status,
  statusPosition = 'bottom-right',
}: AvatarProps) {
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-xl';
  const showStatus = status && status !== 'offline';

  return (
    <div className={clsx('relative inline-flex shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          className={clsx(sizeClasses[size], shapeClass, 'object-cover')}
        />
      ) : (
        <div
          className={clsx(
            sizeClasses[size],
            shapeClass,
            'flex items-center justify-center font-medium text-white',
            getColorFromName(name || 'User')
          )}
          aria-label={name || 'User avatar'}
        >
          {name ? getInitials(name) : <UserCircleIcon className="w-full h-full" />}
        </div>
      )}
      {showStatus && (
        <span
          className={clsx(
            'absolute border-2 border-white',
            statusSizeClasses[size],
            'rounded-full',
            statusColorClasses[status],
            statusPositionClasses[statusPosition]
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
}

export function AvatarGroup({
  avatars,
  max = 5,
  size = 'md',
  className,
}: {
  avatars: (AvatarProps & { id: string })[];
  max?: number;
  size?: AvatarProps['size'];
  className?: string;
}) {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div className={clsx('flex -space-x-2', className)} aria-label={`${avatars.length} users`}>
      {visibleAvatars.map((avatar) => (
        <Avatar key={avatar.id} {...avatar} size={size} className="border-2 border-white" />
      ))}
      {remainingCount > 0 && (
        <div
          className={clsx(
            sizeClasses[size],
            'rounded-full flex items-center justify-center font-medium text-secondary-600 bg-secondary-100 border-2 border-white'
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}