"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Upload, X } from "lucide-react";
import { toast } from "sonner";
import {
  CareerShell,
  PageIntro,
  PremiumCard,
  PrimaryButton,
  SecondaryButton,
} from "@/components/career/shell";
import { useAuth } from "@/contexts/auth-context";
import { useCareer } from "@/contexts/career-context";
import { CITY_OPTIONS, COUNTRY_OPTIONS } from "@/lib/mock/career-data";
import type { EmploymentType } from "@/types/career";

function ToggleChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:border-primary/30"
      }`}
    >
      {label}
    </button>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useCareer();
  const { user, configured, changePassword, signOut } = useAuth();
  const {
    profile,
    setJobTitles,
    setLocation,
    setSalaryExpectation,
    saveProfile,
    saving,
  } = useCareer();

  const analysis = profile.analysis;
  const [titles, setTitles] = useState(profile.jobTitles);
  const [newTitle, setNewTitle] = useState("");
  const [countries, setCountries] = useState(profile.location.countries);
  const [cities, setCities] = useState(profile.location.cities);
  const [employmentTypes, setEmploymentTypes] = useState<EmploymentType[]>(
    profile.location.employmentTypes
  );
  const [searchGlobal, setSearchGlobal] = useState(profile.location.searchGlobal);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const toggle = <T extends string>(list: T[], value: T, setter: (v: T[]) => void) => {
    setter(list.includes(value) ? list.filter((i) => i !== value) : [...list, value]);
  };

  async function handleSave() {
    const location = { countries, cities, employmentTypes, searchGlobal };
    setJobTitles(titles);
    setLocation(location);
    await saveProfile({ jobTitles: titles, location });
    toast.success(t.profile.saved);
  }

  async function handlePasswordChange() {
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      toast.success(t.profile.passwordUpdated);
    } catch {
      toast.error(t.auth.errorGeneric);
    }
  }

  return (
    <CareerShell>
      <PageIntro title={t.profile.title} subtitle={t.profile.subtitle} />

      <div className="grid gap-6">
        {/* Account */}
        <PremiumCard className="space-y-4">
          <h3 className="text-lg font-semibold">{t.profile.account}</h3>
          {user ? (
            <>
              <div>
                <p className="text-sm text-muted-foreground">{t.profile.email}</p>
                <p className="mt-1 font-medium">{user.email}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="password"
                  placeholder={t.profile.currentPassword}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="h-11 rounded-2xl border border-border bg-card px-4 text-sm outline-none focus:border-primary/40"
                />
                <input
                  type="password"
                  placeholder={t.profile.newPassword}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-11 rounded-2xl border border-border bg-card px-4 text-sm outline-none focus:border-primary/40"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <SecondaryButton
                  onClick={handlePasswordChange}
                  disabled={!currentPassword || newPassword.length < 6}
                >
                  {t.profile.changePassword}
                </SecondaryButton>
                <SecondaryButton
                  onClick={async () => {
                    await signOut();
                    router.push("/login");
                  }}
                >
                  {t.auth.signOut}
                </SecondaryButton>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">{t.profile.signInRequired}</p>
              <PrimaryButton href="/login">{t.auth.signIn}</PrimaryButton>
            </div>
          )}
          {configured && !user ? null : !configured ? (
            <p className="text-xs text-muted-foreground">{t.auth.firebaseMissing}</p>
          ) : null}
        </PremiumCard>

        {/* Resume */}
        <PremiumCard className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold">{t.profile.masterResume}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.profile.replaceResumeHint}</p>
            </div>
            <PrimaryButton href="/upload?replace=1" className="shrink-0">
              <Upload className="me-2 size-[18px]" strokeWidth={2} />
              {t.profile.uploadNewResume}
            </PrimaryButton>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {analysis?.rawText || "—"}
          </p>
          {analysis ? (
            <div className="flex flex-wrap gap-2">
              {analysis.skills.slice(0, 8).map((s) => (
                <span key={s} className="rounded-full bg-muted px-3 py-1 text-sm">
                  {s}
                </span>
              ))}
            </div>
          ) : null}
        </PremiumCard>

        {/* Preferences */}
        <PremiumCard className="space-y-6">
          <h3 className="text-lg font-semibold">{t.profile.preferences}</h3>

          <div>
            <p className="mb-3 font-medium">{t.profile.jobTitles}</p>
            <div className="space-y-2">
              {titles.map((title) => (
                <div
                  key={title}
                  className="flex items-center gap-2 rounded-2xl border border-border bg-muted/40 px-4 py-2"
                >
                  <input
                    value={title}
                    onChange={(e) =>
                      setTitles(titles.map((t) => (t === title ? e.target.value : t)))
                    }
                    className="flex-1 bg-transparent text-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setTitles(titles.filter((t) => t !== title))}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-[18px]" strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={t.profile.addRole}
                className="h-11 flex-1 rounded-2xl border border-border bg-card px-4 text-sm outline-none focus:border-primary/40"
              />
              <button
                type="button"
                onClick={() => {
                  const v = newTitle.trim();
                  if (!v || titles.includes(v)) return;
                  setTitles([...titles, v]);
                  setNewTitle("");
                }}
                className="inline-flex size-11 items-center justify-center rounded-2xl border border-border bg-card hover:bg-muted"
              >
                <Plus className="size-[18px]" strokeWidth={2} />
              </button>
            </div>
          </div>

          <div>
            <p className="mb-3 font-medium">{t.profile.countries}</p>
            <div className="flex flex-wrap gap-2">
              {COUNTRY_OPTIONS.map((c) => (
                <ToggleChip
                  key={c}
                  label={c}
                  active={countries.includes(c)}
                  onClick={() => toggle(countries, c, setCountries)}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 font-medium">{t.profile.cities}</p>
            <div className="flex flex-wrap gap-2">
              {CITY_OPTIONS.map((c) => (
                <ToggleChip
                  key={c}
                  label={c}
                  active={cities.includes(c)}
                  onClick={() => toggle(cities, c, setCities)}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 font-medium">{t.profile.employment}</p>
            <div className="flex flex-wrap gap-2">
              <ToggleChip
                label={t.location.remote}
                active={employmentTypes.includes("remote")}
                onClick={() => toggle(employmentTypes, "remote", setEmploymentTypes)}
              />
              <ToggleChip
                label={t.location.hybrid}
                active={employmentTypes.includes("hybrid")}
                onClick={() => toggle(employmentTypes, "hybrid", setEmploymentTypes)}
              />
              <ToggleChip
                label={t.location.onsite}
                active={employmentTypes.includes("onsite")}
                onClick={() => toggle(employmentTypes, "onsite", setEmploymentTypes)}
              />
            </div>
            <label className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={searchGlobal}
                onChange={(e) => setSearchGlobal(e.target.checked)}
                className="size-4 rounded border-border accent-primary"
              />
              {t.profile.searchGlobal}
            </label>
          </div>

          <div>
            <label className="font-medium">{t.profile.salary}</label>
            <input
              value={profile.salaryExpectation}
              onChange={(e) => setSalaryExpectation(e.target.value)}
              placeholder="e.g. SAR 15,000 – 20,000"
              className="mt-3 h-11 w-full rounded-2xl border border-border bg-card px-4 text-sm outline-none focus:border-primary/40"
            />
          </div>

          <PrimaryButton onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
            {saving ? t.common.loading : t.profile.save}
          </PrimaryButton>
        </PremiumCard>
      </div>
    </CareerShell>
  );
}
