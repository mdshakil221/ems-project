import { useState, useRef } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { MdCamera, MdEdit, MdSave, MdLock } from "react-icons/md";
import toast from "react-hot-toast";

export default function AdminProfile() {
  const { user, login } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(
    user?.profileImage
      ? `http://localhost:5000/uploads/profiles/${user.profileImage}`
      : null
  );
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const fileRef = useRef();

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("profileImage", file);
    try {
      setUploading(true);
      const { data } = await API.post("/auth/profile/image", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setProfileImage(`http://localhost:5000/uploads/profiles/${data.profileImage}`);
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

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("নতুন Password মিলছে না!");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("কমপক্ষে ৬ অক্ষরের Password দিন!");
      return;
    }
    try {
      await API.put("/auth/profile", { password: passwordForm.newPassword });
      toast.success("Password পরিবর্তন হয়েছে!");
      setChangingPassword(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error("Password পরিবর্তন ব্যর্থ!");
    }
  };

  const inputStyle = {
    width: "100%", padding: "10px 12px",
    background: "#0f172a", border: "1px solid #334155",
    borderRadius: "8px", color: "#f1f5f9",
    fontSize: "14px", outline: "none"
  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <h2 style={{ color: "#f1f5f9", marginBottom: "8px" }}>Admin Profile</h2>
      <p style={{ color: "#94a3b8", marginBottom: "24px" }}>আপনার তথ্য দেখুন ও সম্পাদনা করুন</p>

      {/* Profile Card */}
      <div style={{
        background: "#1e293b", borderRadius: "16px",
        padding: "32px", border: "1px solid #334155",
        marginBottom: "24px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "32px" }}>
          {/* Profile Image */}
          <div style={{ position: "relative" }}>
            <div style={{
              width: "100px", height: "100px", borderRadius: "50%",
              background: "#6366f1", display: "flex",
              alignItems: "center", justifyContent: "center",
              overflow: "hidden", border: "3px solid #6366f144"
            }}>
              {profileImage ? (
                <img src={profileImage} alt="Profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ color: "white", fontSize: "36px", fontWeight: "700" }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <button onClick={() => fileRef.current.click()} disabled={uploading}
              style={{
                position: "absolute", bottom: "0", right: "0",
                width: "32px", height: "32px", borderRadius: "50%",
                background: "#6366f1", border: "2px solid #1e293b",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "white"
              }}>
              <MdCamera size={16} />
            </button>
            <input type="file" ref={fileRef} onChange={handleImageChange}
              accept="image/*" style={{ display: "none" }} />
          </div>

          <div>
            <h3 style={{ color: "#f1f5f9", fontSize: "22px", fontWeight: "700" }}>{user?.name}</h3>
            <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "4px" }}>{user?.email}</p>
            <span style={{
              display: "inline-block", marginTop: "8px",
              padding: "4px 12px", background: "#6366f122",
              borderRadius: "20px", color: "#6366f1", fontSize: "12px"
            }}>Admin</span>
            {uploading && <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: "8px" }}>আপলোড হচ্ছে...</p>}
          </div>
        </div>

        {/* Profile Form */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h4 style={{ color: "#f1f5f9" }}>ব্যক্তিগত তথ্য</h4>
          <button onClick={() => setEditing(!editing)} style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "8px 16px", background: "#6366f122",
            border: "1px solid #6366f144", borderRadius: "8px",
            color: "#6366f1", cursor: "pointer", fontSize: "13px"
          }}>
            <MdEdit size={16} /> {editing ? "বাতিল" : "সম্পাদনা"}
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[
            { label: "নাম", key: "name", placeholder: "পূর্ণ নাম" },
            { label: "ফোন", key: "phone", placeholder: "01XXXXXXXXX" },
          ].map(field => (
            <div key={field.key}>
              <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>
                {field.label}
              </label>
              <input
                value={form[field.key]}
                onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                disabled={!editing}
                placeholder={field.placeholder}
                style={{
                  ...inputStyle,
                  opacity: editing ? 1 : 0.6,
                  cursor: editing ? "text" : "not-allowed"
                }}
              />
            </div>
          ))}

          <div>
            <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>Email</label>
            <input value={user?.email} disabled
              style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }} />
          </div>

          {editing && (
            <button onClick={handleUpdateProfile} style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: "8px", padding: "12px", background: "#6366f1",
              border: "none", borderRadius: "8px",
              color: "white", cursor: "pointer", fontWeight: "600"
            }}>
              <MdSave size={18} /> সেভ করুন
            </button>
          )}
        </div>
      </div>

      {/* Password Change */}
      <div style={{
        background: "#1e293b", borderRadius: "16px",
        padding: "32px", border: "1px solid #334155"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h4 style={{ color: "#f1f5f9" }}>Password পরিবর্তন</h4>
          <button onClick={() => setChangingPassword(!changingPassword)} style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "8px 16px", background: "#f59e0b22",
            border: "1px solid #f59e0b44", borderRadius: "8px",
            color: "#f59e0b", cursor: "pointer", fontSize: "13px"
          }}>
            <MdLock size={16} /> {changingPassword ? "বাতিল" : "পরিবর্তন করুন"}
          </button>
        </div>

        {changingPassword && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { label: "নতুন Password", key: "newPassword", placeholder: "নতুন password দিন" },
              { label: "Password নিশ্চিত করুন", key: "confirmPassword", placeholder: "আবার দিন" },
            ].map(field => (
              <div key={field.key}>
                <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>
                  {field.label}
                </label>
                <input
                  type="password"
                  value={passwordForm[field.key]}
                  onChange={e => setPasswordForm({ ...passwordForm, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  style={inputStyle}
                />
              </div>
            ))}
            <button onClick={handleChangePassword} style={{
              padding: "12px", background: "#f59e0b",
              border: "none", borderRadius: "8px",
              color: "white", cursor: "pointer", fontWeight: "600"
            }}>Password পরিবর্তন করুন</button>
          </div>
        )}
      </div>
    </div>
  );
}