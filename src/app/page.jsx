"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Clock,
  Lock,
  CheckCircle,
  Sparkles,
  Moon,
  Sun,
  User,
  Star,
  BookOpen,
  Award,
  Zap,
} from "lucide-react";

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true);
  const [showNameInput, setShowNameInput] = useState(false);
  const [userName, setUserName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [unlockedSubjects, setUnlockedSubjects] = useState([]);
  const [studyTime, setStudyTime] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [codeInput, setCodeInput] = useState("");
  const [codeStatus, setCodeStatus] = useState(""); // 'success', 'error', ''
  const [deviceId, setDeviceId] = useState("");
  const [currentPdf, setCurrentPdf] = useState(null);
  const [pdfUrls, setPdfUrls] = useState({});

  const timerRef = useRef(null);
  const starsRef = useRef([]);

  // Generate device ID on first load
  useEffect(() => {
    let id = localStorage.getItem("deviceId");
    if (!id) {
      id =
        "device_" +
        Math.random().toString(36).substr(2, 9) +
        Date.now().toString(36);
      localStorage.setItem("deviceId", id);
    }
    setDeviceId(id);
  }, []);

  // Load user data
  useEffect(() => {
    const savedName = localStorage.getItem("userName");
    const savedTime = localStorage.getItem("studyTime");
    const unlocked = JSON.parse(
      localStorage.getItem("unlockedSubjects") || "[]",
    );
    const theme = localStorage.getItem("darkMode");

    if (savedName) {
      setUserName(savedName);
    } else if (deviceId) {
      // Check if user exists in database
      fetchUserData();
    }

    if (savedTime) {
      setStudyTime(parseInt(savedTime));
    }

    setUnlockedSubjects(unlocked);

    if (theme === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, [deviceId]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/user-data?deviceId=${deviceId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUserName(data.user.name || "");
          setUnlockedSubjects(data.user.unlocked_subjects || []);
          if (data.user.name) {
            localStorage.setItem("userName", data.user.name);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const updateUserActivity = async () => {
    if (!deviceId) return;

    try {
      await fetch("/api/user-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: deviceId,
          name: userName,
          studyTime: studyTime,
          action: "updateActivity",
        }),
      });
    } catch (error) {
      console.error("Error updating user activity:", error);
    }
  };

  const updateStudyTime = async () => {
    if (!deviceId || studyTime === 0) return;

    try {
      await fetch("/api/user-data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: deviceId,
          studyTime: studyTime,
        }),
      });
    } catch (error) {
      console.error("Error updating study time:", error);
    }
  };

  const saveUserName = async () => {
    if (!nameInput.trim()) return;

    try {
      const response = await fetch("/api/user-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: deviceId,
          name: nameInput.trim(),
        }),
      });

      if (response.ok) {
        setUserName(nameInput.trim());
        localStorage.setItem("userName", nameInput.trim());
        setShowNameInput(false);
        setNameInput("");
      }
    } catch (error) {
      console.error("Error saving user name:", error);
    }
  };

  // Study timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setStudyTime((prev) => {
        const newTime = prev + 1;
        localStorage.setItem("studyTime", newTime.toString());
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  // Splash screen timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      // Show name input if no name is set
      if (!userName && deviceId) {
        setTimeout(() => setShowNameInput(true), 500);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [userName, deviceId]);

  // Load PDF URLs from backend
  useEffect(() => {
    fetchPdfUrls();
  }, []);

  // Track user activity periodically
  useEffect(() => {
    if (deviceId && userName) {
      // Update activity on initial load
      updateUserActivity();

      // Update study time every 30 seconds
      const activityInterval = setInterval(() => {
        updateStudyTime();
      }, 30000);

      return () => clearInterval(activityInterval);
    }
  }, [deviceId, userName, studyTime]);

  // Update activity when user interacts
  useEffect(() => {
    if (deviceId && userName) {
      updateUserActivity();
    }
  }, [unlockedSubjects]);

  const fetchPdfUrls = async () => {
    try {
      const response = await fetch("/api/chapter-data");
      if (response.ok) {
        const data = await response.json();
        setPdfUrls(data);
      }
    } catch (error) {
      console.error("Error fetching PDF URLs:", error);
    }
  };

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubjectClick = (subject) => {
    if (unlockedSubjects.includes(subject)) {
      // Navigate to PDF viewer
      const pdfUrl = pdfUrls[subject];
      if (pdfUrl) {
        setCurrentPdf({ subject, url: convertGoogleDriveUrl(pdfUrl) });
      }
    } else {
      // Show unlock dialog
      setSelectedSubject(subject);
      setShowCodeDialog(true);
      setCodeInput("");
      setCodeStatus("");
    }
  };

  const handleMasterCodeClick = () => {
    setSelectedSubject("all");
    setShowCodeDialog(true);
    setCodeInput("");
    setCodeStatus("");
  };

  const convertGoogleDriveUrl = (url) => {
    if (url.includes("drive.google.com")) {
      const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }
    return url;
  };

  const submitCode = async () => {
    if (!codeInput.trim()) return;

    try {
      const response = await fetch("/api/unlock-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: codeInput.trim(),
          deviceId: deviceId,
          subject: selectedSubject,
          userName: userName,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setCodeStatus("success");
        const newUnlocked = [...unlockedSubjects, ...result.unlockedSubjects];
        const uniqueUnlocked = [...new Set(newUnlocked)];
        setUnlockedSubjects(uniqueUnlocked);
        localStorage.setItem(
          "unlockedSubjects",
          JSON.stringify(uniqueUnlocked),
        );

        setTimeout(() => {
          setShowCodeDialog(false);
          setCodeStatus("");
        }, 1500);
      } else {
        setCodeStatus("error");
        setTimeout(() => setCodeStatus(""), 2000);
      }
    } catch (error) {
      console.error("Error submitting code:", error);
      setCodeStatus("error");
      setTimeout(() => setCodeStatus(""), 2000);
    }
  };

  const generateStars = () => {
    const stars = [];
    for (let i = 0; i < 100; i++) {
      stars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        animationDelay: Math.random() * 4,
      });
    }
    return stars;
  };

  useEffect(() => {
    starsRef.current = generateStars();
  }, []);

  if (currentPdf) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
          <button
            onClick={() => setCurrentPdf(null)}
            className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 font-medium"
          >
            ← Back to Subjects
          </button>
          <h1 className="text-xl font-bold">{currentPdf.subject}</h1>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6" />
            <span className="font-medium">Study Mode</span>
          </div>
        </div>
        <div className="h-[calc(100vh-80px)] relative">
          <iframe
            src={currentPdf.url}
            className="w-full h-full border-0"
            title={`${currentPdf.subject} PDF`}
            style={{
              pointerEvents: "auto",
            }}
            onContextMenu={(e) => e.preventDefault()}
            sandbox="allow-same-origin allow-scripts"
          />
          {/* Enhanced anti-download and popout overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "transparent",
              userSelect: "none",
              WebkitUserSelect: "none",
              zIndex: 1000,
            }}
          />
          {/* Block popout button specifically */}
          <div
            className="absolute top-0 right-0 w-20 h-20 bg-white pointer-events-auto"
            style={{ zIndex: 1001 }}
          />
          <style jsx>{`
            iframe {
              pointer-events: auto !important;
            }
            /* Hide Google Drive toolbar and popout buttons */
            iframe::before {
              content: '';
              position: absolute;
              top: 0;
              right: 0;
              width: 100px;
              height: 100px;
              background: rgba(255, 255, 255, 1);
              z-index: 1001;
              pointer-events: auto;
            }
            /* Additional CSS to block Google Drive UI elements */
            iframe[src*="drive.google.com"] {
              filter: none;
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (showSplash) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          {starsRef.current.map((star) => (
            <div
              key={star.id}
              className="absolute bg-white rounded-full animate-pulse"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity,
                animationDelay: `${star.animationDelay}s`,
              }}
            />
          ))}
        </div>

        <div className="text-center z-10 px-6">
          <div className="mb-8 relative">
            <div className="absolute inset-0 animate-ping">
              <Sparkles className="w-20 h-20 text-yellow-400 mx-auto animate-spin" />
            </div>
            <Sparkles className="w-20 h-20 text-yellow-400 mx-auto animate-spin relative z-10" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-pulse bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
            Welcome to StudyUnlock
          </h1>
          <p className="text-2xl text-blue-200 animate-bounce font-medium">
            Made with ❤️ by Dhyan
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <div
              className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce"
              style={{ animationDelay: "0s" }}
            ></div>
            <div
              className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${darkMode ? "dark bg-gray-900" : "bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50"}`}
    >
      {/* Enhanced animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {starsRef.current.map((star) => (
          <div
            key={star.id}
            className="absolute bg-gradient-to-r from-purple-400 to-blue-400 dark:from-purple-300 dark:to-blue-300 rounded-full animate-pulse"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity * 0.4,
              animationDelay: `${star.animationDelay}s`,
            }}
          />
        ))}
        {/* Floating gradient orbs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-gradient-to-r from-yellow-400 to-red-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-10 left-20 w-72 h-72 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Theme toggle */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleTheme}
          className="p-4 bg-white/20 dark:bg-gray-800/20 backdrop-blur-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20"
        >
          {darkMode ? (
            <Sun className="w-6 h-6 text-yellow-400" />
          ) : (
            <Moon className="w-6 h-6 text-purple-600" />
          )}
        </button>
      </div>

      {/* User greeting */}
      {userName && (
        <div className="absolute top-6 left-6 z-20">
          <div className="flex items-center space-x-3 bg-white/20 dark:bg-gray-800/20 backdrop-blur-lg rounded-full px-6 py-3 shadow-xl border border-white/20">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-800 dark:text-white font-medium">
              Hello, {userName}!
            </span>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-full mb-6 shadow-lg">
            <Star className="w-5 h-5" />
            <span className="font-medium">Premium Study Platform</span>
            <Star className="w-5 h-5" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
            StudyUnlock
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            🚀 Unlock your potential with premium study materials. Enter your
            codes and start your learning journey!
          </p>
        </div>

        {/* Enhanced subject cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {["Assignment Solution", "Maths Basic"].map((subject, index) => (
            <div
              key={subject}
              onClick={() => handleSubjectClick(subject)}
              className={`relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 cursor-pointer transform hover:scale-105 hover:-translate-y-2 p-8 border border-white/20 group ${
                unlockedSubjects.includes(subject)
                  ? "ring-4 ring-green-400/50"
                  : ""
              }`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${
                  index === 0
                    ? "from-purple-500/10 to-blue-500/10"
                    : "from-blue-500/10 to-indigo-500/10"
                } opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              ></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {subject}
                  </h3>
                  <div className="relative">
                    {unlockedSubjects.includes(subject) ? (
                      <div className="relative">
                        <CheckCircle className="w-10 h-10 text-green-500 animate-pulse" />
                        <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-25"></div>
                      </div>
                    ) : (
                      <Lock className="w-10 h-10 text-gray-400 group-hover:text-purple-500 transition-colors" />
                    )}
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                  {unlockedSubjects.includes(subject)
                    ? "🎉 Unlocked! Click to access your premium study materials"
                    : "🔐 Enter your unlock code to access exclusive content"}
                </p>

                {/* Enhanced progress bar */}
                <div
                  className={`w-full h-3 rounded-full overflow-hidden ${
                    unlockedSubjects.includes(subject)
                      ? "bg-green-100 dark:bg-green-900"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                      unlockedSubjects.includes(subject)
                        ? "w-full bg-gradient-to-r from-green-400 to-emerald-500"
                        : "w-0 bg-gray-400"
                    }`}
                  />
                </div>

                {unlockedSubjects.includes(subject) && (
                  <div className="flex items-center justify-center mt-4">
                    <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                      <Award className="w-5 h-5" />
                      <span className="font-medium">Access Granted</span>
                      <Zap className="w-5 h-5 animate-pulse" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced master code button */}
        <div className="text-center mb-12">
          <button
            onClick={handleMasterCodeClick}
            className="group relative inline-flex items-center space-x-3 px-10 py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl"
          >
            <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Star className="w-6 h-6 group-hover:animate-spin" />
            <span className="relative z-10">Have a Master Code?</span>
            <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
          </button>
        </div>
      </div>

      {/* Enhanced study timer footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border-t border-white/20 p-6 shadow-2xl">
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-full">
            <Clock className="w-5 h-5 animate-pulse" />
            <span className="font-bold">Study Time</span>
          </div>
          <span className="text-2xl font-mono font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-xl">
            {formatTime(studyTime)}
          </span>
        </div>
      </div>

      {/* Name input dialog */}
      {showNameInput && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full max-w-md shadow-3xl border border-white/20 transform animate-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome to StudyUnlock!
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Let's personalize your learning experience
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter your name"
                className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-medium text-lg"
                onKeyPress={(e) => e.key === "Enter" && saveUserName()}
                autoFocus
              />

              <button
                onClick={saveUserName}
                disabled={!nameInput.trim()}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                Start Learning Journey 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced code dialog */}
      {showCodeDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full max-w-md shadow-3xl border border-white/20 transform animate-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                {selectedSubject === "all" ? (
                  <Star className="w-8 h-8 text-white" />
                ) : (
                  <Lock className="w-8 h-8 text-white" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {selectedSubject === "all"
                  ? "Master Code Unlock"
                  : `Unlock ${selectedSubject}`}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {selectedSubject === "all"
                  ? "Get access to all premium content"
                  : "Enter your exclusive access code"}
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder="Enter unlock code"
                className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-mono text-lg text-center uppercase"
                onKeyPress={(e) => e.key === "Enter" && submitCode()}
                autoFocus
              />

              {codeStatus === "success" && (
                <div className="p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-xl animate-pulse text-center font-medium">
                  ✅ Success! Access granted. Welcome to premium content!
                </div>
              )}

              {codeStatus === "error" && (
                <div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-xl animate-shake text-center font-medium">
                  ❌ Invalid or expired code. Please check and try again.
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCodeDialog(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={submitCode}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-bold"
                >
                  Unlock 🔓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
