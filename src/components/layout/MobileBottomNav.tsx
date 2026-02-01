/**
 * Mobile Bottom Navigation
 * fonPick - Thai Stock Market Application
 *
 * 56px height bottom navigation for mobile devices.
 * Based on: docs/design_rules.md
 *
 * - Fixed positioning at bottom
 * - Safe area insets for mobile home indicator
 * - Active state indication with glassmorphism
 * - Animated transitions with Framer Motion
 * - Hidden on desktop (lg breakpoint and above)
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Spring animation config for navigation
 */
const springTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 25,
};

/**
 * Bottom navigation config
 */
const bottomNavItems = [
  { href: "/", label: "Market", icon: "home" },
  { href: "/search", label: "Search", icon: "search" },
] as const;

type IconName = (typeof bottomNavItems)[number]["icon"];

/**
 * Icon component for navigation items
 */
function NavIcon({
  name,
  className,
  strokeWidth = 2,
}: {
  name: IconName;
  className?: string;
  strokeWidth?: number;
}) {
  const icons = {
    home: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    ),
    search: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    ),
  };

  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

/**
 * Individual navigation item with animations
 */
function NavItem({
  href,
  label,
  icon,
  isActive,
  currentPath,
}: {
  href: string;
  label: string;
  icon: IconName;
  isActive: boolean;
  currentPath: string;
}) {
  const handleTap = () => {
    // Haptic feedback for supported devices
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(10);
    }
  };

  const isActiveLink = (href == "/" && (currentPath.endsWith("/th") || currentPath.endsWith("/en"))) || (currentPath.endsWith(href))

  return (
    <Link
      href={href}
      className="relative flex flex-col items-center justify-center gap-0.5 min-w-[64px]"
      aria-current={isActive ? "page" : undefined}
      aria-label={label}
      onClick={handleTap}
    >
      <motion.div
        className="relative flex items-center justify-center"
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
      >
        {/* Active glow effect */}
        <AnimatePresence>
          {isActiveLink && (
            <motion.div
              className="absolute inset-0 bg-accent-blue/20 rounded-xl blur-lg -z-10"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={springTransition}
            />
          )}
        </AnimatePresence>

        {/* Animated icon with scale and stroke width change */}
        <AnimatePresence mode="wait">
          {isActiveLink ? (
            <motion.div
              key="active"
              initial={{ scale: 0.8, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0.7 }}
              transition={springTransition}
            >
              <NavIcon name={icon} className="w-6 h-6" strokeWidth={2.5} />
            </motion.div>
          ) : (
            <motion.div
              key="inactive"
              initial={{ scale: 0.8, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={springTransition}
            >
              <NavIcon name={icon} className="w-6 h-6" strokeWidth={2} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active indicator line */}
        <AnimatePresence>
          {isActiveLink && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute -bottom-6 -translate-x-1/2 w-12 h-1 
              bg-accent-blue rounded-full"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0 }}
              transition={springTransition}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Label with animated color */}
      <motion.span
        className={cn(
          "text-[10px] font-medium transition-colors duration-200",
          isActiveLink ? "text-accent-blue" : "text-text-tertiary",
        )}
        animate={{ opacity: isActiveLink ? 1 : 0.7 }}
        transition={springTransition}
      >
        {label}
      </motion.span>
    </Link>
  );
}

/**
 * Mobile Bottom Navigation Component
 * 56px height bottom navigation bar for mobile
 * Features:
 * - Glassmorphism effect with backdrop blur
 * - Animated active indicator
 * - Icon scale and stroke animations
 * - Active glow effect
 * - Haptic feedback on tap
 */
export function MobileBottomNav() {
  const pathname = usePathname();

  /**
   * Check if a link is active
   */
  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={cn(
        "lg:hidden fixed bottom-0 left-0 right-0 z-50",
        // Glassmorphism effect
        "bg-bg-surface/80 backdrop-blur-xl",
        // Border
        "border-t border-border-subtle/50",
        // Safe area for mobile home indicator
        "pb-safe-bottom",
      )}
      aria-label="Mobile navigation"
    >
      {/* Navigation items - 56px height + safe area */}
      <div className="h-14 pb-safe-bottom">
        <div className="container mx-auto px-4 h-full">
          <div className="flex items-center justify-around h-full">
            {bottomNavItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={isActive(item.href)}
                currentPath={pathname}
              />
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
