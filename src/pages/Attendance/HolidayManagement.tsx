import { useState } from "react";
import { notify } from "@/lib/notify";
import { Button } from "@/common/components/ui/Button";
import { logger } from "@/lib/logger";
import { handleErrorNotification } from "@/utils/exceptions";
import axios from "axios";

export const HolidayManagement = () => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [appliedTo, setAppliedTo] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  interface Holiday {
    name: string;
    appliesTo: string;
    holidayDate: string;
    class: string;
    recurring: boolean;
  }

  const [holidayData, setHolidayData] = useState<Holiday[]>([]);

  const handleAddHoliday = async () => {
    try {
      setLoading(true);

      const requestData = {
        userName: localStorage.getItem("username"),
        sessionKey: localStorage.getItem("sessionKey"),
        organizationID: localStorage.getItem("organizationID") ?? "4",
        branchID: localStorage.getItem("branchID") ?? 3,
        name,
        appliedTo,
        startDate,
        endDate,
        class: selectedClass,
        isRecurring,
      };

      const response = await axios.post(
        "http://192.168.100.14/EBridge/api/TssEBridge/AddHoliday",
        requestData,
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      const result = response.data;

      if (result.valid) {
        notify.success("Holiday added successfully.");
        // Refresh holiday data
        void fetchHolidayData();
        // Reset form
        setName("");
        setIsRecurring(false);
      } else {
        notify.error(result.message ?? "Failed to add holiday.");
      }
    } catch (error) {
      logger.error(error);
      handleErrorNotification(error, "Holiday Management");
    } finally {
      setLoading(false);
    }
  };

  const fetchHolidayData = async () => {
    try {
      setLoading(true);

      const requestData = {
        userName: localStorage.getItem("username"),
        sessionKey: localStorage.getItem("sessionKey"),
        organizationID: localStorage.getItem("organizationID") ?? "4",
        branchID: localStorage.getItem("branchID") ?? 3,
      };

      const response = await axios.post(
        "http://192.168.100.14/EBridge/api/TssEBridge/GetHolidays",
        requestData,
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      const result = response.data;

      if (result.valid) {
        setHolidayData(result.data ?? []);
      } else {
        notify.error(result.message ?? "Failed to retrieve holiday data.");
        setHolidayData([]);
      }
    } catch (error) {
      logger.error(error);
      handleErrorNotification(error, "Holiday Management");
      setHolidayData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Holiday Management</h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              placeholder="Enter name"
              className="w-full border border-gray-300 rounded-md p-2"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Applied to
            </label>
            <select
              className="w-full border border-gray-300 rounded-md p-2"
              value={appliedTo}
              onChange={(e) => {
                setAppliedTo(e.target.value);
              }}
            >
              <option value="">Select option</option>
              <option value="All">All</option>
              <option value="Students">Students</option>
              <option value="Staff">Staff</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md p-2"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md p-2"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class
            </label>
            <select
              className="w-full border border-gray-300 rounded-md p-2"
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
              }}
            >
              <option value="">Select Option</option>
              <option value="All">All</option>
              <option value="Class 1">Class 1</option>
              <option value="Class 2">Class 2</option>
              <option value="Class 3">Class 3</option>
            </select>
          </div>
        </div>

        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            className="mr-2"
            checked={isRecurring}
            onChange={(e) => {
              setIsRecurring(e.target.checked);
            }}
          />
          <label className="text-sm font-medium text-gray-700">
            is Recurring
          </label>
        </div>

        <div className="mb-6">
          <Button
            shape="primary"
            className="w-full bg-gray-800 text-white"
            onClick={handleAddHoliday}
            pending={loading}
          >
            Add Holiday
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">#</th>
                <th className="py-3 px-4 text-left">NAME</th>
                <th className="py-3 px-4 text-left">APPLIES TO</th>
                <th className="py-3 px-4 text-left">HOLIDAY DATE</th>
                <th className="py-3 px-4 text-left">CLASS</th>
                <th className="py-3 px-4 text-left">RECURRING</th>
                <th className="py-3 px-4 text-left">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {holidayData.length > 0 ? (
                holidayData.map((item, index) => (
                  <tr key={index}>
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4">{item.name}</td>
                    <td className="py-3 px-4">{item.appliesTo}</td>
                    <td className="py-3 px-4">{item.holidayDate}</td>
                    <td className="py-3 px-4">{item.class}</td>
                    <td className="py-3 px-4">
                      {item.recurring ? "Yes" : "No"}
                    </td>
                    <td className="py-3 px-4">
                      <Button shape="primary" className="mr-2">
                        Edit
                      </Button>
                      <Button shape="secondary" className="mr-2">
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="py-4 px-4 text-center text-gray-500"
                  >
                    No holiday records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
