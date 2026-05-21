import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true); // ✅ token check হচ্ছে কিনা

  // ✅ App start হলে token verify করুন
  useEffect(() => {
    const stored = JSON.parse(sessionStorage.getItem("ems_user"));
    if (stored?.token) {
      API.get("/auth/profile")
        .then(({ data }) => {
          setUser({ ...stored, ...data });
        })
        .catch(() => {
          // Token invalid হলে logout করুন
          sessionStorage.removeItem("ems_user");
          setUser(null);
        })
        .finally(() => {
          setChecking(false);
        });
    } else {
      setChecking(false);
    }
  }, []);

  const login = async (email, password, role) => {
    try {
      setLoading(true);
      const { data } = await API.post("/auth/login", { email, password, role });
      sessionStorage.setItem("ems_user", JSON.stringify(data));
      setUser(data);
      toast.success("Login সফল হয়েছে!");
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Login ব্যর্থ!");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem("ems_user");
    setUser(null);
  };

  const updateUser = (newData) => {
    const updated = { ...user, ...newData };
    sessionStorage.setItem("ems_user", JSON.stringify(updated));
    setUser(updated);
  };

  // ✅ Token check শেষ না হলে loading দেখান
  if (checking) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f172a"
      }}>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ color: "#6366f1", fontSize: "24px" }}>EMS</h2>
          <p style={{ color: "#94a3b8", marginTop: "8px" }}>লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);