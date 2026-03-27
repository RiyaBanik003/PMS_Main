import { useLocation } from "react-router-dom";
import SideNavbar from "../SideNavbar/SideNavbar";
import TopBar from "../../pages/TopBar";
import { useUserStore } from "../../store/userStore";
import Footer from "../Footer/Footer";
import { useState } from "react";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

export default function DashboardLayout({ children }) {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const getActiveNav = (path) => {
    if (path === "/dashboard") return "Overview";
    if (path === "/role") return "Role";
    if (path === "/user") return "User";
    if (path.startsWith("/editor") || path.startsWith("/view-project") || path.startsWith("/project")) return "Project";
    if (path.startsWith("/threads")) return "Threads";
    return "Overview";
  };

  const activeNav = getActiveNav(location.pathname);

  const user = useUserStore((state) => state.user);

  const CURRENT_USER = {
    initials: user?.name
      ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
      : "U",
    name: user?.name || "User",
    role: "Admin",
    bg: "#9FE1CB",
    color: "#085041",
  };

  const sidebarWidth = isSidebarCollapsed ? "80px" : "220px";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `${sidebarWidth} 1fr`,
        minHeight: "100vh",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        background: "#f0ede5",
        transition: "grid-template-columns 0.3s ease",
      }}
    >
      <SideNavbar
        activeNav={activeNav}
        onNavChange={() => { }}
        user={CURRENT_USER}
        onCollapse={setIsSidebarCollapsed}
        isCollapsed={isSidebarCollapsed}
      />

      {/* ── Main area ── */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minHeight: "100vh",
        width: "100%"
      }}>
        <TopBar
          greeting={`${getGreeting()}, ${CURRENT_USER.name} 👋`}
          dateLabel="Monday, March 16 — Week 11"
          user={CURRENT_USER}
          onNewTask={() => console.log("new task")}
          onFilter={() => console.log("filter")}
          onExport={() => console.log("export")}
        />

        <div
          style={{
            padding: 24,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 18,
            flex: 1,
          }}
        >
          {children}
        </div>

        <Footer />
      </div>
    </div>
  );
}