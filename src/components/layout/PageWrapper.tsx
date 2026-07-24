import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Route shell: cross-fades pages and sweeps a deep-water veil off the new one,
 * like a viewport clearing of silt.
 */
export function PageWrapper({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.main
      id="main"
      className={cn("relative min-h-screen", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35, ease: "easeIn" } }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[85] bg-gradient-to-b from-abyss-950 via-abyss-800 to-abyss-950"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.9, ease: [0.83, 0, 0.17, 1], delay: 0.05 }}
        style={{ transformOrigin: "top" }}
      />
      {children}
    </motion.main>
  );
}
