"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { AlmaramLogo } from "@/components/brand/almaram-logo";
import { ThemeToggle } from "@/components/career/theme-toggle";
import { useCareer } from "@/contexts/career-context";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

export function CareerShell({
  children,
  minimal = false,
}: {
  children: React.ReactNode;
  minimal?: boolean;
}) {
  const { t, locale, setLocale, profile } = useCareer();
  const { user } = useAuth();
  const pathname = usePathname();
  const showNav = profile.onboardingComplete && !minimal;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/">
            <AlmaramLogo />
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setLocale(locale === "en" ? "ar" : "en")}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              {t.nav.language}
            </button>

            {showNav ? (
              <nav className="hidden items-center gap-1 rounded-full border border-border bg-card p-1 sm:flex">
                {[
                  { href: "/jobs", label: t.nav.jobs },
                  { href: "/profile", label: t.nav.profile },
                  { href: "/pricing", label: t.nav.pricing },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium transition",
                      pathname.startsWith(item.href)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            ) : null}

            {!user ? (
              <Link
                href="/login"
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
              >
                {t.auth.signIn}
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10">{children}</main>
    </div>
  );
}

export function PageIntro({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="mb-12 max-w-2xl"
    >
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-[2.5rem] sm:leading-[1.15]">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{subtitle}</p>
      ) : null}
    </motion.div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  href,
  disabled,
  type = "button",
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  const cls = cn(
    "inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition hover:opacity-95 active:scale-[0.99] disabled:opacity-50",
    className
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  href,
  disabled,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  className?: string;
}) {
  const cls = cn(
    "inline-flex h-12 items-center justify-center rounded-2xl border border-border bg-card px-7 text-sm font-semibold text-foreground transition hover:bg-muted active:scale-[0.99] disabled:opacity-50",
    className
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

export function PremiumCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8",
        className
      )}
    >
      {children}
    </div>
  );
}
