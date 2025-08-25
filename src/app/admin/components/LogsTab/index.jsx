"use client";
import React from "react";
import { RefreshCw, BarChart3 } from "lucide-react";
import AnalyticsCards from "./AnalyticsCards";
import ManualAccessGrant from "./ManualAccessGrant";
import UserLogsTable from "./UserLogsTable";
import CodeLogsTable from "./CodeLogsTable";

export default function LogsTab({
  logsLoading,
  loadLogs,
  analytics,
  userLogs,
  codeLogs,
  revokeAccess,
  deleteCode,
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Analytics Dashboard
        </h2>
        <button
          onClick={loadLogs}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {logsLoading ? (
        <div className="text-center py-16">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-purple-600 animate-pulse" />
            </div>
          </div>
          <p className="mt-4 text-xl text-gray-600 font-medium">
            Loading analytics...
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <AnalyticsCards analytics={analytics} />
          <ManualAccessGrant loadLogs={loadLogs} />
          <UserLogsTable userLogs={userLogs} revokeAccess={revokeAccess} />
          <CodeLogsTable codeLogs={codeLogs} deleteCode={deleteCode} />
        </div>
      )}
    </div>
  );
}
