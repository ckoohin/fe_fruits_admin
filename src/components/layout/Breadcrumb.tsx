'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { getMenuItems } from '@/lib/menuItem';
import { usePermissions } from '@/hooks/usePermissions';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  className?: string;
  showHome?: boolean;
  separator?: React.ReactNode;
  customItems?: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  className,
  showHome = true,
  separator,
  customItems,
}) => {
  const pathname = usePathname();
  const { hasPermission } = usePermissions();

  const generatedItems = useMemo(() => {
    if (customItems) return customItems;

    const items: BreadcrumbItem[] = [];
    const menuItems = getMenuItems();

    for (const nav of menuItems) {
      const canAccess =
        !nav.permissions?.length || nav.permissions.some((p) => hasPermission(p));

      if (!canAccess) continue;
      if (!pathname.startsWith(nav.href)) continue;

      items.push({ label: nav.label, href: nav.href });

      if (nav.submenu && nav.submenu.length > 0) {
        const sub = nav.submenu.find((s) => pathname.startsWith(s.href));
        if (sub) {
          items.push({
            label: sub.label,
            href: sub.href,
            current: pathname === sub.href,
          });

          if (pathname !== sub.href && pathname.startsWith(sub.href + '/')) {
            const segments = pathname
              .replace(sub.href + '/', '')
              .split('/')
              .filter(Boolean);

            segments.forEach((segment, i) => {
              const isLast = i === segments.length - 1;
              const segmentPath =
                sub.href + '/' + segments.slice(0, i + 1).join('/');

              const label = isNaN(Number(segment))
                ? segment
                    .split('-')
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ')
                : `Chi tiết #${segment}`;

              items.push({
                label,
                href: isLast ? undefined : segmentPath,
                current: isLast,
              });
            });
          }
        }
      }
    }

    return items;
  }, [pathname, hasPermission, customItems]);

  const allItems = useMemo(() => {
    const homeItem = { label: 'Trang chủ', href: '/admin/dashboard' };
    return showHome ? [homeItem, ...generatedItems] : generatedItems;
  }, [showHome, generatedItems]);

  if (!allItems.length) return null;

  const Separator = separator || (
    <ChevronRight className="w-4 h-4 text-gray-400" />
  );

  return (
    <nav
      className={cn('py-3 px-6 bg-gray-50 flex items-center', className)}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2 text-sm flex-wrap">
        {allItems.map((item, i) => {
          const isLast = i === allItems.length - 1;
          const isHome = i === 0 && showHome;

          return (
            <li key={i} className="flex items-center">
              {i > 0 && <span className="mx-1">{Separator}</span>}

              {isHome && (
                <Home className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0" />
              )}

              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-gray-600 hover:text-blue-600 transition-colors truncate max-w-[200px]"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    'truncate max-w-[200px]',
                    isLast || item.current
                      ? 'text-gray-900 font-medium'
                      : 'text-gray-600'
                  )}
                  aria-current={isLast || item.current ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;