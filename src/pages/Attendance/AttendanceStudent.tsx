import { useState } from "react";
import { notify } from "@/lib/notify";
import { Button } from "@/common/components/ui/Button";
import { logger } from "@/lib/logger";
import { handleErrorNotification } from "@/utils/exceptions";
import axios from "axios";

export const AttendanceStudent = () => {
  const [loading, setLoading] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [date, setDate] = useState("");
  interface AttendanceRecord {
    rollId: string;
    name: string;
    parent: string;
    class: string;
    status: string;
  }

  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);

  const handleSearch = async () => {
    try {
      setLoading(true);

      const requestData = {
        userName: localStorage.getItem("username"),
        sessionKey: localStorage.getItem("sessionKey"),
        organizationID: localStorage.getItem("organizationID") ?? "4",
        branchID: localStorage.getItem("branchID") ?? 3,
        studentName,
        class: selectedClass,
        section: selectedSection,
        date,
      };

      const response = await axios.post(
        "http://192.168.100.14/EBridge/api/TssEBridge/GetStudentAttendance",
        requestData,
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      const result = response.data;

      if (result.valid) {
        setAttendanceData(result.data ?? []);
        notify.success("Attendance data retrieved successfully.");
      } else {
        notify.error(result.message ?? "Failed to retrieve attendance data.");
        setAttendanceData([]);
      }
    } catch (error) {
      logger.error(error);
      handleErrorNotification(error, "Attendance");
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="bg-white p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student
            </label>
            <input
              type="text"
              placeholder="Type Student Name"
              className="w-full border border-gray-300 rounded-md p-2"
              value={studentName}
              onChange={(e) => {
                setStudentName(e.target.value);
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
              <option value="">Select Class</option>
              <option value="Class 1">Class 1</option>
              <option value="Class 2">Class 2</option>
              <option value="Class 3">Class 3</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section
            </label>
            <select
              className="w-full border border-gray-300 rounded-md p-2"
              value={selectedSection}
              onChange={(e) => {
                setSelectedSection(e.target.value);
              }}
            >
              <option value="">Select Section</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md p-2"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
              }}
            />
          </div>
        </div>

        <div className="flex justify-end mb-6">
          <Button
            shape="info"
            className="w-24"
            onClick={handleSearch}
            pending={loading}
          >
            Search
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="py-3 px-4 text-left">#</th>
                <th className="py-3 px-4 text-left">ROLL ID</th>
                <th className="py-3 px-4 text-left">NAME</th>
                <th className="py-3 px-4 text-left">PARENT</th>
                <th className="py-3 px-4 text-left">CLASS</th>
                <th className="py-3 px-4 text-left">STATUS</th>
                <th className="py-3 px-4 text-left">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attendanceData.length > 0 ? (
                attendanceData.map((item, index) => (
                  <tr key={index}>
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4">{item.rollId}</td>
                    <td className="py-3 px-4">{item.name}</td>
                    <td className="py-3 px-4">{item.parent}</td>
                    <td className="py-3 px-4">{item.class}</td>
                    <td className="py-3 px-4">{item.status}</td>
                    <td className="py-3 px-4">
                      <Button shape="primary" className="mr-2">
                        Edit
                      </Button>
                      <Button shape="secondary">Delete</Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="py-4 px-4 text-center text-gray-500"
                  >
                    No attendance records found
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
