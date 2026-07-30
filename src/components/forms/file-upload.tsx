"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CheckCircle2, FileText, Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { webhookUploadResume } from "@/lib/webhooks";

interface FileUploadProps {
  onUpload?: (file: File) => void;
  accept?: string;
  className?: string;
}

export function FileUpload({
  onUpload,
  accept = ".pdf,.docx",
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleFile = useCallback(
    async (selectedFile: File) => {
      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      const ext = selectedFile.name.split(".").pop()?.toLowerCase();
      if (!validTypes.includes(selectedFile.type) && !["pdf", "docx"].includes(ext || "")) {
        toast.error("Please upload a PDF or DOCX file");
        return;
      }

      setFile(selectedFile);
      setUploading(true);
      setProgress(0);

      // Simulate upload progress — replace with n8n webhook progress tracking
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 150);

      setTimeout(async () => {
        clearInterval(interval);
        setProgress(100);
        setUploading(false);
        // n8n webhook: POST /webhook/onboarding/resume
        await webhookUploadResume(selectedFile);
        onUpload?.(selectedFile);
        toast.success("Resume uploaded successfully");
      }, 1500);
    },
    [onUpload]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFile(droppedFile);
    },
    [handleFile]
  );

  return (
    <div className={cn("space-y-4", className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          "relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50",
          file && "border-solid border-emerald-200 bg-emerald-50/50"
        )}
      >
        <input
          type="file"
          accept={accept}
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={(e) => {
            const selected = e.target.files?.[0];
            if (selected) handleFile(selected);
          }}
        />
        {file ? (
          <div className="flex flex-col items-center gap-3 p-8">
            <CheckCircle2 className="size-10 text-emerald-600" />
            <div className="text-center">
              <p className="font-medium text-foreground">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 p-8">
            <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
              <Upload className="size-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">
                Drag & drop your resume
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                PDF or DOCX up to 10MB
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="size-3.5" />
              <span>.pdf, .docx</span>
            </div>
          </div>
        )}
      </div>

      {(uploading || progress > 0) && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {uploading ? "Uploading..." : "Complete"}
            </span>
            <span className="font-medium tabular-nums">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2 rounded-full" />
        </div>
      )}
    </div>
  );
}
