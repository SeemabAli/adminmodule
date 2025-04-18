import { useState, useEffect } from "react";
import { NavLink } from "react-router";
import { notify } from "@/lib/notify";
import { logger } from "@/lib/logger";
import { handleErrorNotification } from "@/utils/exceptions";
import axios from "axios";

const ClassListingPage = () => {
  const [classes, setClasses] = useState<
    {
      classID: string;
      className: string;
      section: string;
      thresholdStudents: number;
      fee: number;
      createdDate: string;
      classTeacherName?: string;
    }[]
  >([]);
  const [staff, setStaff] = useState<{ staffID: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStaff, setLoadingStaff] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const requestData = {
          userName: localStorage.getItem("username"),
          sessionKey: localStorage.getItem("sessionKey"),
          organizationID: localStorage.getItem("organizationID"),
          branchID: parseInt(localStorage.getItem("branchID") ?? "0"),
        };

        // Fetch class data
        const classResponse = await axios.post(
          "http://192.168.100.14/EBridge/api/TssEBridge/GetClassListingByBranchAdmin",
          requestData,
        );

        if (classResponse.data.valid) {
          setClasses(classResponse.data.data);
        } else {
          notify.error(
            classResponse.data.message ?? "Failed to retrieve class listing.",
          );
        }

        // Fetch staff data
        const staffResponse = await axios.post(
          "http://192.168.100.14/EBridge/api/TssEBridge/GetStaffByBranchAdmin",
          requestData,
        );

        if (staffResponse.data.valid) {
          setStaff(staffResponse.data.data);
        } else {
          notify.error(
            staffResponse.data.message ?? "Failed to retrieve staff data.",
          );
        }
      } catch (error) {
        logger.error(error);
        handleErrorNotification(error, "Data Fetching");
      } finally {
        setLoading(false);
        setLoadingStaff(false);
      }
    };

    void fetchData();
  }, []);

  const handleTeacherAssignment = async (
    classID: string,
    teacher: { staffID: string; name: string },
  ) => {
    try {
      const requestData = {
        userName: localStorage.getItem("username"),
        sessionKey: localStorage.getItem("sessionKey"),
        classID: classID,
        teacherID: teacher.staffID,
      };

      const response = await axios.post(
        "http://192.168.100.14/EBridge/api/TssEBridge/UpdateClassTeacher",
        requestData,
      );

      if (response.data.valid) {
        notify.success("Teacher updated successfully.");
      } else {
        notify.error(response.data.message ?? "Failed to update teacher.");
      }
    } catch (error) {
      logger.error(error);
      handleErrorNotification(error, "Teacher Assignment");
    }
  };

  if (loading || loadingStaff) return <p>Loading data...</p>;

  return (
    <div>
      <NavLink
        to={"/add-class"}
        className="p-2 w-32 text-center bg-[#0f243f] text-white rounded font-bold px-4"
      >
        Add Class
      </NavLink>

      <div className="bg-white mt-6 shadow rounded-lg">
        {classes.length > 0 ? (
          <table className="w-full table-auto border-collapse">
            <thead className="bg-[#0f243f] text-white text-left">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Class Name</th>
                <th className="p-3">Section</th>
                <th className="p-3">Max Students</th>
                <th className="p-3">Fee (PKR)</th>
                <th className="p-3">Created Date</th>
                <th className="p-3">Assign Teacher</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((classItem) => (
                <tr
                  key={classItem.classID}
                  className="hover:bg-gray-50 even:bg-gray-50"
                >
                  <td className="border p-3 text-center">
                    {classItem.classID}
                  </td>
                  <td className="border p-3">{classItem.className}</td>
                  <td className="border p-3">{classItem.section}</td>
                  <td className="border p-3 text-center">
                    {classItem.thresholdStudents}
                  </td>
                  <td className="border p-3 text-right">
                    {classItem.fee.toFixed(2)}
                  </td>
                  <td className="border p-3">
                    {new Date(classItem.createdDate).toLocaleDateString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  </td>
                  <td className="border p-3">
                    <select
                      value={classItem.classTeacherName ?? ""}
                      onChange={(e) => {
                        const teacher = staff.find(
                          (teacher) => teacher.name === e.target.value,
                        );
                        if (teacher) {
                          const updatedClasses = classes.map((aclass) =>
                            aclass.classID === classItem.classID
                              ? { ...aclass, classTeacherName: teacher.name }
                              : aclass,
                          );
                          setClasses(updatedClasses);
                          void handleTeacherAssignment(
                            classItem.classID,
                            teacher,
                          );
                        }
                      }}
                      className="p-2 border rounded w-full"
                    >
                      <option value="">Select Teacher</option>
                      {staff.map((teacher) => (
                        <option key={teacher.staffID} value={teacher.name}>
                          {teacher.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border p-3">
                    <NavLink
                      to={`/update-class/${classItem.classID}`}
                      className="text-sky-700"
                    >
                      Edit
                    </NavLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500 mt-4">No classes found.</p>
        )}
      </div>
    </div>
  );
};

export default ClassListingPage;
