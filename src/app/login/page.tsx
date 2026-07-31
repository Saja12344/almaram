"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CareerShell, PremiumCard, PrimaryButton } from "@/components/career/shell";
import { useAuth } from "@/contexts/auth-context";
import { useCareer } from "@/contexts/career-context";

function firebaseErrorMessage(code: string, fallback: string): string {
  const map: Record<string, string> = {
    "auth/email-already-in-use": "هذا الإيميل مسجّل — جرّب تسجيل الدخول",
    "auth/invalid-email": "الإيميل غير صحيح",
    "auth/weak-password": "كلمة المرور ضعيفة — 6 أحرف على الأقل",
    "auth/user-not-found": "ما في حساب بهذا الإيميل",
    "auth/wrong-password": "كلمة المرور غير صحيحة",
    "auth/invalid-credential": "الإيميل أو كلمة المرور غير صحيحة",
    "permission-denied": "Firestore Rules — تأكد من نشر القواعد في Firebase",
  };
  return map[code] || fallback;
}

export default function LoginPage() {
  const router = useRouter();
  const { t } = useCareer();
  const { configured, signIn, signUp, loading } = useAuth();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!configured) return;
    setSubmitting(true);
    try {
      if (mode === "signIn") await signIn(email, password);
      else await signUp(email, password);
      toast.success(mode === "signIn" ? t.auth.signIn : t.auth.signUp);
      router.push("/profile");
    } catch (err: unknown) {
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code: string }).code)
          : "";
      toast.error(firebaseErrorMessage(code, t.auth.errorGeneric));
      console.error("Auth error:", err);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <CareerShell minimal>
        <PremiumCard className="py-16 text-center text-muted-foreground">{t.common.loading}</PremiumCard>
      </CareerShell>
    );
  }

  return (
    <CareerShell minimal>
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-semibold tracking-tight">{t.auth.title}</h1>
        <p className="mt-3 text-muted-foreground">{t.auth.subtitle}</p>

        <PremiumCard className="mt-8">
          {!configured ? (
            <p className="text-sm text-muted-foreground">{t.auth.firebaseMissing}</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t.auth.email}</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 h-11 w-full rounded-2xl border border-border bg-card px-4 text-sm outline-none focus:border-primary/40"
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t.auth.password}</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 h-11 w-full rounded-2xl border border-border bg-card px-4 text-sm outline-none focus:border-primary/40"
                />
              </div>
              <PrimaryButton type="submit" disabled={submitting} className="w-full">
                {submitting
                  ? t.common.loading
                  : mode === "signIn"
                    ? t.auth.signIn
                    : t.auth.signUp}
              </PrimaryButton>
              <button
                type="button"
                onClick={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
                className="w-full text-sm text-muted-foreground hover:text-foreground"
              >
                {mode === "signIn" ? t.auth.noAccount : t.auth.haveAccount}{" "}
                <span className="font-medium text-primary dark:text-accent">
                  {mode === "signIn" ? t.auth.signUp : t.auth.signIn}
                </span>
              </button>
            </form>
          )}
        </PremiumCard>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            {t.common.back}
          </Link>
        </div>
      </div>
    </CareerShell>
  );
}
