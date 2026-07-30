const push = $("Push to JobPilot").item.json || {};
const kit = $("Build Application Kit").item.json || {};

let notes = {};
try {
  notes = JSON.parse(kit.notes || "{}");
} catch {
  notes = { raw: kit.notes || "" };
}

notes.site = {
  ok: push.ok === true,
  viewUrl: push.viewUrl || "",
  resumePdfUrl: push.resumePdfUrl || "",
  coverLetterPdfUrl: push.coverLetterPdfUrl || "",
  id: push.id || ""
};

if (push.error || push.message) {
  notes.site.error = push.error || push.message;
}

return {
  json: {
    notes: JSON.stringify(notes)
  }
};
