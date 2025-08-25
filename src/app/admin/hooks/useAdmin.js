import { useState, useEffect } from "react";

const ADMIN_PASSWORD = "admin123"; // ← Change this to your desired password

export function useAdmin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loginError, setLoginError] = useState("");

  const [pdfUrls, setPdfUrls] = useState({
    "Assignment Solution": "",
    "Maths Basic": "",
  });
  const [dashboardAlert, setDashboardAlert] = useState("");

  const [codeSubject, setCodeSubject] = useState("Assignment Solution");
  const [customCode, setCustomCode] = useState("");
  const [codeAlert, setCodeAlert] = useState("");

  const [codeLogs, setCodeLogs] = useState([]);
  const [userLogs, setUserLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalCodes: 0,
    usedCodes: 0,
    activeUsers: 0,
    totalStudyTime: 0,
  });

  const loadLogs = async () => {
    setLogsLoading(true);
    try {
      const [codesResponse, usersResponse] = await Promise.all([
        fetch("/api/admin/logs?type=codes"),
        fetch("/api/admin/logs?type=users"),
      ]);
      const codesResult = await codesResponse.json();
      const usersResult = await usersResponse.json();
      if (codesResult.success) setCodeLogs(codesResult.codes);
      if (usersResult.success) {
        setUserLogs(usersResult.users);
        calculateAnalytics(codesResult.codes || [], usersResult.users || []);
      }
    } catch (error) {
      console.error("Error loading logs:", error);
    } finally {
      setLogsLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const response = await fetch("/api/chapter-data");
      const data = await response.json();
      setPdfUrls({
        "Assignment Solution": data["Assignment Solution"] || "",
        "Maths Basic": data["Maths Basic"] || "",
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn && activeTab === "dashboard") {
      loadDashboardData();
    }
    if (isLoggedIn && activeTab === "logs") {
      loadLogs();
    }
  }, [isLoggedIn, activeTab]);

  const login = () => {
    if (password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Invalid password. Please try again.");
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setPassword("");
  };

  const savePdfUrls = async () => {
    try {
      const promises = Object.entries(pdfUrls)
        .filter(([, url]) => url.trim())
        .map(([subject, url]) =>
          fetch("/api/chapter-data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subject, pdfUrl: url.trim() }),
          }),
        );
      await Promise.all(promises);
      setDashboardAlert("PDF URLs saved successfully!");
      setTimeout(() => setDashboardAlert(""), 3000);
    } catch (error) {
      console.error("Error saving PDF URLs:", error);
      setDashboardAlert("Error saving PDF URLs. Please try again.");
    }
  };

  const generateCode = async () => {
    try {
      const response = await fetch("/api/admin/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: codeSubject,
          customCode: customCode || undefined,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setCodeAlert(`Code generated successfully: ${result.code}`);
        setCustomCode("");
      } else {
        setCodeAlert(`Error: ${result.error}`);
      }
      setTimeout(() => setCodeAlert(""), 5000);
    } catch (error) {
      console.error("Error generating code:", error);
      setCodeAlert("Error generating code. Please try again.");
    }
  };

  const calculateAnalytics = (codes, users) => {
    const totalUsers = users.length;
    const totalCodes = codes.length;
    const usedCodes = codes.filter((code) => code.is_used).length;
    const activeUsers = users.filter((user) => {
      if (!user.last_activity) return false;
      const lastActivity = new Date(user.last_activity);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return lastActivity > dayAgo;
    }).length;
    const totalStudyTime = users.reduce(
      (total, user) => total + (user.total_study_time || 0),
      0,
    );
    setAnalytics({
      totalUsers,
      totalCodes,
      usedCodes,
      activeUsers,
      totalStudyTime,
    });
  };

  const deleteCode = async (codeId) => {
    if (!confirm("Are you sure you want to delete this code?")) return;
    try {
      const response = await fetch("/api/admin/logs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "code", id: codeId }),
      });
      const result = await response.json();
      if (result.success) loadLogs();
      else alert("Error deleting code: " + result.error);
    } catch (error) {
      console.error("Error deleting code:", error);
      alert("Error deleting code. Please try again.");
    }
  };

  const revokeAccess = async (deviceId) => {
    if (!confirm("Are you sure you want to revoke access for this user?"))
      return;

    try {
      console.log("Revoking access for device:", deviceId);
      const response = await fetch("/api/admin/logs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "user", deviceId }),
      });

      console.log("Revoke response status:", response.status);
      const result = await response.json();
      console.log("Revoke result:", result);

      if (result.success) {
        console.log("Successfully revoked access, reloading logs...");
        await loadLogs(); // Reload the data
      } else {
        console.error("Failed to revoke access:", result.error);
        alert("Error revoking access: " + result.error);
      }
    } catch (error) {
      console.error("Error revoking access:", error);
      alert("Error revoking access. Please try again.");
    }
  };

  return {
    isLoggedIn,
    password,
    setPassword,
    login,
    loginError,
    logout,
    activeTab,
    setActiveTab,
    pdfUrls,
    setPdfUrls,
    dashboardAlert,
    savePdfUrls,
    codeSubject,
    setCodeSubject,
    customCode,
    setCustomCode,
    codeAlert,
    generateCode,
    logsLoading,
    loadLogs,
    analytics,
    userLogs,
    codeLogs,
    revokeAccess,
    deleteCode,
  };
}
