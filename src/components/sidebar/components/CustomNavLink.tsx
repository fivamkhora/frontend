"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

type CustomNavLinkProps = {
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick?: () => void;
  matchPaths?: string[];
};

export const CustomNavLink = ({
  href,
  children,
  icon,
  onClick,
  matchPaths = [],
}: CustomNavLinkProps) => {
  const pathname = usePathname();

  const isActive =
    pathname === href || matchPaths.some((path) => pathname.startsWith(path));

  const baseClass =
    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer";
  const activeClass = "bg-blue-50 text-blue-600 font-semibold border-l-4";
  const inactiveClass = "text-gray-600 hover:bg-gray-100 hover:text-gray-900";

  if (onClick) {
    return (
      <li className="list-none">
        <button
          onClick={onClick}
          className={clsx(
            baseClass,
            isActive ? activeClass : inactiveClass,
            "w-full text-left",
          )}
        >
          <span className="shrink-0">{icon}</span>
          <span className="sidebar-text">{children}</span>
        </button>
      </li>
    );
  }

  return (
    <li className="list-none">
      <Link
        href={href}
        className={clsx(baseClass, isActive ? activeClass : inactiveClass)}
      >
        <span className="shrink-0">{icon}</span>
        <span className="sidebar-text">{children}</span>
      </Link>
    </li>
  );
};
