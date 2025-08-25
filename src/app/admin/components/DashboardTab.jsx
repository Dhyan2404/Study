"use client";
import React from "react";

export default function DashboardTab({ pdfUrls, setPdfUrls, savePdfUrls, dashboardAlert }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        PDF Management
      </h2>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assignment Solution PDF URL
          </label>
          <input
            type="url"
            value={pdfUrls["Assignment Solution"]}
            onChange={(e) =>
              setPdfUrls((prev) => ({
                ...prev,
                "Assignment Solution": e.target.value,
              }))
            }
            placeholder="https://drive.google.com/file/d/..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maths Basic PDF URL
          </label>
          <input
            type="url"
            value={pdfUrls["Maths Basic"]}
            onChange={(e) =>
              setPdfUrls((prev) => ({
                ...prev,
                "Maths Basic": e.target.value,
              }))
            }
            placeholder="https://drive.google.com/file/d/..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <button
        onClick={savePdfUrls}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Save PDF URLs
      </button>

      {dashboardAlert && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            dashboardAlert.includes("Error")
              ? "bg-red-100 text-red-800 border border-red-200"
              : "bg-green-100 text-green-800 border border-green-200"
          }`}
        >
          {dashboardAlert}
        </div>
      )}
    </div>
  );
}
