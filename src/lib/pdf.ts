import PDFDocument from "pdfkit";

function renderTextPdf(title: string, body: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(16).font("Helvetica-Bold").text(title, { align: "left" });
    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#444444")
      .text(new Date().toLocaleDateString("en-GB", { dateStyle: "long" }));
    doc.moveDown(1.2);
    doc.fillColor("#111111").fontSize(11).text(body, {
      align: "left",
      lineGap: 4,
    });

    doc.end();
  });
}

export async function buildResumePdf(params: {
  company: string;
  role: string;
  content: string;
}) {
  const title = `${params.role} — ${params.company}`;
  return renderTextPdf(title, params.content);
}

export async function buildCoverLetterPdf(params: {
  company: string;
  role: string;
  content: string;
}) {
  const title = `Cover Letter — ${params.role} at ${params.company}`;
  return renderTextPdf(title, params.content);
}
