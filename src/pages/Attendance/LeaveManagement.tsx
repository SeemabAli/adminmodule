import { useState } from "react";
import { notify } from "@/lib/notify";
import { Button } from "@/common/components/ui/Button";
import { logger } from "@/lib/logger";
import { handleErrorNotification } from "@/utils/exceptions";
import axios from "axios";

export const LeaveManagement = () => {
  const [loading, setLoading] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [leaveType, setLeaveType] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedBy, setAppliedBy] = useState("");
  const [reason, setReason] = useState("");
  interface LeaveData {
    name: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    appliedBy: string;
    status: string;
  }

  const [leaveData, setLeaveData] = useState<LeaveData[]>([]);

  const handleApply = async () => {
    try {
      setLoading(true);

      const requestData = {
        userName: localStorage.getItem("username"),
        sessionKey: localStorage.getItem("sessionKey"),
        organizationID: localStorage.getItem("organizationID") ?? "4",
        branchID: localStorage.getItem("branchID") ?? 3,
        studentName,
        leaveType,
        startDate,
        endDate,
        appliedBy,
        reason,
      };

      const response = await axios.post(
        "http://192.168.100.14/EBridge/api/TssEBridge/ApplyLeave",
        requestData,
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      const result = response.data;

      if (result.valid) {
        notify.success("Leave applied successfully.");
        // Refresh leave data
        void fetchLeaveData();
        // Reset form
        setReason("");
      } else {
        notify.error(result.message ?? "Failed to apply leave.");
      }
    } catch (error) {
      logger.error(error);
      handleErrorNotification(error, "Leave Management");
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveData = async () => {
    try {
      setLoading(true);

      const requestData = {
        userName: localStorage.getItem("username"),
        sessionKey: localStorage.getItem("sessionKey"),
        organizationID: localStorage.getItem("organizationID") ?? "4",
        branchID: localStorage.getItem("branchID") ?? 3,
        studentName,
        leaveType,
        startDate,
        endDate,
        appliedBy,
      };

      const response = await axios.post(
        "http://192.168.100.14/EBridge/api/TssEBridge/GetLeaveData",
        requestData,
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      const result = response.data;

      if (result.valid) {
        setLeaveData(result.data ?? []);
      } else {
        notify.error(result.message ?? "Failed to retrieve leave data.");
        setLeaveData([]);
      }
    } catch (error) {
      logger.error(error);
      handleErrorNotification(error, "Leave Management");
      setLeaveData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Leave Management</h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student Name
            </label>
            <input
              type="text"
              placeholder="Type name"
              className="w-full border border-gray-300 rounded-md p-2"
              value={studentName}
              onChange={(e) => {
                setStudentName(e.target.value);
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leave Type
            </label>
            <select
              className="w-full border border-gray-300 rounded-md p-2"
              value={leaveType}
              onChange={(e) => {
                setLeaveType(e.target.value);
              }}
            >
              <option value="All">All</option>
              <option value="Sick">Sick</option>
              <option value="Personal">Personal</option>
              <option value="Vacation">Vacation</option>
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
              Applied By
            </label>
            <input
              type="text"
              placeholder="Type name"
              className="w-full border border-gray-300 rounded-md p-2"
              value={appliedBy}
              onChange={(e) => {
                setAppliedBy(e.target.value);
              }}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason
          </label>
          <textarea
            placeholder="Type reason"
            className="w-full border border-gray-300 rounded-md p-2 h-24"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
            }}
          ></textarea>
        </div>

        <div className="mb-6">
          <Button
            shape="primary"
            className="w-full bg-gray-800 text-white"
            onClick={handleApply}
            pending={loading}
          >
            Apply
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">#</th>
                <th className="py-3 px-4 text-left">NAME</th>
                <th className="py-3 px-4 text-left">LEAVE TYPE</th>
                <th className="py-3 px-4 text-left">START DATE</th>
                <th className="py-3 px-4 text-left">END DATE</th>
                <th className="py-3 px-4 text-left">APPLIED BY</th>
                <th className="py-3 px-4 text-left">STATUS</th>
                <th className="py-3 px-4 text-left">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaveData.length > 0 ? (
                leaveData.map((item, index) => (
                  <tr key={index}>
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4">{item.name}</td>
                    <td className="py-3 px-4">{item.leaveType}</td>
                    <td className="py-3 px-4">{item.startDate}</td>
                    <td className="py-3 px-4">{item.endDate}</td>
                    <td className="py-3 px-4">{item.appliedBy}</td>
                    <td className="py-3 px-4">{item.status}</td>
                    <td className="py-3 px-4">
                      <Button shape="accent" className="mr-2">
                        Edit
                      </Button>
                      <Button shape="secondary">Delete</Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="py-4 px-4 text-center text-gray-500"
                  >
                    No leave records found
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
