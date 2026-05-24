import { useState, useRef } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { MdCamera, MdEdit, MdSave } from "react-icons/md";
import toast from "react-hot-toast";

export default function ProfileSection({ user }) {
  const { } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(
    user?.profileImage
      ? user.profileImage
      : null
  );
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    password: ""
  });
  const fileRef = useRef();

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      setUploading(true);
      const { data } = await API.post("/auth/profile/image", formData);
      // ✅ Content-Type header remove করা হয়েছে
      setProfileImage(data.profileImage);
      toast.success("Profile ছবি আপডেট হয়েছে!");
    } catch (error) {
      toast.error("ছবি আপলোড ব্যর্থ!");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await API.put("/auth/profile", form);
      toast.success("Profile আপডেট হয়েছে!");
      setEditing(false);
    } catch (error) {
      toast.error("আপডেট ব্যর্থ!");
    }
  };

  const inputStyle = {
    width: "100%", padding: "10px 12px",
    background: "#0f172a", border: "1px solid #334155",
    borderRadius: "8px", color: "#f1f5f9",
    fontSize: "14px", outline: "none"
  };

  return (
    <div style={{ maxWidth: "600px" }}>
      <h3 style={{ color: "#f1f5f9", marginBottom: "24px" }}>আমার Profile</h3>

      {/* Profile Image */}
      <div style={{
        background: "#1e293b", borderRadius: "12px",
        padding: "32px", border: "1px solid #334155",
        display: "flex", alignItems: "center", gap: "24px",
        marginBottom: "24px"
      }}>
        {/* Image */}
        <div style={{ position: "relative" }}>
          <div style={{
            width: "100px", height: "100px", borderRadius: "50%",
            background: profileImage ? "transparent" : "#6366f1",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden", border: "3px solid #6366f144"
          }}>
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ color: "white", fontSize: "36px", fontWeight: "700" }}>
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Camera Button */}
          <button
            onClick={() => fileRef.current.click()}
            disabled={uploading}
            style={{
              position: "absolute", bottom: "0", right: "0",
              width: "32px", height: "32px", borderRadius: "50%",
              background: "#6366f1", border: "2px solid #0f172a",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "white"
            }}>
            <MdCamera size={16} />
          </button>

          <input
            type="file"
            ref={fileRef}
            onChange={handleImageChange}
            accept="image/*"
            style={{ display: "none" }}
          />
        </div>

        {/* Info */}
        <div>
          <h3 style={{ color: "#f1f5f9", fontSize: "20px", fontWeight: "700" }}>
            {user?.name}
          </h3>
          <p style={{ color: "#94a3b8", fontSize: "14px" }}>{user?.email}</p>
          <span style={{
            display: "inline-block", marginTop: "8px",
            padding: "4px 12px", background: "#6366f122",
            borderRadius: "20px", color: "#6366f1", fontSize: "12px"
          }}>Employee</span>
          {uploading && (
            <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: "8px" }}>
              আপলোড হচ্ছে...
            </p>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <div style={{
        background: "#1e293b", borderRadius: "12px",
        padding: "24px", border: "1px solid #334155"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <h4 style={{ color: "#f1f5f9" }}>তথ্য সম্পাদনা</h4>
          <button
            onClick={() => setEditing(!editing)}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 16px", background: "#6366f122",
              border: "1px solid #6366f144", borderRadius: "8px",
              color: "#6366f1", cursor: "pointer", fontSize: "13px"
            }}>
            <MdEdit size={16} />
            {editing ? "বাতিল" : "সম্পাদনা"}
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>
              নাম
            </label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              disabled={!editing}
              style={{
                ...inputStyle,
                opacity: editing ? 1 : 0.6,
                cursor: editing ? "text" : "not-allowed"
              }}
            />
          </div>

          <div>
            <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>
              Email
            </label>
            <input
              value={user?.email}
              disabled
              style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }}
            />
          </div>

          <div>
            <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>
              ফোন নম্বর
            </label>
            <input
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              disabled={!editing}
              placeholder="01XXXXXXXXX"
              style={{
                ...inputStyle,
                opacity: editing ? 1 : 0.6,
                cursor: editing ? "text" : "not-allowed"
              }}
            />
          </div>

          {editing && (
            <div>
              <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>
                নতুন Password (পরিবর্তন করতে চাইলে)
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="নতুন password দিন"
                style={inputStyle}
              />
            </div>
          )}

          {editing && (
            <button onClick={handleUpdateProfile} style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: "8px", padding: "12px",
              background: "#6366f1", border: "none",
              borderRadius: "8px", color: "white",
              cursor: "pointer", fontWeight: "600"
            }}>
              <MdSave size={18} /> সেভ করুন
            </button>
          )}
        </div>
      </div>
    </div>
  );
}