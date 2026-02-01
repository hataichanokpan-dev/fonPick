/**
 * Language Switcher Component
 *
 * Allows users to switch between Thai and English locales
 * Displays current language with flag icon
 */

"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/lib/i18n/routing";
import {
  locales,
  localeNames,
  localeFlags,
  type Locale,
} from "@/lib/i18n/config";
import { useState, useTransition } from "react";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const handleLocaleChange = (newLocale: Locale) => {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
    setIsOpen(false);
  };
 
  const currentFlag = localeFlags[locale];

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1
        rounded-lg bg-surface-2 hover:bg-surface-3 transition-colors"
        aria-label="Switch language"
        aria-expanded={isOpen}
      >
        <span className="text-lg" role="img" aria-label="Current language">
          {currentFlag}
        </span>
        
        <svg
          className={`w-4 h-4 text-text-muted transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Menu */}
          <div
            className="absolute right-0 top-full mt-2 z-20 min-w-[140px] rounded-lg bg-surface-2 border border-border-subtle shadow-lg animate-fade-in-up"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="language-menu"
          >
            <div className="p-1">
              {locales.map((loc) => {
                const isSelected = loc === locale;
                const flag = localeFlags[loc];
                const name = localeNames[loc];

                return (
                  <button
                    key={loc}
                    onClick={() => handleLocaleChange(loc)}
                    disabled={isPending}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                      isSelected
                        ? "bg-accent-blue/10 text-accent-blue"
                        : "text-text-2 hover:bg-surface-3"
                    } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
                    role="menuitem"
                    aria-current={isSelected ? "true" : undefined}
                  >
                    <span className="text-base" role="img">
                      {flag}
                    </span>
                    <span className="font-medium">{name}</span>
                    {isSelected && (
                      <svg
                        className="w-4 h-4 ml-auto"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
