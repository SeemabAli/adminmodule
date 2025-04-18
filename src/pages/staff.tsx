import { useState, useEffect, type ChangeEvent } from "react";
import { NavLink } from "react-router";

type Staff = {
  staffID: number;
  name: string;
  designation: string;
  email: string;
  contact: string;
  employmentType: string;
  rfid: string;
  fatherName: string;
  cnic: string;
  dob: string;
  address: string;
  whatsapp: string;
  salary: number;
  joinDate: string;
  pictureURL?: string;
  educationDetails: {
    degree: string;
    institution: string;
    passingYear: string;
    grade: string;
  }[];
};

type Filters = {
  search: string;
  designation: string;
  employmentType: string;
};

const StaffListingPage = () => {
  const [staffData, setStaffData] = useState<Staff[]>([]);
  const [filteredData, setFilteredData] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<Filters>({
    search: "",
    designation: "",
    employmentType: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const requestData = {
        userName: localStorage.getItem("username"),
        sessionKey: localStorage.getItem("sessionKey"),
        branchID: localStorage.getItem("branchID"),
        organizationID: localStorage.getItem("organizationID"),
      };

      try {
        const response = await fetch(
          "http://192.168.100.14/EBridge/api/TssEBridge/GetStaffByBranchAdmin",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData),
          },
        );
        const result = await response.json();

        if (result.valid) {
          setStaffData(result.data);
          setFilteredData(result.data);
        } else {
          setError(result.message ?? "Failed to fetch staff data.");
        }
      } catch {
        setError("An error occurred while fetching staff data.");
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  const handleFilterChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const { search, designation, employmentType } = filters;
    let filtered = [...staffData];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (staff) =>
          staff.name.toLowerCase().includes(searchLower) ||
          staff.email.toLowerCase().includes(searchLower),
      );
    }

    if (designation) {
      filtered = filtered.filter(
        (staff) =>
          staff.designation.toLowerCase() === designation.toLowerCase(),
      );
    }

    if (employmentType) {
      filtered = filtered.filter(
        (staff) =>
          staff.employmentType.toLowerCase() === employmentType.toLowerCase(),
      );
    }

    setFilteredData(filtered);
  }, [filters, staffData]);

  if (loading) return <p>Loading staff data...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="flex flex-col gap-2">
      <NavLink
        to="/add-staff"
        className="p-2 w-32 text-center bg-[#0f243f] text-white rounded font-bold px-4"
      >
        Add Staff
      </NavLink>

      {/* Filters */}
      <div className="mt-2 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Search (Name/Email)
            </label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="mt-1 p-2 w-full border rounded-md shadow-sm"
              placeholder="Search staff..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Designation
            </label>
            <input
              type="text"
              name="designation"
              value={filters.designation}
              onChange={handleFilterChange}
              className="mt-1 p-2 w-full border rounded-md shadow-sm"
              placeholder="e.g., Manager"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Employment Type
            </label>
            <select
              name="employmentType"
              value={filters.employmentType}
              onChange={handleFilterChange}
              className="mt-1 p-2 w-full border rounded-md shadow-sm"
            >
              <option value="">All</option>
              <option value="Monthly">Monthly</option>
              <option value="Hourly">Hourly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white shadow rounded">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-[#0f243f] text-white">
            <tr>
              <th className="p-2">#</th>
              <th className="p-2">Name</th>
              <th className="p-2">Designation</th>
              <th className="p-2">Email</th>
              <th className="p-2">Contact</th>
              <th className="p-2">Employment Type</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((staff, index) => (
              <tr key={staff.staffID} className="hover:bg-gray-50">
                <td className="border p-2 text-center">{index + 1}</td>
                <td className="border p-2">{staff.name}</td>
                <td className="border p-2">{staff.designation}</td>
                <td className="border p-2">{staff.email}</td>
                <td className="border p-2">{staff.contact}</td>
                <td className="border p-2">{staff.employmentType}</td>
                <td className="border p-2 text-center">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => {
                      setSelectedStaff(staff);
                    }}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredData.length === 0 && (
          <p className="text-center text-gray-500 mt-4">No staff found.</p>
        )}
      </div>

      {/* Modal */}
      {selectedStaff && (
        <div
          onClick={(e) => {
            if ((e.target as HTMLElement).classList.contains("closeable")) {
              setSelectedStaff(null);
            }
          }}
          className="closeable fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 overflow-y-auto"
        >
          <div
            style={{ height: "70vh" }}
            className="bg-white p-8 rounded-lg shadow-2xl max-w-xl w-full overflow-y-auto relative"
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              onClick={() => {
                setSelectedStaff(null);
              }}
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <img
                src={
                  selectedStaff.pictureURL ?? "https://via.placeholder.com/150"
                }
                alt={selectedStaff.name}
                className="w-28 h-28 rounded-full mx-auto border-2 border-gray-300 shadow-sm mb-3"
              />
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedStaff.name}
              </h2>
              <p className="text-sm text-gray-500">
                {selectedStaff.designation}
              </p>
            </div>

            <div className="space-y-4">
              <p>
                <strong>RFID:</strong> {selectedStaff.rfid}
              </p>
              <p>
                <strong>Father's Name:</strong> {selectedStaff.fatherName}
              </p>
              <p>
                <strong>CNIC:</strong> {selectedStaff.cnic}
              </p>
              <p>
                <strong>DOB:</strong>{" "}
                {new Date(selectedStaff.dob).toDateString()}
              </p>
              <p>
                <strong>Address:</strong> {selectedStaff.address}
              </p>
              <p>
                <strong>Email:</strong> {selectedStaff.email}
              </p>
              <p>
                <strong>Contact:</strong> {selectedStaff.contact}
              </p>
              <p>
                <strong>WhatsApp:</strong> {selectedStaff.whatsapp}
              </p>
              <p>
                <strong>Salary:</strong> {selectedStaff.salary}
              </p>
              <p>
                <strong>Employment Type:</strong> {selectedStaff.employmentType}
              </p>
              <p>
                <strong>Join Date:</strong>{" "}
                {new Date(selectedStaff.joinDate).toDateString()}
              </p>
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
                Education Details
              </h3>
              {selectedStaff.educationDetails.map((edu, idx) => (
                <div
                  key={idx}
                  className="bg-gray-100 p-4 rounded-lg mb-3 shadow-sm"
                >
                  <p>
                    <strong>Degree:</strong> {edu.degree}
                  </p>
                  <p>
                    <strong>Institution:</strong> {edu.institution}
                  </p>
                  <p>
                    <strong>Passing Year:</strong> {edu.passingYear}
                  </p>
                  <p>
                    <strong>Grade:</strong> {edu.grade}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center mt-6">
              <button
                className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600"
                onClick={() => {
                  setSelectedStaff(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffListingPage;
