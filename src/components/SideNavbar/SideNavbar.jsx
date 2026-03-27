import { useState } from "react";
import { COLORS, navItems} from "../../constants/dashboardData";
import { IMAGES } from "../../utils/constants";
import { Avatar, Icon } from "../ui/DashboardPrimitives";
import SidebarItem from "./SidebarItem";
/**
 * SideNavbar
 * Props:
 *   activeNav  {string}           – currently highlighted nav label
 *   onNavChange {(label) => void} – called when user clicks a nav item
 *   user        { initials, name, role } – logged-in user info
 */
export default function SideNavbar({ user, onCollapse, isCollapsed }) {
  const [isCollapsedState, setIsCollapsedState] = useState(isCollapsed || false);

  const toggleSidebar = () => {
    const newState = !isCollapsedState;
    setIsCollapsedState(newState);
    if (onCollapse) onCollapse(newState);
  };

  // Use the prop or state (prop takes priority if provided)
  const collapsed = isCollapsed !== undefined ? isCollapsed : isCollapsedState;

  return (
    <nav
      style={{
        background: "#fff",
        borderRight: "0.5px solid #e2dfd8",
        padding: "20px 0",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        minHeight: "100vh",
        width: collapsed ? "80px" : "220px",
        transition: "width 0.3s ease",
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
      }}
    >
      {/* Logo and Collapse Button */}
      <div
        style={{
          padding: "0 20px 18px",
          borderBottom: "0.5px solid #e2dfd8",
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          gap: 10,
        }}
      >
        {!collapsed && (
          <span style={{ fontSize: 14, fontWeight: 600, color: "#002D74" }}>
            <img
              src={IMAGES.logo}
              alt="Logo"
              style={{ height: "40px", width: "auto" }}
            />
          </span>
        )}

        {/* Collapse Toggle Button */}
        <button
          onClick={toggleSidebar}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "5px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "6px",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#f0f0f0"}
          onMouseLeave={(e) => e.currentTarget.style.background = "none"}
        >
          {collapsed ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          )}
        </button>
      </div>

      {/* Nav items */}
      <div style={{ flex: 1 }}>
        {navItems.map((item, index) => (
          <SidebarItem key={index} item={item} isCollapsed={collapsed} />
        ))}
      </div>

      {/* User profile at bottom */}
      <div
        style={{
          marginTop: "auto",
          padding: "14px 20px 0",
          borderTop: "0.5px solid #e2dfd8",
        }}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 0",
          justifyContent: collapsed ? "center" : "flex-start"
        }}>
          <Avatar initials={user?.initials ?? "SK"} bg="#9FE1CB" color="#085041" size={30} />
          {!collapsed && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#1a1917" }}>
                {user?.name ?? "Soham K."}
              </div>
              <div style={{ fontSize: 11, color: "#a8a59e" }}>{user?.role ?? "Admin"}</div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}