"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { JobMatch } from "@/types";
import { cn } from "@/lib/utils";
import { ExternalLink, FileText } from "lucide-react";
import Link from "next/link";

interface JobMatchCardProps {
  job: JobMatch;
}

export function JobMatchCard({ job }: JobMatchCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <Avatar className="size-12 rounded-xl">
          <AvatarFallback className="rounded-xl bg-muted text-sm font-semibold">
            {job.companyLogo}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <p className="font-medium text-foreground">{job.company}</p>
          <p className="text-sm text-muted-foreground">{job.title}</p>
          <p className="text-xs text-muted-foreground">
            {job.remote ? "Remote" : job.location}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Badge
          variant="secondary"
          className="rounded-lg px-3 py-1 text-sm font-semibold tabular-nums"
        >
          {job.matchScore}% match
        </Badge>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/applications/${encodeURIComponent(job.id)}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <FileText className="mr-1.5 size-3.5" />
            Open kit
          </Link>
          {job.jobUrl ? (
            <a
              href={job.jobUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Apply on site
              <ExternalLink className="ml-1.5 size-3.5" />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
