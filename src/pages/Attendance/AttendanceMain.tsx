// AttendanceMain.tsx
import { useState, useEffect } from "react";
import ReportsPage from "./ReportsPage";
import SettingsPage from "./SettingsPage";
import { LeaveManagement } from "./LeaveManagement";
import { HolidayManagement } from "./HolidayManagement";
import { AttendanceStudent } from "./AttendanceStudent";

export const AttendanceMain = () => {
  const [activeTab, setActiveTab] = useState("Attendance");

  useEffect(() => {
    document.title = `School Management - ${activeTab}`;
  }, [activeTab]);

  const tabs = [
    "Attendance",
    "Leave Management",
    "Holiday Management",
    "Reports",
    "Settings",
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "Attendance":
        return <AttendanceStudent />;
      case "Leave Management":
        return <LeaveManagement />;
      case "Holiday Management":
        return <HolidayManagement />;
      case "Reports":
        return <ReportsPage />;
      case "Settings":
        return <SettingsPage />;
      default:
        return <AttendanceStudent />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            School Attendance Management System
          </h1>
          <p className="text-gray-600">
            Manage attendance, leaves, holidays and reports
          </p>
        </div>

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                  }}
                  className={`${
                    activeTab === tab
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default AttendanceMain;
