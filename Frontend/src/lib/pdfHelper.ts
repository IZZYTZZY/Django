import { apiclient } from "./apiclient";

export interface GeneratePDFParams {
  template_id: string;
  lead_magnet_id: string;
  use_ai_content: boolean;
  user_answers: Record<string, any>;
}

/**
 * Generate PDF for PREVIEW (no auto-download)
 */
export async function generatePDFPreview(
  params: GeneratePDFParams
): Promise<{ blob: Blob; previewUrl: string }> {
  const response = await apiclient.post(
    "/api/generate-pdf/",
    params,
    { responseType: "blob" }
  );

  if (response.headers["content-type"] !== "application/pdf") {
    throw new Error("Server did not return a PDF");
  }

  const pdfBlob = new Blob([response.data], {
    type: "application/pdf",
  });

  const previewUrl = URL.createObjectURL(pdfBlob);
  return { blob: pdfBlob, previewUrl };
}

/**
 * Download PDF ONLY on user action
 */
export function downloadPDF(blob: Blob, filename = "lead-magnet.pdf") {
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
