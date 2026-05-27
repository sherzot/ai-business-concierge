/**
 * Shared Framer Motion animation variants
 * Used across pages for consistent micro-animations.
 */

import type { Variants } from "framer-motion";

/** Fade-in + slide up (page section entrance) */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

/** Stagger parent — wraps a list container */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.05,
    },
  },
};

/** Each staggered list child */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

/** Card hover lift */
export const cardHover = {
  rest: { scale: 1, boxShadow: "0 1px 3px 0 rgba(0,0,0,0.08)" },
  hover: { scale: 1.02, boxShadow: "0 8px 24px -4px rgba(99,102,241,0.18)", transition: { duration: 0.18 } },
};

/** Subtle row hover (table rows) */
export const rowHover = {
  rest: { backgroundColor: "rgba(255,255,255,0)" },
  hover: { backgroundColor: "rgba(238,242,255,0.6)", transition: { duration: 0.12 } },
};
