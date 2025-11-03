// src/components/layout/mobile-nav.tsx
"use client";

import { mainNavigation } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function MobileNav() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  // Track scroll position for navbar style
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide nav when scrolling down, show when scrolling up
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 200,
          }}
          className={cn(
            "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-around bg-background/80 backdrop-blur-lg border border-border rounded-full shadow-lg px-4 py-2",
            isScrolled ? "shadow-lg" : "shadow-sm"
          )}
          style={{
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          {mainNavigation.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href) && item.href !== "/";

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center p-3 rounded-full transition-all",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeIndicator"
                    className="absolute inset-0 bg-primary/10 rounded-full"
                    transition={{
                      type: "spring",
                      bounce: 0.3,
                      duration: 0.6,
                    }}
                  />
                )}
                <item.icon className="h-5 w-5 z-10" />
                <span className="sr-only">{item.name}</span>

                {isActive && (
                  <motion.span
                    className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}
              </Link>
            );
          })}
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
