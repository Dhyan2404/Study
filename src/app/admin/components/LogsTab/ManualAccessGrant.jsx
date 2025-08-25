"use client";
import React, { useState } from "react";
import { UserCheck } from "lucide-react";

export default function ManualAccessGrant({ loadLogs }) {
  const [deviceId, setDeviceId] = useState("");
  const [userName, setUserName] = useState("");
  const [subject, setSubject] = useState("Assignment Solution");
  const [alert, setAlert] = useState("");

  const grantAccess = async () => {
    if (!deviceId.trim()) {
      setAlert("Device ID is required");
      return;
    }

    try {
      const response = await fetch("/api/admin/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "grantAccess",
          deviceId: deviceId.trim(),
          userName: userName.trim() || undefined,
          subject: subject,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setAlert(`Access granted successfully for ${subject}`);
        setDeviceId("");
        setUserName("");
        loadLogs();
      } else {
        setAlert(`Error: ${result.error}`);
      }

      setTimeout(() => setAlert(""), 5000);
    } catch (error) {
      console.error("Error granting access:", error);
      setAlert("Error granting access. Please try again.");
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-8 shadow-lg">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-full">
          <UserCheck className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">
          Grant Manual Access
        </h3>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Device ID *
          </label>
          <input
            type="text"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            placeholder="device_abc123..."
            className="w-full p-4 border-2 border-gray-200 rounded-xl bg-white focus:ring-4 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-gray-900 font-medium"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            User Name (optional)
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="John Doe"
            className="w-full p-4 border-2 border-gray-200 rounded-xl bg-white focus:ring-4 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-gray-900 font-medium"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Subject to Grant
          </label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl bg-white focus:ring-4 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-gray-900 font-medium"
          >
            <option value="Assignment Solution">Assignment Solution</option>
            <option value="Maths Basic">Maths Basic</option>
            <option value="all">All Subjects</option>
          </select>
        </div>
      </div>

      <button
        onClick={grantAccess}
        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        🎉 Grant Access
      </button>

      {alert && (
        <div
          className={`mt-6 p-4 rounded-xl border-2 ${
            alert.includes("Error")
              ? "bg-red-50 text-red-800 border-red-200"
              : "bg-green-50 text-green-800 border-green-200"
          } font-medium`}
        >
          {alert}
        </div>
      )}
    </div>
  );
}
