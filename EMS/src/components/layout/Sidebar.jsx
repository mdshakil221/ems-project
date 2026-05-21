import { NavLink } from "react-router-dom";
import { MdDashboard, MdPeople, MdAccessTime, MdEventNote, MdTask, MdNotifications, MdPayment, MdBarChart, MdStar, MdAccountCircle, 
         MdCampaign, MdBeachAccess, MdDescription   } from "react-icons/md";

const menu = [
  { path: "/", label: "Dashboard", icon: <MdDashboard size={20} /> },
  { path: "/admin-profile", label: "My Profile", icon: <MdAccountCircle size={20} /> },
  { path: "/employees", label: "Employees", icon: <MdPeople size={20} /> },
  { path: "/attendance", label: "Attendance", icon: <MdAccessTime size={20} /> },
  { path: "/leave", label: "Leave", icon: <MdEventNote size={20} /> },
  { path: "/tasks", label: "Tasks", icon: <MdTask size={20} /> },
  { path: "/salary", label: "Salary", icon: <MdPayment size={20} /> },
  { path: "/announcements", label: "Announcements", icon: <MdCampaign size={20} /> },
  { path: "/performance", label: "Performance", icon: <MdStar size={20} /> },
  { path: "/reports", label: "Reports", icon: <MdBarChart size={20} /> },
  { path: "/notifications", label: "Notifications", icon: <MdNotifications size={20} /> },
  { path: "/holidays", label: "Holidays", icon: <MdBeachAccess size={20} /> },
  { path: "/documents", label: "Documents", icon: <MdDescription size={20} /> },
];

export default function Sidebar() {
  return (
    <div style={{
      width: "240px", background: "#1e293b",
      borderRight: "1px solid #334155", padding: "24px 16px",
      display: "flex", flexDirection: "column"
    }}>
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <h2 style={{ color: "#6366f1", fontSize: "22px", fontWeight: "700" }}>EMS</h2>
        <p style={{ color: "#94a3b8", fontSize: "12px" }}>Management System</p>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {menu.map((item) => (
          <NavLink key={item.path} to={item.path} end={item.path === "/"}
            style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: "12px",
              padding: "12px 16px", borderRadius: "8px",
              color: isActive ? "#6366f1" : "#94a3b8",
              background: isActive ? "#0f172a" : "transparent",
              textDecoration: "none", fontSize: "14px", fontWeight: "500",
              transition: "all 0.2s"
            })}>
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}