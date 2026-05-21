import { useState, useEffect, useRef } from "react";
import API from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext";
import { MdUpload, MdDownload, MdDelete, MdDescription, MdPictureAsPdf, MdImage } from "react-icons/md";
import toast from "react-hot-toast";

export default function DocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: "", type: "other",
    employeeName: "", employeeEmail: "", employeeId: ""
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    fetchDocuments();
    if (user?.role === "admin") fetchEmployees();
  }, []);

  const fetchDocuments = async () => {
    try {
      const url = user?.role === "admin" ? "/documents" : "/documents/my";
      const { data } = await API.get(url);
      setDocuments(data);
    } catch (error) {
      toast.error("Document লোড ব্যর্থ!");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data } = await API.get("/employees");
      setEmployees(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (!form.title) {
        setForm({ ...form, title: file.name.split(".")[0] });
      }
    }
  };

  const handleEmployeeSelect = (e) => {
    const emp = employees.find(emp => emp._id === e.target.value);
    if (emp) {
      setForm({
        ...form,
        employeeId: emp._id,
        employeeName: emp.name,
        employeeEmail: emp.email
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !form.title) {
      toast.error("ফাইল ও শিরোনাম দিন!");
      return;
    }
    if (user?.role === "admin" && !form.employeeName) {
      toast.error("কর্মী বেছে নিন!");
      return;
    }

    const formData = new FormData();
    formData.append("document", selectedFile);
    formData.append("title", form.title);
    formData.append("type", form.type);
    if (user?.role === "admin") {
      formData.append("employeeName", form.employeeName);
      formData.append("employeeEmail", form.employeeEmail);
      formData.append("employeeId", form.employeeId);
    }

    try {
      setUploading(true);
      const { data } = await API.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setDocuments([data, ...documents]);
      toast.success("Document Upload হয়েছে!");
      setShowModal(false);
      setSelectedFile(null);
      setForm({ title: "", type: "other", employeeName: "", employeeEmail: "", employeeId: "" });
    } catch (error) {
      toast.error("Upload ব্যর্থ!");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc) => {
    try {
      const response = await API.get(`/documents/download/${doc._id}`, {
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", doc.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Download হচ্ছে!");
    } catch (error) {
      toast.error("Download ব্যর্থ!");
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/documents/${id}`);
      setDocuments(documents.filter(d => d._id !== id));
      toast.success("Document মুছে ফেলা হয়েছে!");
    } catch (error) {
      toast.error("মুছে ফেলা ব্যর্থ!");
    }
  };

  const getFileIcon = (filename) => {
    const ext = filename?.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "webp"].includes(ext)) return <MdImage size={24} />;
    if (ext === "pdf") return <MdPictureAsPdf size={24} />;
    return <MdDescription size={24} />;
  };

  const getFileColor = (filename) => {
    const ext = filename?.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "webp"].includes(ext)) return "#6366f1";
    if (ext === "pdf") return "#ef4444";
    return "#f59e0b";
  };

  const typeLabel = (t) => ({
    nid: "NID Card",
    certificate: "Certificate",
    contract: "Contract",
    photo: "Photo",
    other: "Other"
  }[t] || t);

  const formatSize = (bytes) => {
    if (!bytes) return "Unknown";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const inputStyle = {
    width: "100%", padding: "10px 12px",
    background: "#0f172a", border: "1px solid #334155",
    borderRadius: "8px", color: "#f1f5f9",
    fontSize: "14px", outline: "none"
  };

  if (loading) return <p style={{ color: "#94a3b8" }}>লোড হচ্ছে...</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ color: "#f1f5f9" }}>📄 Documents</h2>
          <p style={{ color: "#94a3b8", fontSize: "13px" }}>
            মোট {documents.length} টি Document
          </p>
        </div>
        <button onClick={() => setShowModal(true)} style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "10px 20px", background: "#6366f1",
          border: "none", borderRadius: "8px",
          color: "white", cursor: "pointer", fontWeight: "600"
        }}>
          <MdUpload size={20} /> Document Upload
        </button>
      </div>

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <div style={{
          background: "#1e293b", borderRadius: "12px",
          padding: "60px", border: "1px solid #334155", textAlign: "center"
        }}>
          <MdDescription size={48} style={{ color: "#334155", marginBottom: "16px" }} />
          <p style={{ color: "#94a3b8", fontSize: "16px" }}>কোনো Document নেই</p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "16px"
        }}>
          {documents.map(doc => (
            <div key={doc._id} style={{
              background: "#1e293b", borderRadius: "12px",
              padding: "20px", border: "1px solid #334155"
            }}>
              {/* File Icon & Info */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "10px",
                  background: getFileColor(doc.filename) + "22",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: getFileColor(doc.filename), flexShrink: 0
                }}>
                  {getFileIcon(doc.filename)}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <p style={{
                    color: "#f1f5f9", fontSize: "14px",
                    fontWeight: "600", marginBottom: "2px",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                  }}>{doc.title}</p>
                  <p style={{ color: "#94a3b8", fontSize: "12px" }}>
                    {doc.originalName}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b", fontSize: "12px" }}>👤 কর্মী</span>
                  <span style={{ color: "#94a3b8", fontSize: "12px" }}>{doc.employeeName}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b", fontSize: "12px" }}>📁 ধরন</span>
                  <span style={{
                    padding: "2px 8px", borderRadius: "20px", fontSize: "11px",
                    background: "#6366f122", color: "#6366f1"
                  }}>{typeLabel(doc.type)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b", fontSize: "12px" }}>📦 সাইজ</span>
                  <span style={{ color: "#94a3b8", fontSize: "12px" }}>{formatSize(doc.size)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b", fontSize: "12px" }}>📅 তারিখ</span>
                  <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                    {new Date(doc.createdAt).toLocaleDateString("bn-BD")}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => handleDownload(doc)} style={{
                  flex: 1, display: "flex", alignItems: "center",
                  justifyContent: "center", gap: "6px",
                  padding: "8px", background: "#6366f122",
                  border: "1px solid #6366f144", borderRadius: "8px",
                  color: "#6366f1", cursor: "pointer", fontSize: "13px"
                }}>
                  <MdDownload size={16} /> Download
                </button>
                <button onClick={() => handleDelete(doc._id)} style={{
                  padding: "8px", background: "#ef444422",
                  border: "1px solid #ef444444", borderRadius: "8px",
                  color: "#ef4444", cursor: "pointer"
                }}>
                  <MdDelete size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "#00000088",
          display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 1000, padding: "20px"
        }}>
          <div style={{
            background: "#1e293b", borderRadius: "12px", padding: "32px",
            width: "100%", maxWidth: "480px", border: "1px solid #334155"
          }}>
            <h3 style={{ color: "#f1f5f9", marginBottom: "24px" }}>Document Upload</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* File Select */}
              <div>
                <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>
                  ফাইল বেছে নিন
                </label>
                <div
                  onClick={() => fileRef.current.click()}
                  style={{
                    border: `2px dashed ${selectedFile ? "#6366f1" : "#334155"}`,
                    borderRadius: "8px", padding: "24px",
                    textAlign: "center", cursor: "pointer",
                    background: selectedFile ? "#6366f111" : "transparent"
                  }}>
                  <MdUpload size={32} style={{ color: selectedFile ? "#6366f1" : "#334155", marginBottom: "8px" }} />
                  <p style={{ color: selectedFile ? "#6366f1" : "#94a3b8", fontSize: "14px" }}>
                    {selectedFile ? selectedFile.name : "ক্লিক করে ফাইল বেছে নিন"}
                  </p>
                  <p style={{ color: "#64748b", fontSize: "12px", marginTop: "4px" }}>
                    JPG, PNG, PDF, DOC — সর্বোচ্চ 10MB
                  </p>
                </div>
                <input
                  type="file"
                  ref={fileRef}
                  onChange={handleFileSelect}
                  accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
                  style={{ display: "none" }}
                />
              </div>

              {/* Title */}
              <div>
                <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>
                  শিরোনাম
                </label>
                <input
                  placeholder="Document এর শিরোনাম"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  style={inputStyle}
                />
              </div>

              {/* Type */}
              <div>
                <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>
                  Document ধরন
                </label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  style={inputStyle}
                >
                  <option value="nid">NID Card</option>
                  <option value="certificate">Certificate</option>
                  <option value="contract">Contract</option>
                  <option value="photo">Photo</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Employee Select — Admin only */}
              {user?.role === "admin" && (
                <div>
                  <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>
                    কর্মী বেছে নিন
                  </label>
                  <select onChange={handleEmployeeSelect} style={inputStyle} defaultValue="">
                    <option value="" disabled>কর্মী বেছে নিন</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button onClick={handleUpload} disabled={uploading} style={{
                flex: 1, padding: "12px", background: "#6366f1",
                border: "none", borderRadius: "8px",
                color: "white", cursor: uploading ? "not-allowed" : "pointer",
                fontWeight: "600", opacity: uploading ? 0.7 : 1
              }}>
                {uploading ? "Upload হচ্ছে..." : "Upload করুন"}
              </button>
              <button onClick={() => {
                setShowModal(false);
                setSelectedFile(null);
              }} style={{
                flex: 1, padding: "12px", background: "#334155",
                border: "none", borderRadius: "8px",
                color: "#f1f5f9", cursor: "pointer", fontWeight: "600"
              }}>বাতিল</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}