import { apiClient } from "./apiClient";

/**
 * Generate PDF from backend
 * @param {string} template_id
 * @param {string} lead_magnet_id
 * @param {boolean} use_ai_content
 * @param {object} user_answers
 */
export async function generatePDF(
  template_id,
  lead_magnet_id,
  use_ai_content,
  user_answers
) {
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
        responseType: "blob",
      }
    );

    return response.data;
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw error;
  }
}
