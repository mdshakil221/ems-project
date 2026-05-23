import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import useWindowSize from "../../hooks/useWindowSize";
import { MdMenu, MdClose } from "react-icons/md";

export default function Layout() {
  const { isMobile } = useWindowSize();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0f172a" }}>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0,
            background: "#00000066", zIndex: 40
          }}
        />
      )}

      {/* Sidebar */}
      <div style={{
        position: isMobile ? "fixed" : "relative",
        left: isMobile ? (sidebarOpen ? "0" : "-240px") : "0",
        top: 0, bottom: 0, zIndex: 50,
        transition: "left 0.3s ease",
        width: "240px"
      }}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          isMobile={isMobile}
        />
        <main style={{ flex: 1, padding: isMobile ? "16px" : "24px", overflowY: "auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}