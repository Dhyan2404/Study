"use client";

import React from "react";
import { Shield, Key, Users, FileText } from "lucide-react";
import { useAdmin } from "./hooks/useAdmin";
import LoginPage from "./components/LoginPage";
import DashboardTab from "./components/DashboardTab";
import CodeGeneratorTab from "./components/CodeGeneratorTab";
import LogsTab from "./components/LogsTab/index";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: FileText },
  { id: "codes", label: "Code Generator", icon: Key },
  { id: "logs", label: "Logs", icon: Users },
];

export default function AdminPage() {
  const {
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
  } = useAdmin();

  if (!isLoggedIn) {
    return (
      <LoginPage
        password={password}
        setPassword={setPassword}
        login={login}
        loginError={loginError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                StudyUnlock Admin
              </h1>
            </div>
            <button
              onClick={logout}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "dashboard" && (
              <DashboardTab
                pdfUrls={pdfUrls}
                setPdfUrls={setPdfUrls}
                savePdfUrls={savePdfUrls}
                dashboardAlert={dashboardAlert}
              />
            )}
            {activeTab === "codes" && (
              <CodeGeneratorTab
                codeSubject={codeSubject}
                setCodeSubject={setCodeSubject}
                customCode={customCode}
                setCustomCode={setCustomCode}
                generateCode={generateCode}
                codeAlert={codeAlert}
              />
            )}
            {activeTab === "logs" && (
              <LogsTab
                logsLoading={logsLoading}
                loadLogs={loadLogs}
                analytics={analytics}
                userLogs={userLogs}
                codeLogs={codeLogs}
                revokeAccess={revokeAccess}
                deleteCode={deleteCode}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
