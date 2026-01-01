import { useState } from "react";
import { generatePDFPreview, downloadPDF } from "../lib/pdfHelper";

export default function CreateLeadMagnet() {
  // Page-owned state (this is the correct architecture)
  const [selectedTemplate, setSelectedTemplate] = useState<string>("modern-guide");
  const [leadMagnetId, setLeadMagnetId] = useState<string>("");
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGeneratePDF = async () => {
    if (!leadMagnetId) {
      alert("Lead magnet ID is missing");
      return;
    }

    try {
      setLoading(true);

      const { blob, previewUrl } = await generatePDFPreview({
        template_id: selectedTemplate,
        lead_magnet_id: leadMagnetId,
        use_ai_content: true,
        user_answers: answers,
      });

      setPdfBlob(blob);
      setPreviewUrl(previewUrl);
      setShowPreview(true);
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!pdfBlob) return;
    downloadPDF(pdfBlob, "lead-magnet.pdf");
  };

  return (
    <>
      <button
        onClick={handleGeneratePDF}
        disabled={loading}
        className="primary-btn"
      >
        {loading ? "Generating..." : "Generate PDF"}
      </button>

      {showPreview && previewUrl && (
        <div className="pdf-modal-overlay">
          <div className="pdf-modal">
            <iframe
              src={previewUrl}
              title="PDF Preview"
              width="100%"
              height="100%"
              style={{ border: "none" }}
            />

            <div className="pdf-modal-actions">
              <button onClick={handleDownload} className="primary-btn">
                Download PDF
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="secondary-btn"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
