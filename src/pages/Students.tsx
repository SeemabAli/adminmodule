/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { notify } from "@/lib/notify";
import { logger } from "@/lib/logger";

interface Student {
  StudentID: string;
  Name: string;
  FatherName: string;
  Gender: string;
  ClassName: string;
  Section: string;
  PhotoUrl: string;
}

interface Class {
  className: string;
}

interface Section {
  section: string;
}

interface ApiResponse<T> {
  valid: boolean;
  Valid?: boolean;
  data?: T;
  Students?: Student[];
  message?: string;
  Message?: string;
}

const StudentListing = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<string[]>([]);

  const AUTH_DATA = {
    userName: localStorage.getItem("username"),
    sessionKey: localStorage.getItem("sessionKey"),
    organizationID: localStorage.getItem("organizationID"),
    branchID: localStorage.getItem("branchID"),
  };

  const STUDENT_API_URL =
    "http://192.168.100.14/EBridge/api/TssEBridge/GetBranchStudents";
  const CLASSES_API_URL =
    "http://192.168.100.14/EBridge/api/TssEBridge/GetClassesBasic";
  const SECTIONS_API_URL =
    "http://192.168.100.14/EBridge/api/TssEBridge/GetSectionViaClass";

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(STUDENT_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(AUTH_DATA),
        });

        const data: ApiResponse<Student[]> = await response.json();
        if (data.Valid && data.Students) {
          setStudents(data.Students);
          setFilteredStudents(data.Students);
        } else {
          notify.error(
            `Failed to fetch students: ${data.Message ?? "Unknown error"}`,
          );
        }
      } catch (error) {
        logger.error(error);
        notify.error("Error fetching students");
      }
    };

    void fetchStudents();
  }, [AUTH_DATA]);

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch(CLASSES_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(AUTH_DATA),
        });

        const data: ApiResponse<Class[]> = await response.json();
        if (data.valid && data.data) {
          setClasses(data.data);
        } else {
          notify.error(
            `Failed to fetch classes: ${data.message ?? "Unknown error"}`,
          );
        }
      } catch (error) {
        logger.error(error);
        notify.error("Error fetching classes");
      }
    };

    void fetchClasses();
  }, [AUTH_DATA]);

  // Fetch sections based on selected class
  useEffect(() => {
    const fetchSections = async () => {
      if (!classFilter) {
        setSections([]);
        return;
      }

      try {
        const response = await fetch(SECTIONS_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...AUTH_DATA, className: classFilter }),
        });

        const data: ApiResponse<Section[]> = await response.json();
        if (data.valid && data.data) {
          setSections(data.data.map((item: Section) => item.section));
        } else {
          notify.error(
            `Failed to fetch sections: ${data.message ?? "Unknown error"}`,
          );
        }
      } catch (error) {
        logger.error(error);
        notify.error("Error fetching sections");
      }
    };

    void fetchSections();
  }, [classFilter, AUTH_DATA]);

  // Filter students when filters or search query are updated
  useEffect(() => {
    let filtered = students;

    if (classFilter) {
      filtered = filtered.filter(
        (student) => student.ClassName === classFilter,
      );
    }
    if (sectionFilter) {
      filtered = filtered.filter(
        (student) => student.Section === sectionFilter,
      );
    }
    if (genderFilter) {
      filtered = filtered.filter((student) => student.Gender === genderFilter);
    }
    if (searchQuery) {
      filtered = filtered.filter(
        (student) =>
          student.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.FatherName.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredStudents(filtered);
  }, [classFilter, sectionFilter, genderFilter, searchQuery, students]);

  return (
    <div className="p-6">
      {/* Search Bar */}
      <div className="my-4">
        <input
          type="text"
          placeholder="Search by name or father's name..."
          className="w-full p-3 border rounded"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap justify-end items-center my-4 gap-4">
        <div className="flex items-center gap-2">
          <label
            htmlFor="classFilter"
            className="text-gray-700 text-xl font-semibold"
          >
            Class:
          </label>
          <select
            id="classFilter"
            className="p-2 border rounded"
            value={classFilter}
            onChange={(e) => {
              setClassFilter(e.target.value);
            }}
          >
            <option value="">All Classes</option>
            {classes.map((cls, index) => (
              <option key={index} value={cls.className}>
                {cls.className}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="sectionFilter"
            className="text-gray-700 text-xl font-semibold"
          >
            Section:
          </label>
          <select
            id="sectionFilter"
            className="p-2 border rounded"
            value={sectionFilter}
            onChange={(e) => {
              setSectionFilter(e.target.value);
            }}
            disabled={!classFilter}
          >
            <option value="">All Sections</option>
            {sections.map((section, index) => (
              <option key={index} value={section}>
                {section}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="genderFilter"
            className="text-gray-700 text-xl font-semibold"
          >
            Gender:
          </label>
          <select
            id="genderFilter"
            className="p-2 border rounded"
            value={genderFilter}
            onChange={(e) => {
              setGenderFilter(e.target.value);
            }}
          >
            <option value="">All</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white shadow-md rounded overflow-hidden">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-[#0f243f] text-white">
            <tr>
              <th className="px-6 py-2.5 text-left text-sm font-medium">#</th>
              <th className="px-6 py-2.5 text-left text-sm font-medium">
                Photo
              </th>
              <th className="px-6 py-2.5 text-left text-sm font-medium">
                Name
              </th>
              <th className="px-6 py-2.5 text-left text-sm font-medium">
                Father Name
              </th>
              <th className="px-6 py-2.5 text-left text-sm font-medium">
                Gender
              </th>
              <th className="px-6 py-2.5 text-left text-sm font-medium">
                Class
              </th>
              <th className="px-6 py-2.5 text-left text-sm font-medium">
                Section
              </th>
              <th className="px-6 py-2.5 text-left text-sm font-medium">ID</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr
                key={student.StudentID}
                className="hover:bg-gray-100 border-b"
              >
                <td className="px-6 py-3 text-sm">{student.StudentID}</td>
                <td className="px-6 py-3 text-sm">
                  <img
                    src={`http://192.168.100.14/EBridge${student.PhotoUrl}`}
                    alt="Student"
                    className="w-12 h-12 object-cover rounded-full"
                  />
                </td>
                <td className="px-6 py-3 text-sm">{student.Name}</td>
                <td className="px-6 py-3 text-sm">{student.FatherName}</td>
                <td className="px-6 py-3 text-sm">{student.Gender}</td>
                <td className="px-6 py-3 text-sm">{student.ClassName}</td>
                <td className="px-6 py-3 text-sm">{student.Section}</td>
                <td className="px-6 py-3 text-sm">{student.StudentID}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentListing;
