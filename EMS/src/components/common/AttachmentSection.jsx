import { useRef } from "react";
import { MdUpload, MdDownload, MdDelete, MdPictureAsPdf, MdImage, MdDescription } from "react-icons/md";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function AttachmentSection({
  attachments = [],
  onDownload,
  onDelete,
  canDelete = false,
  label = "সংযুক্ত ফাইল"
}) {
  const getFileIcon = (filename) => {
    const ext = filename?.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "webp"].includes(ext)) return <MdImage size={18} />;
    if (ext === "pdf") return <MdPictureAsPdf size={18} />;
    return <MdDescription size={18} />;
  };

  const getFileColor = (filename) => {
    const ext = filename?.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "webp"].includes(ext)) return "#6366f1";
    if (ext === "pdf") return "#ef4444";
    return "#f59e0b";
  };

  const formatSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (attachments.length === 0) return null;

  return (
    <div style={{
      background: "#0f172a", borderRadius: "8px",
      padding: "12px", marginTop: "12px"
    }}>
      <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "8px", fontWeight: "600" }}>
        📎 {label} ({attachments.length})
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {attachments.map((att, index) => (
          <div key={index} style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "8px", background: "#1e293b",
            borderRadius: "6px", border: "1px solid #334155"
          }}>
            <span style={{ color: getFileColor(att.filename) }}>
              {getFileIcon(att.filename)}
            </span>
            <span style={{
              color: "#f1f5f9", fontSize: "12px", flex: 1,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
            }}>
              {att.originalName}
            </span>
            <span style={{ color: "#64748b", fontSize: "11px" }}>
              {formatSize(att.size)}
            </span>
            <button onClick={() => onDownload(att)} style={{
              padding: "4px", background: "#6366f122",
              border: "none", borderRadius: "4px",
              color: "#6366f1", cursor: "pointer"
            }}>
              <MdDownload size={14} />
            </button>
            {canDelete && (
              <button onClick={() => onDelete(att.filename)} style={{
                padding: "4px", background: "#ef444422",
                border: "none", borderRadius: "4px",
                color: "#ef4444", cursor: "pointer"
              }}>
                <MdDelete size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}