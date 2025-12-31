import { apiClient } from "./apiClient";

/**
 * Generate PDF and return preview URL + blob
 * NO AUTO DOWNLOAD
 */
export async function generatePDFPreview({
  template_id,
  lead_magnet_id,
  use_ai_content,
  user_answers,
}) {
  const response = await apiClient.post(
    "/api/generate-pdf/",
    {
      template_id,
      lead_magnet_id,
      use_ai_content,
      user_answers,
    },
    {
      responseType: "blob",
    }
  );

  const pdfBlob = new Blob([response.data], {
    type: "application/pdf",
  });

  const previewUrl = URL.createObjectURL(pdfBlob);

  return {
    previewUrl,
    blob: pdfBlob,
  };
}

/**
 * Explicit user-triggered download
 */
export function downloadPDF(blob, filename = "lead-magnet.pdf") {
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
