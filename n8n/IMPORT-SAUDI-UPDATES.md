# استيراد تحديثات السعودية + Remote إلى n8n

## لماذا ما انحفظت التعديلات؟

n8n Cloud رفض الحفظ التلقائي برسالة **Unauthorized**. التعديلات كانت في المتصفح فقط واختفت بعد التحديث.

## الحل (3 دقائق)

### 1) افتح workflow الحالي

https://sga37.app.n8n.cloud/workflow/FhXfvpQOXYYiJohX

### 2) خذ نسخة احتياطية (اختياري)

- **Actions** (⋮) → **Download**
- احفظ الملف على Desktop

### 3) استورد التحديثات

- **Actions** (⋮) → **Import from file...**
- اختر الملف:

```
/Users/sajakhalid/Desktop/job-application-pipeline-apply-ready.json
```

- اضغط **Replace** / **Import** (استبدال المحتوى الحالي)

### 4) تحقق من Credentials

بعد الاستيراد، افتح هذه الـ nodes وتأكد الـ credentials مربوطة:

| Node | Credential |
|------|------------|
| Fetch Adzuna | Custom Auth account |
| Email Summary Report | Gmail account |
| Resume Model / Cover Letter Model | OpenAI account (للسيرة والكفر لتر فقط) |

### 5) احفظ

- **Cmd + S** أو انتظر auto-save
- تأكد اختفى علامة ⚠️ من اسم الـ workflow

### 6) Timezone

- **Workflow settings** (أعلى يمين أو من Actions → Settings)
- **Timezone:** `Asia/Riyadh`

---

## وش يتغير بعد الاستيراد؟

| Node | التحديث |
|------|---------|
| Build Public Board Sources | neom, careem, hungerstation, tamara, noon + شركات global |
| Build Adzuna Source | Adzuna **sa** + 10 job titles |
| Filter & Dedupe Jobs | مدن السعودية + Remote/Hybrid + **حظر Manager/Senior** + max 30/run |
| **Code Match Score** | **سكور بالكود (بدون ChatGPT)** — سريع حتى لو 2000 وظيفة |
| AI Match Score | **معطّل** — ما عاد يستخدم للماتش |
| Resume Model | gpt-4.1-mini — **فقط** لما السكور ≥ threshold |
| Cover Letter Model | gpt-4.1-mini — **فقط** بعد Tailor Resume |
| Overview | شرح التدفق الجديد |

---

## إذا Import ما اشتغل

انسخ الكود يدوياً من:

```
n8n/patches/
```

لكل node بالاسم.

---

## ملف job_profile (مهم)

في Data Table **job_profile** تأكد من:

```
target_locations = Remote,Riyadh,Jeddah,Dammam,Khobar
match_threshold = 70
max_job_age_days = 7
max_jobs_per_run = 30
include_remote = true
include_hybrid = true
include_onsite = true
resume_text = (سيرتك الكاملة)
skills = python,react,aws,... (يساعد السكور بالكود)
email = (إيميلك)
site_url = http://localhost:3000
ingest_secret = (نفس JOBPILOT_INGEST_SECRET في .env.local)
```

---

## ربط الموقع (JobPilot Next.js)

### 1) شغّل الموقع محلياً أو انشره

```bash
cd /Users/sajakhalid/Projects/jobpilot-ai
cp .env.local.example .env.local
# عدّل JOBPILOT_INGEST_SECRET لسطر عشوائي طويل
npm run dev
```

افتح: http://localhost:3000/applications

### 2) n8n Cloud يحتاج يوصل للموقع

- **محلي:** استخدم ngrok مثل `ngrok http 3000` وضع الرابط في `site_url`
- **منشور:** ضع رابط Vercel في `site_url`

### 3) بعد الاستيراد — التدفق الجديد

```
Tailor Resume → Write Cover Letter → Push to JobPilot → PDF على الموقع → Log Prepared
```

- الإيميل = **تنبيه "شيك الموقع"** فقط (بدون جدول وظائف)
- السيرة + الكفر لتر = **PDF** في `/applications`

### 4) Variables في n8n (اختياري)

```
JOBPILOT_APP_URL = https://your-url.com
JOBPILOT_INGEST_SECRET = same-as-env-local
```

---

## ليش Run 23 جاب وظيفة واحدة؟

1. **Dedupe:** أي وظيفة موجودة مسبقاً في `job_applications` (نفس `external_id`) ما تتكرر — غالباً معظم الوظائف "جديدة" كانت محفوظة من قبل.
2. **Figma Manager** كانت تمر لأن الفلتر ما كان يحظر `Manager` — **انحل بعد الاستيراد**.
3. **سكور 20** = ما في overlap قوي بين السيرة والوظيفة + Manager/Billing — **ما ينسوي سيرة** لأن threshold = 70.
4. بعد الاستيراد: الكود يفحص كل الوظائف بسرعة؛ **ChatGPT بس للسيرة والكفر لتر** للي سكورهم ≥ 70.
