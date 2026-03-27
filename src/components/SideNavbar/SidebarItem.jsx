import React, { useState } from "react";
import { Icon } from "../ui/DashboardPrimitives";
import { useNavigate } from "react-router-dom";

const SidebarItem = ({ item, isCollapsed }) => {
  const [open, setOpen] = useState(item.label === "Threads");
  const navigate = useNavigate();

  const handleClick = () => {
    if (item.children) {
      if (!isCollapsed) {
        setOpen(!open); // toggle dropdown only when expanded
      } else {
        // When collapsed, navigate to first child or handle differently
        if (item.children && item.children[0]) {
          navigate(item.children[0].path);
        }
      }
    } else {
      navigate(item.path);
    }
  };

  // Tooltip for collapsed mode
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      {/* Main Item */}
      <div
        className="nav-button"
        onClick={handleClick}
        onMouseEnter={() => isCollapsed && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: isCollapsed ? "center" : "flex-start",
          gap: "10px",
          cursor: "pointer",
          padding: "10px",
          position: "relative",
        }}
      >
        <Icon type={item.icon} />
        {!isCollapsed && <span>{item.label}</span>}

        {/* Dropdown indicator for collapsed mode */}
        {!isCollapsed && item.children && (
          <span style={{ marginLeft: "auto", fontSize: "12px" }}>
            {open ? "▼" : "▶"}
          </span>
        )}
      </div>

      {/* Tooltip for collapsed mode */}
      {isCollapsed && showTooltip && (
        <div
          style={{
            position: "fixed",
            left: "90px",
            background: "#333",
            color: "#fff",
            padding: "5px 10px",
            borderRadius: "6px",
            fontSize: "12px",
            whiteSpace: "nowrap",
            zIndex: 1000,
            pointerEvents: "none",
          }}
        >
          {item.label}
        </div>
      )}

      {/* Submenu - only show when expanded */}
      {item.children && open && !isCollapsed && (
        <div style={{ paddingLeft: "30px" }}>
          {item.children.map((sub, index) => (
            <div
              key={index}
              onClick={() => navigate(sub.path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 0",
                cursor: "pointer",
                fontSize: "14px",
                color: "#555",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f5f5f5"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <Icon type="thread" size="small" />
              <span>{sub.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SidebarItem;