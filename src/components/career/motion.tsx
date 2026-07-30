"use client";

import { motion } from "framer-motion";

export function PulseLoader({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <div className="relative size-16">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-border"
          animate={{ scale: [1, 1.06, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-3 rounded-full bg-primary dark:bg-accent"
          animate={{ scale: [0.94, 1, 0.94] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
      </div>
      <div>
        <p className="text-lg font-medium text-foreground">{label}</p>
        {hint ? <p className="mt-2 text-sm text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  );
}

export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.08 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
