"use client";
import React from "react";
import { Key, Trash2, Calendar } from "lucide-react";

export default function CodeLogsTable({ codeLogs, deleteCode }) {
  if (codeLogs.length === 0) {
    return (
      <div className="text-center py-16">
        <Key className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-xl text-gray-500 font-medium">No codes found</p>
        <p className="text-gray-400">Generated codes will appear here</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
        <h3 className="text-2xl font-bold text-white flex items-center space-x-3">
          <Key className="w-7 h-7" />
          <span>Code Management</span>
        </h3>
        <p className="text-indigo-100 mt-2">Track and manage all unlock codes</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Code Details</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Usage Info</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {codeLogs.map((code) => (
              <tr key={code.id} className="hover:bg-indigo-50 transition-colors duration-200">
                <td className="px-6 py-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-lg"><Key className="w-5 h-5 text-white" /></div>
                    <div>
                      <span className="font-mono text-lg font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">{code.code}</span>
                      <div className="text-xs text-gray-500 mt-1 flex items-center space-x-1"><Calendar className="w-3 h-3" /><span>Created: {new Date(code.created_at).toLocaleDateString()}</span></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">{code.subject}</span>
                </td>
                <td className="px-6 py-6">
                  <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-bold ${code.is_used ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${code.is_used ? "bg-red-500" : "bg-green-500"}`}></div>
                    {code.is_used ? "Used" : "Available"}
                  </span>
                </td>
                <td className="px-6 py-6">
                  {code.is_used ? (
                    <div className="space-y-2">
                      {code.used_by_name && <div className="font-semibold text-gray-900">{code.used_by_name}</div>}
                      <div className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">{code.used_by_device_id}</div>
                      {code.used_timestamp && <div className="text-xs text-gray-500">Used: {new Date(code.used_timestamp).toLocaleString()}</div>}
                    </div>
                  ) : (<span className="text-gray-500 italic">Not used yet</span>)}
                </td>
                <td className="px-6 py-6">
                  <button onClick={() => deleteCode(code.id)} className="flex items-center space-x-2 text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-2 rounded-lg transition-all duration-200 font-medium">
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
