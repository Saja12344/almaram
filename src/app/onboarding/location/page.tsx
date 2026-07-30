"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CareerShell,
  PageIntro,
  PremiumCard,
  PrimaryButton,
} from "@/components/career/shell";
import { useCareer } from "@/contexts/career-context";
import {
  CITY_OPTIONS,
  COUNTRY_OPTIONS,
} from "@/lib/mock/career-data";
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

export default function LocationPage() {
  const router = useRouter();
  const { t, profile, setLocation } = useCareer();
  const [countries, setCountries] = useState(profile.location.countries);
  const [cities, setCities] = useState(profile.location.cities);
  const [employmentTypes, setEmploymentTypes] = useState<EmploymentType[]>(
    profile.location.employmentTypes
  );
  const [searchGlobal, setSearchGlobal] = useState(profile.location.searchGlobal);

  const toggle = <T extends string>(list: T[], value: T, setter: (v: T[]) => void) => {
    setter(list.includes(value) ? list.filter((i) => i !== value) : [...list, value]);
  };

  const toggleEmployment = (type: EmploymentType) => {
    toggle(employmentTypes, type, setEmploymentTypes);
  };

  return (
    <CareerShell minimal>
      <PageIntro title={t.location.title} subtitle={t.location.subtitle} />

      <div className="grid gap-6">
        <PremiumCard>
          <h3 className="text-lg font-semibold">{t.location.countries}</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {COUNTRY_OPTIONS.map((country) => (
              <ToggleChip
                key={country}
                label={country}
                active={countries.includes(country)}
                onClick={() => toggle(countries, country, setCountries)}
              />
            ))}
          </div>
        </PremiumCard>

        <PremiumCard>
          <h3 className="text-lg font-semibold">{t.location.cities}</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {CITY_OPTIONS.map((city) => (
              <ToggleChip
                key={city}
                label={city}
                active={cities.includes(city)}
                onClick={() => toggle(cities, city, setCities)}
              />
            ))}
          </div>
        </PremiumCard>

        <PremiumCard>
          <h3 className="text-lg font-semibold">{t.location.employment}</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            <ToggleChip
              label={t.location.remote}
              active={employmentTypes.includes("remote")}
              onClick={() => toggleEmployment("remote")}
            />
            <ToggleChip
              label={t.location.hybrid}
              active={employmentTypes.includes("hybrid")}
              onClick={() => toggleEmployment("hybrid")}
            />
            <ToggleChip
              label={t.location.onsite}
              active={employmentTypes.includes("onsite")}
              onClick={() => toggleEmployment("onsite")}
            />
          </div>
          <label className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={searchGlobal}
              onChange={(e) => setSearchGlobal(e.target.checked)}
              className="size-4 rounded border-border accent-primary"
            />
            {t.location.searchGlobal}
          </label>
        </PremiumCard>

        <PrimaryButton
          onClick={() => {
            setLocation({ countries, cities, employmentTypes, searchGlobal });
            router.push("/onboarding/search");
          }}
        >
          {t.location.continue}
        </PrimaryButton>
      </div>
    </CareerShell>
  );
}
