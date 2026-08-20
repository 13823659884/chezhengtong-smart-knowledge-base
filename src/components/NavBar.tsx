import { memo } from 'react';
import { Link } from 'react-router-dom';

interface NavBarProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backTo?: string;
  rightAction?: React.ReactNode;
  bgColor?: string;
}

export const NavBar = memo(function NavBar({
  title,
  subtitle,
  showBack = true,
  backTo,
  rightAction,
  bgColor = 'bg-primary',
}: NavBarProps) {
  return (
    <div className={`relative ${bgColor} text-white px-4 pt-2 pb-3`}>
      {showBack && (
        <Link
          to={backTo || '..'}
          className="absolute left-3 top-2.5 w-9 h-9 flex items-center justify-center active:opacity-70"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
      )}
      <div className="text-center">
        <h1 className="text-[17px] font-semibold tracking-wide">{title}</h1>
        {subtitle && (
          <p className="text-[11px] opacity-80 mt-0.5">{subtitle}</p>
        )}
      </div>
      {rightAction && (
        <div className="absolute right-3 top-2.5">{rightAction}</div>
      )}
    </div>
  );
});
