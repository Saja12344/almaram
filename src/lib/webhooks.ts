/**
 * n8n Webhook Integration Layer
 *
 * All placeholder functions below are structured for future n8n webhook calls.
 * Replace the mock implementations with fetch() calls to your n8n webhook URLs.
 *
 * Example:
 * await fetch(process.env.N8N_WEBHOOK_LOGIN!, {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify(payload),
 * });
 */

import type { AutomationSettings, UserProfile } from "@/types";

export async function webhookLogin(payload: {
  email: string;
  password: string;
}): Promise<{ success: boolean }> {
  // n8n webhook: POST /webhook/auth/login
  console.log("[n8n] login", payload);
  return { success: true };
}

export async function webhookGoogleAuth(): Promise<{ success: boolean }> {
  // n8n webhook: POST /webhook/auth/google
  console.log("[n8n] google auth");
  return { success: true };
}

export async function webhookUploadResume(file: File): Promise<{ success: boolean }> {
  // n8n webhook: POST /webhook/onboarding/resume
  console.log("[n8n] upload resume", file.name);
  return { success: true };
}

export async function webhookSaveOnboarding(
  step: number,
  data: Record<string, unknown>
): Promise<{ success: boolean }> {
  // n8n webhook: POST /webhook/onboarding/step-{step}
  console.log("[n8n] save onboarding step", step, data);
  return { success: true };
}

export async function webhookCompleteOnboarding(
  profile: Partial<UserProfile>
): Promise<{ success: boolean }> {
  // n8n webhook: POST /webhook/onboarding/complete
  console.log("[n8n] complete onboarding", profile);
  return { success: true };
}

export async function webhookStartAutomation(
  settings: AutomationSettings
): Promise<{ success: boolean; status: string }> {
  // n8n webhook: POST /webhook/automation/start
  console.log("[n8n] start automation", settings);
  return { success: true, status: "running" };
}

export async function webhookSaveAutomationSettings(
  settings: AutomationSettings
): Promise<{ success: boolean }> {
  // n8n webhook: POST /webhook/automation/settings
  console.log("[n8n] save automation settings", settings);
  return { success: true };
}

export async function webhookSaveProfile(
  profile: UserProfile
): Promise<{ success: boolean }> {
  // n8n webhook: POST /webhook/profile/update
  console.log("[n8n] save profile", profile);
  return { success: true };
}

export async function webhookViewJobDetails(jobId: string): Promise<void> {
  // n8n webhook: GET /webhook/jobs/{jobId}
  console.log("[n8n] view job details", jobId);
}

export async function webhookApplyToJob(jobId: string): Promise<{ success: boolean }> {
  // n8n webhook: POST /webhook/jobs/{jobId}/apply
  console.log("[n8n] apply to job", jobId);
  return { success: true };
}
