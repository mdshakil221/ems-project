import { useState, useEffect } from "react";
import API from "../../../api/axios";
import { MdAdd, MdEdit, MdDelete, MdLock, MdLockOpen, MdKey, MdPerson } from "react-icons/md";
import toast from "react-hot-toast";
import SearchFilter from "../../../components/common/SearchFilter";
import ExportButtons from "../../../components/common/ExportButtons";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [editingEmp, setEditingEmp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "",
    department: "", position: "", salary: "", status: "active"
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchUsers();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data } = await API.get("/employees");
      setEmployees(data);
    } catch (error) {
      toast.error("কর্মী লোড ব্যর্থ!");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await API.get("/auth/users");
      setUsers(data);
    } catch (error) {
      console.error(error);
    }
  };

  const getUserByEmail = (email) => users.find(u => u.email === email);

  const filterConfig = [
    {
      label: "বিভাগ", key: "department",
      options: [
        { label: "Engineering", value: "Engineering" },
        { label: "Design", value: "Design" },
        { label: "HR", value: "HR" },
        { label: "Marketing", value: "Marketing" },
      ]
    },
    {
      label: "অবস্থা", key: "status",
      options: [
        { label: "সক্রিয়", value: "active" },
        { label: "নিষ্ক্রিয়", value: "inactive" },
      ]
    }
  ];

  const filtered = employees.filter(e => {
    const matchSearch = search === "" ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.department?.toLowerCase().includes(search.toLowerCase()) ||
      e.position?.toLowerCase().includes(search.toLowerCase());

    const matchDept = !activeFilters.department ||
      activeFilters.department === "all" ||
      e.department === activeFilters.department;

    const matchStatus = !activeFilters.status ||
      activeFilters.status === "all" ||
      e.status === activeFilters.status;

    return matchSearch && matchDept && matchStatus;
  });

  const handleOpen = (emp = null) => {
    if (emp) {
      setEditingEmp(emp);
      setForm({ ...emp, password: "" });
    } else {
      setEditingEmp(null);
      setForm({ name: "", email: "", password: "", phone: "", department: "", position: "", salary: "", status: "active" });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) {
      toast.error("নাম ও ইমেইল আবশ্যক!");
      return;
    }
    try {
      if (editingEmp) {
        const { data } = await API.put(`/employees/${editingEmp._id}`, form);
        setEmployees(employees.map(e => e._id === editingEmp._id ? data : e));
        toast.success("কর্মী আপডেট হয়েছে!");
      } else {
        const { data } = await API.post("/employees", form);
        setEmployees([...employees, data]);
        fetchUsers();
        toast.success("নতুন কর্মী যোগ হয়েছে!");
      }
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "সমস্যা হয়েছে!");
    }
  };

  const handleDelete = async (id, email) => {
    try {
      await API.delete(`/employees/${id}`);
      setEmployees(employees.filter(e => e._id !== id));
      setUsers(users.filter(u => u.email !== email));
      toast.success("কর্মী ও Account মুছে ফেলা হয়েছে!");
    } catch (error) {
      toast.error("মুছে ফেলা ব্যর্থ!");
    }
  };

  const handleDownload = (att) => {
    window.open(att.url, "_blank");
  };

  const handleToggleAccount = async (userId, isActive) => {
    try {
      await API.put(`/auth/users/${userId}/toggle`);
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: !u.isActive } : u));
      toast.success(isActive ? "Account নিষ্ক্রিয় করা হয়েছে!" : "Account সক্রিয় করা হয়েছে!");
    } catch (error) {
      toast.error("আপডেট ব্যর্থ!");
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("কমপক্ষে ৬ অক্ষরের Password দিন!");
      return;
    }
    try {
      await API.put(`/auth/users/${selectedUserId}/reset-password`, { newPassword });
      toast.success("Password Reset সফল হয়েছে!");
      setShowPasswordModal(false);
      setNewPassword("");
    } catch (error) {
      toast.error("Password Reset ব্যর্থ!");
    }
  };

  const handleViewProfile = async (email) => {
    try {
      setProfileLoading(true);
      setShowProfileModal(true);
      const { data } = await API.get(`/auth/users/email/${email}`);
      setSelectedProfile(data);
    } catch (error) {
      toast.error("Profile লোড ব্যর্থ!");
    } finally {
      setProfileLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "10px 12px",
    background: "#0f172a", border: "1px solid #334155",
    borderRadius: "8px", color: "#f1f5f9", fontSize: "14px", outline: "none"
  };

  if (loading) return <p style={{ color: "#94a3b8" }}>লোড হচ্ছে...</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ color: "#f1f5f9" }}>কর্মী তালিকা</h2>
          <p style={{ color: "#94a3b8", fontSize: "13px" }}>মোট {employees.length} জন কর্মী ({filtered.length} দেখাচ্ছে)</p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {/* ✅ Export Buttons */}
          <ExportButtons
            data={filtered.map(e => ({
              Name: e.name,
              Email: e.email,
              Phone: e.phone || "",
              Department: e.department || "",
              Position: e.position || "",
              Salary: e.salary || 0,
              Status: e.status === "active" ? "Active" : "Inactive",
              JoinDate: e.joinDate || ""
            }))}
            filename="employees"
            title="Employee List"
            columns={["Name", "Email", "Phone", "Department", "Position", "Salary", "Status", "Join Date"]}
            pdfData={filtered.map(e => [
              e.name, e.email, e.phone || "",
              e.department || "", e.position || "",
              e.salary || 0,
              e.status === "active" ? "Active" : "Inactive",
              e.joinDate || ""
            ])}
          />
        </div>

        <button onClick={() => handleOpen()} style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "10px 20px", background: "#6366f1",
          border: "none", borderRadius: "8px", color: "white",
          cursor: "pointer", fontWeight: "600"
        }}>
          <MdAdd size={20} /> নতুন কর্মী
        </button>
      </div>

      {/* Search & Filter */}
      <SearchFilter
        search={search}
        setSearch={setSearch}
        filters={filterConfig}
        activeFilters={activeFilters}
        setActiveFilters={setActiveFilters}
        placeholder="নাম, ইমেইল, বিভাগ বা পদবী দিয়ে খুঁজুন..."
      />

      {/* Table */}
      <div style={{ background: "#1e293b", borderRadius: "12px", border: "1px solid #334155", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#0f172a" }}>
              {["কর্মী", "বিভাগ", "পদবী", "বেতন", "Account", "অবস্থা", "কার্যক্রম"].map(h => (
                <th key={h} style={{ padding: "14px 16px", color: "#94a3b8", fontSize: "13px", textAlign: "left", fontWeight: "600" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                  কোনো কর্মী পাওয়া যায়নি
                </td>
              </tr>
            ) : filtered.map(emp => {
              const userAccount = getUserByEmail(emp.email);
              return (
                <tr key={emp._id} style={{ borderTop: "1px solid #334155" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "50%",
                        background: "#6366f1", display: "flex", alignItems: "center",
                        justifyContent: "center", overflow: "hidden",
                        color: "white", fontWeight: "700", fontSize: "12px"
                      }}>
                        {userAccount?.profileImage ? (
                          <img
                            src={userAccount.profileImage}
                            alt={emp.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : emp.avatar}
                      </div>
                      <div>
                        <p style={{ color: "#f1f5f9", fontSize: "14px" }}>{emp.name}</p>
                        <p style={{ color: "#94a3b8", fontSize: "12px" }}>{emp.email}</p>
                        {userAccount?.phone && (
                          <p style={{ color: "#64748b", fontSize: "11px" }}>{userAccount.phone}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", color: "#94a3b8", fontSize: "14px" }}>{emp.department}</td>
                  <td style={{ padding: "14px 16px", color: "#94a3b8", fontSize: "14px" }}>{emp.position}</td>
                  <td style={{ padding: "14px 16px", color: "#f1f5f9", fontSize: "14px" }}>৳{Number(emp.salary).toLocaleString()}</td>
                  <td style={{ padding: "14px 16px" }}>
                    {userAccount ? (
                      <span style={{
                        padding: "4px 10px", borderRadius: "20px", fontSize: "11px",
                        background: userAccount.isActive !== false ? "#22c55e22" : "#ef444422",
                        color: userAccount.isActive !== false ? "#22c55e" : "#ef4444"
                      }}>
                        {userAccount.isActive !== false ? "✅ সক্রিয়" : "❌ নিষ্ক্রিয়"}
                      </span>
                    ) : (
                      <span style={{ color: "#64748b", fontSize: "12px" }}>N/A</span>
                    )}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{
                      padding: "4px 12px", borderRadius: "20px", fontSize: "12px",
                      background: emp.status === "active" ? "#22c55e22" : "#ef444422",
                      color: emp.status === "active" ? "#22c55e" : "#ef4444"
                    }}>
                      {emp.status === "active" ? "সক্রিয়" : "নিষ্ক্রিয়"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      <button onClick={() => handleOpen(emp)} style={{
                        padding: "6px", background: "#6366f122", border: "none",
                        borderRadius: "6px", color: "#6366f1", cursor: "pointer"
                      }} title="সম্পাদনা"><MdEdit size={16} /></button>

                      {userAccount && (
                        <button
                          onClick={() => handleToggleAccount(userAccount._id, userAccount.isActive !== false)}
                          style={{
                            padding: "6px",
                            background: userAccount.isActive !== false ? "#f59e0b22" : "#22c55e22",
                            border: "none", borderRadius: "6px",
                            color: userAccount.isActive !== false ? "#f59e0b" : "#22c55e",
                            cursor: "pointer"
                          }}
                          title={userAccount.isActive !== false ? "Account নিষ্ক্রিয়" : "Account সক্রিয়"}>
                          {userAccount.isActive !== false ? <MdLock size={16} /> : <MdLockOpen size={16} />}
                        </button>
                      )}

                      {userAccount && (
                        <button
                          onClick={() => {
                            setSelectedUserId(userAccount._id);
                            setShowPasswordModal(true);
                          }}
                          style={{
                            padding: "6px", background: "#6366f122", border: "none",
                            borderRadius: "6px", color: "#6366f1", cursor: "pointer"
                          }}
                          title="Password Reset">
                          <MdKey size={16} />
                        </button>
                      )}

                      {/* View Profile */}
                      <button
                        onClick={() => handleViewProfile(emp.email)}
                        style={{
                          padding: "6px", background: "#22c55e22",
                          border: "none", borderRadius: "6px",
                          color: "#22c55e", cursor: "pointer"
                        }}
                        title="Profile দেখুন">
                        <MdPerson size={16} />
                      </button>

                      <button onClick={() => handleDelete(emp._id, emp.email)} style={{
                        padding: "6px", background: "#ef444422", border: "none",
                        borderRadius: "6px", color: "#ef4444", cursor: "pointer"
                      }} title="মুছুন"><MdDelete size={16} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Employee Modal */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "#00000088",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{
            background: "#1e293b", borderRadius: "12px", padding: "32px",
            width: "100%", maxWidth: "500px", border: "1px solid #334155"
          }}>
            <h3 style={{ color: "#f1f5f9", marginBottom: "24px" }}>
              {editingEmp ? "কর্মী সম্পাদনা" : "নতুন কর্মী যোগ"}
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {[
                { label: "নাম", key: "name", placeholder: "পূর্ণ নাম" },
                { label: "ইমেইল", key: "email", placeholder: "email@example.com" },
                { label: "Password", key: "password", placeholder: editingEmp ? "পরিবর্তন না করলে খালি রাখুন" : "Login Password" },
                { label: "ফোন", key: "phone", placeholder: "01XXXXXXXXX" },
                { label: "বিভাগ", key: "department", placeholder: "Engineering" },
                { label: "পদবী", key: "position", placeholder: "Developer" },
                { label: "বেতন", key: "salary", placeholder: "50000" },
              ].map(field => (
                <div key={field.key} style={{ gridColumn: field.key === "name" ? "1 / -1" : "auto" }}>
                  <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>
                    {field.label}
                  </label>
                  <input
                    placeholder={field.placeholder}
                    type={field.key === "password" ? "password" : "text"}
                    value={form[field.key]}
                    onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>
            <div style={{ marginTop: "16px" }}>
              <label style={{ color: "#94a3b8", fontSize: "13px", display: "block", marginBottom: "6px" }}>অবস্থা</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={inputStyle}>
                <option value="active">সক্রিয়</option>
                <option value="inactive">নিষ্ক্রিয়</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button onClick={handleSave} style={{
                flex: 1, padding: "12px", background: "#6366f1",
                border: "none", borderRadius: "8px", color: "white",
                cursor: "pointer", fontWeight: "600"
              }}>সেভ করুন</button>
              <button onClick={() => setShowModal(false)} style={{
                flex: 1, padding: "12px", background: "#334155",
                border: "none", borderRadius: "8px", color: "#f1f5f9",
                cursor: "pointer", fontWeight: "600"
              }}>বাতিল</button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordModal && (
        <div style={{
          position: "fixed", inset: 0, background: "#00000088",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{
            background: "#1e293b", borderRadius: "12px", padding: "32px",
            width: "100%", maxWidth: "400px", border: "1px solid #334155"
          }}>
            <h3 style={{ color: "#f1f5f9", marginBottom: "8px" }}>Password Reset</h3>
            <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "24px" }}>
              Employee এর নতুন Password দিন
            </p>
            <input
              type="password"
              placeholder="নতুন Password (কমপক্ষে ৬ অক্ষর)"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              style={{ ...inputStyle, marginBottom: "16px" }}
            />
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={handleResetPassword} style={{
                flex: 1, padding: "12px", background: "#6366f1",
                border: "none", borderRadius: "8px", color: "white",
                cursor: "pointer", fontWeight: "600"
              }}>Reset করুন</button>
              <button onClick={() => { setShowPasswordModal(false); setNewPassword(""); }} style={{
                flex: 1, padding: "12px", background: "#334155",
                border: "none", borderRadius: "8px", color: "#f1f5f9",
                cursor: "pointer", fontWeight: "600"
              }}>বাতিল</button>
            </div>
          </div>
        </div>
      )}


      {/* Profile Modal */}
      {showProfileModal && (
        <div style={{
          position: "fixed", inset: 0, background: "#00000088",
          display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 1000,
          padding: "20px" // ✅ যোগ করুন
        }}>
          <div style={{
            background: "#1e293b", borderRadius: "16px", padding: "32px",
            width: "100%", maxWidth: "500px", border: "1px solid #334155",
            maxHeight: "90vh", // ✅ যোগ করুন
            overflowY: "auto"  // ✅ যোগ করুন
          }}>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ color: "#f1f5f9" }}>Employee Profile</h3>
              <button onClick={() => { setShowProfileModal(false); setSelectedProfile(null); }} style={{
                background: "#334155", border: "none", borderRadius: "8px",
                color: "#94a3b8", cursor: "pointer", padding: "6px 12px", fontSize: "13px"
              }}>✕ বন্ধ করুন</button>
            </div>

            {profileLoading ? (
              <p style={{ color: "#94a3b8", textAlign: "center", padding: "40px" }}>লোড হচ্ছে...</p>
            ) : selectedProfile && (
              <div>

                {/* Profile Image & Basic Info */}
                <div style={{
                  display: "flex", alignItems: "center", gap: "20px",
                  padding: "20px", background: "#0f172a",
                  borderRadius: "12px", marginBottom: "20px"
                }}>
                  <div style={{
                    width: "80px", height: "80px", borderRadius: "50%",
                    background: "#6366f1", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    overflow: "hidden", flexShrink: 0,
                    border: "3px solid #6366f144"
                  }}>
                    {selectedProfile.profileImage ? (
                      <img
                        src={selectedProfile.profileImage}
                        alt={selectedProfile.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <span style={{ color: "white", fontSize: "28px", fontWeight: "700" }}>
                        {selectedProfile.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 style={{ color: "#f1f5f9", fontSize: "20px", fontWeight: "700" }}>
                      {selectedProfile.name}
                    </h3>
                    <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "4px" }}>
                      {selectedProfile.email}
                    </p>
                    <span style={{
                      display: "inline-block", marginTop: "8px",
                      padding: "4px 12px", background: "#6366f122",
                      borderRadius: "20px", color: "#6366f1", fontSize: "12px"
                    }}>Employee</span>
                  </div>
                </div>

                {/* Details */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[
                    { label: "📧 Email", value: selectedProfile.email },
                    { label: "📞 ফোন", value: selectedProfile.phone || "দেওয়া হয়নি" },
                    {
                      label: "🔒 Account অবস্থা",
                      value: selectedProfile.isActive !== false ? "✅ সক্রিয়" : "❌ নিষ্ক্রিয়",
                      color: selectedProfile.isActive !== false ? "#22c55e" : "#ef4444"
                    },
                    {
                      label: "📅 যোগদানের তারিখ",
                      value: new Date(selectedProfile.createdAt).toLocaleDateString("bn-BD")
                    },
                  ].map(item => (
                    <div key={item.label} style={{
                      display: "flex", justifyContent: "space-between",
                      alignItems: "center", padding: "12px 16px",
                      background: "#0f172a", borderRadius: "8px"
                    }}>
                      <span style={{ color: "#94a3b8", fontSize: "14px" }}>{item.label}</span>
                      <span style={{ color: item.color || "#f1f5f9", fontSize: "14px", fontWeight: "500" }}>
                        {item.value}
                      </span>
                    </div>
                  ))}


                  {/* Employee Details ও Login তথ্য */}
                  {(() => {
                    const emp = employees.find(e => e.email === selectedProfile.email);
                    if (!emp) return null;
                    return (
                      <>
                        {[
                          { label: "🏢 বিভাগ", value: emp.department || "দেওয়া হয়নি" },
                          { label: "💼 পদবী", value: emp.position || "দেওয়া হয়নি" },
                          { label: "💰 বেতন", value: emp.salary ? `৳${Number(emp.salary).toLocaleString()}` : "দেওয়া হয়নি" },
                          { label: "📱 যোগদান", value: emp.joinDate || "দেওয়া হয়নি" },
                        ].map(item => (
                          <div key={item.label} style={{
                            display: "flex", justifyContent: "space-between",
                            alignItems: "center", padding: "12px 16px",
                            background: "#0f172a", borderRadius: "8px"
                          }}>
                            <span style={{ color: "#94a3b8", fontSize: "14px" }}>{item.label}</span>
                            <span style={{ color: "#f1f5f9", fontSize: "14px", fontWeight: "500" }}>
                              {item.value}
                            </span>
                          </div>
                        ))}

                        {/* ✅ Login তথ্য */}
                        <div style={{
                          padding: "16px", background: "#6366f111",
                          borderRadius: "8px", border: "1px solid #6366f133"
                        }}>
                          <p style={{ color: "#6366f1", fontSize: "13px", fontWeight: "600", marginBottom: "12px" }}>
                            🔐 Login তথ্য
                          </p>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <div style={{
                              display: "flex", justifyContent: "space-between",
                              alignItems: "center", padding: "8px 12px",
                              background: "#0f172a", borderRadius: "6px"
                            }}>
                              <span style={{ color: "#94a3b8", fontSize: "13px" }}>📧 Login Email</span>
                              <span style={{
                                color: "#f1f5f9", fontSize: "13px",
                                fontWeight: "600", fontFamily: "monospace"
                              }}>{emp.loginEmail || emp.email}</span>
                            </div>
                            <div style={{
                              display: "flex", justifyContent: "space-between",
                              alignItems: "center", padding: "8px 12px",
                              background: "#0f172a", borderRadius: "6px"
                            }}>
                              <span style={{ color: "#94a3b8", fontSize: "13px" }}>🔑 Password</span>
                              <span style={{
                                color: "#22c55e", fontSize: "13px",
                                fontWeight: "700", fontFamily: "monospace"
                              }}>
                                {emp.loginPassword || "দেওয়া হয়নি"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                  <button
                    onClick={() => {
                      setShowProfileModal(false);
                      const emp = employees.find(e => e.email === selectedProfile.email);
                      if (emp) handleOpen(emp);
                    }}
                    style={{
                      flex: 1, padding: "10px", background: "#6366f1",
                      border: "none", borderRadius: "8px",
                      color: "white", cursor: "pointer", fontWeight: "600"
                    }}>
                    ✏️ সম্পাদনা করুন
                  </button>
                  <button
                    onClick={() => {
                      setSelectedUserId(selectedProfile._id);
                      setShowProfileModal(false);
                      setShowPasswordModal(true);
                    }}
                    style={{
                      flex: 1, padding: "10px", background: "#f59e0b22",
                      border: "1px solid #f59e0b44", borderRadius: "8px",
                      color: "#f59e0b", cursor: "pointer", fontWeight: "600"
                    }}>
                    🔑 Password Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}