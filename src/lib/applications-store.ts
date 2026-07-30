import fs from "fs/promises";
import path from "path";
import type { PipelineApplication } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "applications.json");
const DISMISSED_PATH = path.join(DATA_DIR, "dismissed-jobs.json");
const FILES_DIR = path.join(DATA_DIR, "applications");

async function ensureDirs() {
  await fs.mkdir(FILES_DIR, { recursive: true });
}

async function readStore(): Promise<PipelineApplication[]> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeStore(items: PipelineApplication[]) {
  await ensureDirs();
  await fs.writeFile(STORE_PATH, JSON.stringify(items, null, 2), "utf8");
}

export async function listApplications(): Promise<PipelineApplication[]> {
  const items = await readStore();
  return items
    .filter((item) => item.status !== "skipped_low_score")
    .sort(
      (a, b) =>
        new Date(b.dateFound).getTime() - new Date(a.dateFound).getTime()
    );
}

export async function getDismissedJobIds(): Promise<Set<string>> {
  try {
    const raw = await fs.readFile(DISMISSED_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export async function addDismissedJob(externalId: string) {
  const ids = await getDismissedJobIds();
  ids.add(externalId);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DISMISSED_PATH, JSON.stringify([...ids], null, 2), "utf8");
}

export async function getApplication(
  id: string
): Promise<PipelineApplication | undefined> {
  const items = await readStore();
  return items.find((item) => item.id === id);
}

export async function upsertApplication(
  input: Omit<
    PipelineApplication,
    "resumePdfPath" | "coverLetterPdfPath" | "createdAt" | "updatedAt"
  > & {
    resumePdfPath?: string;
    coverLetterPdfPath?: string;
  }
): Promise<PipelineApplication> {
  const items = await readStore();
  const now = new Date().toISOString();
  const existingIndex = items.findIndex((item) => item.id === input.id);

  const record: PipelineApplication = {
    ...input,
    resumePdfPath: input.resumePdfPath ?? "",
    coverLetterPdfPath: input.coverLetterPdfPath ?? "",
    createdAt:
      existingIndex >= 0 ? items[existingIndex].createdAt : now,
    updatedAt: now,
  };

  if (existingIndex >= 0) {
    items[existingIndex] = record;
  } else {
    items.unshift(record);
  }

  await writeStore(items);
  return record;
}

export function applicationFilesDir(id: string) {
  return path.join(FILES_DIR, id);
}

export async function saveApplicationFile(
  id: string,
  fileName: "resume.pdf" | "cover-letter.pdf",
  buffer: Buffer
) {
  const dir = applicationFilesDir(id);
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, fileName);
  await fs.writeFile(filePath, buffer);
  return filePath;
}

export function getApplicationFilePath(
  id: string,
  fileName: "resume.pdf" | "cover-letter.pdf"
) {
  return path.join(applicationFilesDir(id), fileName);
}
