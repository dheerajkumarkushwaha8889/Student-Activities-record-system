import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Bell, BellRing, Check, CheckSquare, MessageSquare, AlertCircle, FileText, CheckCircle2, X } from "lucide-react";
import socket from "../socket";

export default function Header() {
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const dropdownRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user")) || {};

  // Get current page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/student") return "🎓 Student Profile & Stats";
    if (path === "/student/submit") return "➕ Submit New Activity";
    if (path === "/student/my") return "📄 My Activity Submissions";
    if (path === "/faculty") return "👨‍🏫 Faculty Dashboard";
    if (path === "/faculty/verify") return "✅ Verify Student Activities";
    if (path === "/admin") return "🛠 Admin control center";
    if (path === "/admin/records") return "📋 All Student Records";
    if (path === "/admin/portfolio") return "📁 Generate Reports & Portfolios";
    if (path === "/admin/add-faculty") return "👨‍🏫 Manage Faculty Directory";
    return "📊 Student Record System";
  };

  // Connect socket and fetch notifications
  useEffect(() => {
    if (!user.email) return;

    // Connect and register
    socket.connect();
    socket.emit("register", user.email);

    // Fetch initial notifications
    fetch(`https://student-activities-record-system.onrender.com/notifications?email=${user.email}`)
      .then((res) => res.json())
      .then((data) => setNotifications(data))
      .catch((err) => console.error("Error fetching notifications:", err));

    // Listen for new notifications
    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      
      // Trigger floating toast
      const newToast = {
        id: notification.id || Date.now(),
        message: notification.message,
        type: notification.type,
      };
      setToasts((prev) => [...prev, newToast]);

      // Auto dismiss toast after 4.5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 4500);
    };

    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("new_notification", handleNewNotification);
      socket.disconnect();
    };
  }, [user.email]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id) => {
    try {
      await fetch(`https://student-activities-record-system.onrender.com/notifications/${id}/read`, {
        method: "PUT",
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: 1 } : n))
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`https://student-activities-record-system.onrender.com/notifications/read-all?email=${user.email}`, {
        method: "PUT",
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: 1 })));
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "activity_submitted":
        return <FileText size={18} style={{ color: "#3b82f6" }} />;
      case "activity_updated":
        return <AlertCircle size={18} style={{ color: "#f59e0b" }} />;
      case "activity_verified":
        return <CheckCircle2 size={18} style={{ color: "#10b981" }} />;
      default:
        return <MessageSquare size={18} style={{ color: "#64748b" }} />;
    }
  };

  return (
    <div style={headerBar}>
      <h2 style={titleText}>{getPageTitle()}</h2>

      {/* Notification Area */}
      <div style={{ position: "relative" }} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={bellBtn(unreadCount > 0)}
          title="Notifications"
        >
          {unreadCount > 0 ? (
            <BellRing size={22} style={{ color: "#3b82f6" }} />
          ) : (
            <Bell size={22} style={{ color: "#64748b" }} />
          )}
          {unreadCount > 0 && (
            <span style={badgePulse}>
              <span style={badgeCount}>{unreadCount}</span>
            </span>
          )}
        </button>

        {/* Dropdown Box */}
        {isOpen && (
          <div style={dropdownMenu}>
            <div style={dropdownHeader}>
              <span style={{ fontWeight: "700", color: "#0f172a" }}>Notifications</span>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} style={readAllBtn}>
                  Mark all as read
                </button>
              )}
            </div>

            <div style={notificationList}>
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (!notif.isRead) markAsRead(notif.id);
                    }}
                    style={notificationItem(notif.isRead)}
                  >
                    <div style={iconContainer}>{getNotificationIcon(notif.type)}</div>
                    <div style={messageContainer}>
                      <p style={notifText(notif.isRead)}>{notif.message}</p>
                      <span style={timeText}>
                        {new Date(notif.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {!notif.isRead && <span style={unreadDot} />}
                  </div>
                ))
              ) : (
                <div style={emptyState}>
                  <p style={{ margin: 0, color: "#94a3b8" }}>No notifications yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Toast Notification Container */}
      <div style={toastContainer}>
        {toasts.map((t) => (
          <div key={t.id} style={toastCard}>
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", width: "100%" }}>
              <div style={toastIcon(t.type)}>
                {getNotificationIcon(t.type)}
              </div>
              <div style={{ flex: 1 }}>
                <h5 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "bold", color: "#0f172a" }}>
                  New Alert
                </h5>
                <p style={{ margin: 0, fontSize: "13px", color: "#475569", lineHeight: "1.4" }}>
                  {t.message}
                </p>
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
                style={toastCloseBtn}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Inline Keyframe Styles */}
      <style>{`
        @keyframes pulse-animation {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(59, 130, 246, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        @keyframes slide-in {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ================= STYLES ================= */

const headerBar = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 24px",
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(12px)",
  borderBottom: "1px solid #e2e8f0",
  borderRadius: "16px",
  boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05)",
  marginBottom: "24px",
  position: "sticky",
  top: 0,
  zIndex: 99,
};

const titleText = {
  margin: 0,
  fontSize: "20px",
  fontWeight: "800",
  background: "linear-gradient(135deg, #1e293b 30%, #475569 90%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const bellBtn = (hasUnread) => ({
  background: hasUnread ? "#eff6ff" : "#f8fafc",
  border: `1px solid ${hasUnread ? "#bfdbfe" : "#e2e8f0"}`,
  borderRadius: "50%",
  width: "42px",
  height: "42px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  position: "relative",
  transition: "all 0.3s ease",
  outline: "none",
  transform: "scale(1)",
  ':hover': {
    transform: "scale(1.05)",
    background: "#eff6ff",
  }
});

const badgePulse = {
  position: "absolute",
  top: "-3px",
  right: "-3px",
  background: "#3b82f6",
  borderRadius: "50%",
  minWidth: "18px",
  height: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  animation: "pulse-animation 2s infinite",
  border: "2px solid #fff",
};

const badgeCount = {
  fontSize: "10px",
  fontWeight: "bold",
  color: "white",
  padding: "0 2px",
};

const dropdownMenu = {
  position: "absolute",
  right: 0,
  top: "52px",
  width: "350px",
  background: "white",
  borderRadius: "16px",
  border: "1px solid #f1f5f9",
  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
  display: "flex",
  flexDirection: "column",
  maxHeight: "450px",
  overflow: "hidden",
  zIndex: 1000,
  animation: "slide-in 0.2s ease-out",
};

const dropdownHeader = {
  padding: "16px 20px",
  borderBottom: "1px solid #f1f5f9",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#f8fafc",
};

const readAllBtn = {
  background: "none",
  border: "none",
  color: "#2563eb",
  fontSize: "12px",
  fontWeight: "600",
  cursor: "pointer",
  padding: 0,
};

const notificationList = {
  overflowY: "auto",
  flex: 1,
};

const notificationItem = (isRead) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: "12px",
  padding: "14px 20px",
  borderBottom: "1px solid #f8fafc",
  cursor: "pointer",
  transition: "all 0.2s",
  background: isRead ? "white" : "#f0f7ff",
  ':hover': {
    background: "#f8fafc",
  }
});

const iconContainer = {
  marginTop: "2px",
  background: "#f8fafc",
  padding: "6px",
  borderRadius: "8px",
};

const messageContainer = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "4px",
};

const notifText = (isRead) => ({
  margin: 0,
  fontSize: "13px",
  color: isRead ? "#475569" : "#0f172a",
  fontWeight: isRead ? "500" : "600",
  lineHeight: "1.4",
});

const timeText = {
  fontSize: "11px",
  color: "#94a3b8",
};

const unreadDot = {
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  background: "#3b82f6",
  alignSelf: "center",
};

const emptyState = {
  padding: "40px 20px",
  textAlign: "center",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

/* TOAST STYLES */
const toastContainer = {
  position: "fixed",
  bottom: "24px",
  right: "24px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  zIndex: 9999,
};

const toastCard = {
  width: "320px",
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(12px)",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  padding: "16px",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  animation: "slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
};

const toastIcon = (type) => ({
  background: "#f8fafc",
  padding: "6px",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const toastCloseBtn = {
  background: "none",
  border: "none",
  color: "#94a3b8",
  cursor: "pointer",
  padding: "2px",
  borderRadius: "4px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s",
};
