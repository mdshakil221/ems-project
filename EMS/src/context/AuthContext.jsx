import { createContext, useContext, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("ems_user")) || null
  );
  const [loading, setLoading] = useState(false);

  const login = async (email, password, role) => {
    try {
      setLoading(true);
      const { data } = await API.post("/auth/login", { email, password, role });
      localStorage.setItem("ems_user", JSON.stringify(data));
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
    localStorage.removeItem("ems_user");
    setUser(null);
  };

  const updateUser = (newData) => {
    const updated = { ...user, ...newData };
    localStorage.setItem("ems_user", JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);