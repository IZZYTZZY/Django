import { useState } from "react";
import { generatePDFPreview, downloadPDF } from "../lib/pdfHelper";

type Props = {
  templateId: string;
  leadMagnetId: string;
  answers: Record<string, any>;
};

export default function CreateLeadMagnet({
  templateId,
  leadMagnetId,
  answers,
}: Props) {
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePDF = async () => {
    try {
      setLoading(true);
      setError(null);

      const { previewUrl, blob } = await generatePDFPreview({
        template_id: templateId,
        lead_magnet_id: leadMagnetId,
        use_ai_content: true,
        user_answers: answers,
      });

      setPdfPreviewUrl(previewUrl);
      setPdfBlob(blob);
      setShowPreview(true);
    } catch (err) {
      console.error("PDF generation failed:", err);
      setError("Failed to generate PDF");
    } finally {
      setLoading(false);
    }
  };

  const closePreview = () => {
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
    }
    setPdfPreviewUrl(null);
    setPdfBlob(null);
    setShowPreview(false);
  };

  return (
    <>
      <button onClick={handleGeneratePDF} disabled={loading}>
        {loading ? "Generating…" : "Generate PDF"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {showPreview && pdfPreviewUrl && (
        <div style={backdropStyle}>
          <div style={modalStyle}>
            <iframe
              src={pdfPreviewUrl}
              title="PDF Preview"
              style={{ width: "100%", height: "600px", border: "none" }}
            />

            <div style={actionsStyle}>
              <button
                onClick={() => {
                  if (pdfBlob) {
                    downloadPDF(pdfBlob, "lead-magnet.pdf");
                  }
                }}
              >
                Download PDF
              </button>

              <button onClick={closePreview}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ===== Inline styles ===== */

const backdropStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.75)",
  zIndex: 9999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modalStyle: React.CSSProperties = {
  background: "#111",
  width: "85%",
  maxWidth: "1000px",
  borderRadius: "8px",
  padding: "16px",
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "12px",
};
