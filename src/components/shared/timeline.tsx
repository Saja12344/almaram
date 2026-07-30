"use client";

import { cn } from "@/lib/utils";
import type { ActivityItem } from "@/types";
import {
  Briefcase,
  Calendar,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";

const typeIcons = {
  application: Briefcase,
  interview: Calendar,
  match: Sparkles,
  automation: Zap,
};

interface TimelineProps {
  items: ActivityItem[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn("space-y-0", className)}>
      {items.map((item, index) => {
        const Icon = typeIcons[item.type];
        const isLast = index === items.length - 1;
        const content = (
          <>
            <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background">
              <Icon className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {item.timestamp}
                </span>
              </div>
            </div>
          </>
        );

        return (
          <div key={item.id} className="relative flex gap-4 pb-8">
            {!isLast && (
              <div className="absolute left-[19px] top-10 h-[calc(100%-24px)] w-px bg-border" />
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="relative flex w-full gap-4 rounded-xl transition-colors hover:bg-muted/40"
              >
                {content}
              </Link>
            ) : (
              content
            )}
          </div>
        );
      })}
    </div>
  );
}
