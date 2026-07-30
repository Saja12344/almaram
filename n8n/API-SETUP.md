# ربط الموقع بـ n8n — API فقط (بدون Desktop / بدون webhook)

## 1) أنشئ API Key في n8n

1. افتح: https://sga37.app.n8n.cloud
2. **Settings** (أيقونة المستخدم) → **API**
3. **Create API key**
4. فعّل scope: **`dataTableRow:read`**
5. انسخ المفتاح (يظهر مرة واحدة)

## 2) ضعه في `.env.local` للموقع

```env
N8N_API_URL=https://sga37.app.n8n.cloud
N8N_API_KEY=n8n_api_xxxxxxxxxxxxxxxx
N8N_APPLICATIONS_TABLE_ID=48TA6rnQ175ZqaIm
```

## 3) شغّل الموقع

```bash
cd /Users/sajakhalid/Projects/jobpilot-ai
npm run site
```

افتح: http://localhost:3000/applications  
اضغط **Refresh from n8n** — يجلب مباشرة من جدول `job_applications`.

---

## كيف يشتغل

```
n8n Data Table (job_applications)
        ↓
GET /api/v1/data-tables/{id}/rows   ← X-N8N-API-KEY
        ↓
موقعك /api/applications
        ↓
صفحة Applications + PDF
```

- **ما تحتاج** استيراد JSON من Desktop
- **ما تحتاج** webhook workflow إضافي
- **ما تحتاج** ngrok للقراءة (API من السيرفر للسحابة)

---

## PDF

يُولَّد من نص `tailored_resume` و `cover_letter` الموجود في n8n عند الضغط على Resume / Cover.

---

## اختياري: n8n يدفع للموقع (إشعار)

إذا تبي n8n يرسل POST لموقعك بعد كل وظيفة جاهزة:

```env
# في job_profile (n8n Data Table)
site_url = https://your-site.com
ingest_secret = same-as-JOBPILOT_INGEST_SECRET
```

Node `Push to JobPilot` في pipeline — **اختياري**؛ القراءة الأساسية عبر API Key.
