"use client";

import { useCareer } from "@/contexts/career-context";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/brand/logo.png";

export function AlmaramLogo({
  className,
  showWordmark = true,
  markSize = 56,
}: {
  className?: string;
  showWordmark?: boolean;
  markSize?: number;
}) {
  const { t, locale } = useCareer();
  const isArabic = locale === "ar";

  return (
    <div className={cn("flex items-center gap-3.5", className)}>
      <AlmaramMark size={markSize} />
      {showWordmark ? (
        <div className="flex flex-col justify-center gap-1.5">
          <span
            className={cn(
              "leading-none text-foreground",
              isArabic
                ? "font-arabic text-[1.5rem] font-bold"
                : "font-sans text-[1.375rem] font-semibold tracking-[-0.04em]"
            )}
          >
            {t.brand}
          </span>
          <span
            className={cn(
              "leading-none text-muted-foreground",
              isArabic
                ? "font-arabic text-[12px] font-normal"
                : "font-sans text-[11px] font-medium tracking-[0.12em] uppercase"
            )}
          >
            {t.tagline}
          </span>
        </div>
      ) : null}
    </div>
  );
}

export function AlmaramMark({
  className,
  size = 56,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <img
      src={LOGO_SRC}
      alt="Almaram"
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
      style={{ width: size, height: size }}
      decoding="async"
    />
  );
}
