import { apiClient } from "./apiclient";

/**
 * Generate PDF from backend and return a previewable URL
 *
 * @param {string} template_id
 * @param {string} lead_magnet_id
 * @param {boolean} use_ai_content
 * @param {object} user_answers
 * @returns {string} preview URL (Object URL)
 */
export async function generatePDF({
  template_id,
  lead_magnet_id,
  use_ai_content,
  user_answers,
}) {
  try {
    const response = await apiClient.post(
      "/api/generate-pdf/",
      {
        template_id,
        lead_magnet_id,
        use_ai_content,
        user_answers,
      },
      {
        responseType: "blob", // IMPORTANT
      }
    );

    // Convert blob → previewable URL
    const pdfBlob = new Blob([response.data], {
      type: "application/pdf",
    });

    const pdfUrl = URL.createObjectURL(pdfBlob);

    return pdfUrl; // ⬅️ PREVIEW FIRST, NOT DOWNLOAD
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw error;
  }
}
