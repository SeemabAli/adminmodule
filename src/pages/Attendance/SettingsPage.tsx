/* eslint-disable @typescript-eslint/no-unused-vars */
// SettingsPage.tsx (continued)
import { useState, type SetStateAction } from "react";
import { notify } from "@/lib/notify";
import { Button } from "@/common/components/ui/Button";
import { logger } from "@/lib/logger";
import { handleErrorNotification } from "@/utils/exceptions";
import axios from "axios";

const SettingsPage = () => {
  const [loading, setLoading] = useState(false);
  const [editingTimeLimit, setEditingTimeLimit] = useState("--:-- --");
  const [startTime, setStartTime] = useState("--:-- --");
  const [endTime, setEndTime] = useState("--:-- --");
  const [lateThreshold, setLateThreshold] = useState("0");
  const [smsNotifications, setSmsNotifications] = useState("Enabled");
  const [emailNotifications, setEmailNotifications] = useState("Enabled");
  const [activeTab, setActiveTab] = useState("Settings");

  const handleSaveSettings = async () => {
    try {
      setLoading(true);

      const requestData = {
        userName: localStorage.getItem("username"),
        sessionKey: localStorage.getItem("sessionKey"),
        organizationID: localStorage.getItem("organizationID") ?? "4",
        branchID: localStorage.getItem("branchID") ?? 3,
        editingTimeLimit,
        startTime,
        endTime,
        lateThreshold,
        smsNotifications,
        emailNotifications,
      };

      const response = await axios.post(
        "http://192.168.100.14/EBridge/api/TssEBridge/SaveSettings",
        requestData,
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      const result = response.data;

      if (result.valid) {
        notify.success("Settings saved successfully.");
      } else {
        notify.error(result.message ?? "Failed to save settings.");
      }
    } catch (error) {
      logger.error(error);
      handleErrorNotification(error, "Settings");
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);

      const requestData = {
        userName: localStorage.getItem("username"),
        sessionKey: localStorage.getItem("sessionKey"),
        organizationID: localStorage.getItem("organizationID") ?? "4",
        branchID: localStorage.getItem("branchID") ?? 3,
      };

      const response = await axios.post(
        "http://192.168.100.14/EBridge/api/TssEBridge/GetSettings",
        requestData,
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      const result = response.data;

      if (result.valid && result.data) {
        const settings = result.data;
        setEditingTimeLimit(settings.editingTimeLimit ?? "--:-- --");
        setStartTime(settings.startTime ?? "--:-- --");
        setEndTime(settings.endTime ?? "--:-- --");
        setLateThreshold(settings.lateThreshold ?? "0");
        setSmsNotifications(settings.smsNotifications ?? "Enabled");
        setEmailNotifications(settings.emailNotifications ?? "Enabled");
      } else {
        notify.error(result.message ?? "Failed to retrieve settings.");
      }
    } catch (error) {
      logger.error(error);
      handleErrorNotification(error, "Settings");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: SetStateAction<string>) => {
    setActiveTab(tab);
  };

  return (
    <div>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Attendance Settings</h2>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Time Settings</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Editing Time Limit
                </label>
                <input
                  type="time"
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={
                    editingTimeLimit !== "--:-- --" ? editingTimeLimit : ""
                  }
                  onChange={(e) => {
                    setEditingTimeLimit(e.target.value || "--:-- --");
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Set the time limit for editing attendance
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Start Time
                </label>
                <input
                  type="time"
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={startTime !== "--:-- --" ? startTime : ""}
                  onChange={(e) => {
                    setStartTime(e.target.value || "--:-- --");
                  }}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School End Time
                </label>
                <input
                  type="time"
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={endTime !== "--:-- --" ? endTime : ""}
                  onChange={(e) => {
                    setEndTime(e.target.value || "--:-- --");
                  }}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Late Threshold (minutes)
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={lateThreshold}
                  onChange={(e) => {
                    setLateThreshold(e.target.value);
                  }}
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minutes after start time when a student is marked as late
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">
                Notification Settings
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMS Notifications
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={smsNotifications}
                  onChange={(e) => {
                    setSmsNotifications(e.target.value);
                  }}
                >
                  <option value="Enabled">Enabled</option>
                  <option value="Disabled">Disabled</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Enable/disable SMS notifications for attendance updates
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Notifications
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={emailNotifications}
                  onChange={(e) => {
                    setEmailNotifications(e.target.value);
                  }}
                >
                  <option value="Enabled">Enabled</option>
                  <option value="Disabled">Disabled</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Enable/disable email notifications for attendance updates
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button
              shape="primary"
              className="w-full bg-gray-800 text-white"
              onClick={handleSaveSettings}
              pending={loading}
            >
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
