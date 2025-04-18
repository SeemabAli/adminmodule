// ReportsPage.tsx
import { useState } from "react";
import { notify } from "@/lib/notify";
import { Button } from "@/common/components/ui/Button";
import { logger } from "@/lib/logger";
import { handleErrorNotification } from "@/utils/exceptions";
import axios from "axios";

const ReportsPage = () => {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState("Daily");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [reportData, setReportData] = useState<
    {
      status: string;
      rollId: string;
      name: string;
      class: string;
      section: string;
      date: string;
    }[]
  >([]);

  const handleGenerateReport = async () => {
    try {
      setLoading(true);

      const requestData = {
        userName: localStorage.getItem("username"),
        sessionKey: localStorage.getItem("sessionKey"),
        organizationID: localStorage.getItem("organizationID") ?? "4",
        branchID: localStorage.getItem("branchID") ?? 3,
        reportType,
        startDate,
        endDate,
        class: selectedClass,
        section: selectedSection,
      };

      const response = await axios.post(
        "http://192.168.100.14/EBridge/api/TssEBridge/GenerateReport",
        requestData,
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      const result = response.data;

      if (result.valid) {
        setReportData(result.data ?? []);
        notify.success("Report generated successfully.");
      } else {
        notify.error(result.message ?? "Failed to generate report.");
        setReportData([]);
      }
    } catch (error) {
      logger.error(error);
      handleErrorNotification(error, "Reports");
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (format: string) => {
    try {
      setLoading(true);

      const requestData = {
        userName: localStorage.getItem("username"),
        sessionKey: localStorage.getItem("sessionKey"),
        organizationID: localStorage.getItem("organizationID") ?? "4",
        branchID: localStorage.getItem("branchID") ?? 3,
        reportType,
        startDate,
        endDate,
        class: selectedClass,
        section: selectedSection,
        exportFormat: format,
      };

      const response = await axios.post(
        "http://192.168.100.14/EBridge/api/TssEBridge/ExportReport",
        requestData,
        {
          headers: { "Content-Type": "application/json" },
          responseType: "blob",
        },
      );

      // Create a download link for the exported file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `attendance_report_${new Date().toISOString().split("T")[0]}.${format.toLowerCase()}`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      notify.success(`Report exported as ${format} successfully.`);
    } catch (error) {
      logger.error(error);
      handleErrorNotification(error, "Reports Export");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Attendance Reports</h2>

        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report Type
              </label>
              <select
                className="w-full border border-gray-300 rounded-md p-2"
                value={reportType}
                onChange={(e) => {
                  setReportType(e.target.value);
                }}
              >
                <option value="Daily">Daily Report</option>
                <option value="Weekly">Weekly Report</option>
                <option value="Monthly">Monthly Report</option>
                <option value="Custom">Custom Range</option>
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
                disabled={reportType !== "Custom"}
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
                <option value="">All Classes</option>
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
                <option value="">All Sections</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              shape="primary"
              className="bg-gray-800 text-white"
              onClick={handleGenerateReport}
              pending={loading}
            >
              Generate Report
            </Button>
            <Button
              shape="primary"
              className="border-gray-300"
              onClick={() => handleExportReport("PDF")}
            >
              Export PDF
            </Button>
            <Button
              shape="info"
              className="border-gray-300"
              onClick={() => handleExportReport("EXCEL")}
            >
              Export Excel
            </Button>
          </div>
        </div>

        {reportData.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-4">Attendance Summary</h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <h4 className="text-sm text-gray-500 mb-1">Present</h4>
                <p className="text-2xl font-semibold text-green-600">
                  {
                    reportData.filter((item) => item.status === "Present")
                      .length
                  }
                </p>
              </div>

              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <h4 className="text-sm text-gray-500 mb-1">Absent</h4>
                <p className="text-2xl font-semibold text-red-600">
                  {reportData.filter((item) => item.status === "Absent").length}
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                <h4 className="text-sm text-gray-500 mb-1">Late</h4>
                <p className="text-2xl font-semibold text-yellow-600">
                  {reportData.filter((item) => item.status === "Late").length}
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="text-sm text-gray-500 mb-1">Total</h4>
                <p className="text-2xl font-semibold text-blue-600">
                  {reportData.length}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left">#</th>
                    <th className="py-3 px-4 text-left">ROLL ID</th>
                    <th className="py-3 px-4 text-left">NAME</th>
                    <th className="py-3 px-4 text-left">CLASS</th>
                    <th className="py-3 px-4 text-left">SECTION</th>
                    <th className="py-3 px-4 text-left">DATE</th>
                    <th className="py-3 px-4 text-left">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.map((item, index) => (
                    <tr key={index}>
                      <td className="py-3 px-4">{index + 1}</td>
                      <td className="py-3 px-4">{item.rollId}</td>
                      <td className="py-3 px-4">{item.name}</td>
                      <td className="py-3 px-4">{item.class}</td>
                      <td className="py-3 px-4">{item.section}</td>
                      <td className="py-3 px-4">{item.date}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs 
                          ${
                            item.status === "Present"
                              ? "bg-green-100 text-green-800"
                              : item.status === "Absent"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
