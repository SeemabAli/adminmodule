/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useState, useRef } from "react";
import { notify } from "../../lib/notify";
import { formatNumberWithCommas } from "@/utils/CommaSeparator";

const Employees = () => {
  const [employees, setEmployees] = useState<
    {
      name: string;
      phone: string;
      email: string;
      cnic: string;
      designation: string;
      department: string;
      salary: string;
      documents: File | null;
      documentUrl: string;
      role: string | null;
    }[]
  >([]);
  const [employeeName, setEmployeeName] = useState("");
  const [employeePhone, setEmployeePhone] = useState("+92");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [employeeCnic, setEmployeeCnic] = useState("");
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("");
  const [salary, setSalary] = useState("");
  const [documents, setDocuments] = useState<File | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Role management states
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [roleEmployeeIndex, setRoleEmployeeIndex] = useState<number | null>(
    null,
  );

  // Available roles
  const availableRoles = ["Admin", "Data Entry Operator", "Accountant"];

  // Handle Phone Input (Always starts with +92 and allows only 10 digits)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    if (value.startsWith("92")) value = value.substring(2); // Remove leading 92 if user types it
    if (value.length > 10) value = value.slice(0, 10); // Limit to 10 digits
    setEmployeePhone(`+92${value}`);
  };

  // Handle CNIC Input (Auto-format XXXXX-XXXXXXX-X)
  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    if (value.length > 20) value = value.slice(0, 20);
    setEmployeeCnic(value);
  };

  // Handle Email Input
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmployeeEmail(e.target.value);
  };

  // Handle PDF Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      // Check if file is PDF
      if (file.type !== "application/pdf") {
        notify.error("Please upload a PDF file!");
        return;
      }
      setDocuments(file);
    }
  };

  // Handle form submission (Add/Edit Employee)
  const handleAddEmployee = () => {
    // Debugging logs
    console.log({
      name: employeeName.trim(),
      phone: employeePhone,
      email: employeeEmail.trim(),
      cnic: employeeCnic,
      designation: designation.trim(),
      department: department.trim(),
      salary: salary.trim(),
      documents: documents,
    });

    // Fix Phone Number Validation (Must be exactly +92XXXXXXXXXX)
    const phoneRegex = /^\+92\d{10}$/;
    if (!phoneRegex.test(employeePhone)) {
      notify.error("Invalid phone number!");
      return;
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(employeeEmail)) {
      notify.error("Invalid email address!");
      return;
    }

    // Fix Salary Formatting (Remove all commas before storing)
    const salaryWithoutCommas = salary.replace(/,/g, "");
    if (isNaN(Number(salaryWithoutCommas))) {
      notify.error("Invalid salary amount!");
      return;
    }

    // Ensure all fields are filled
    if (
      employeeName.trim() === "" ||
      employeeEmail.trim() === "" ||
      designation.trim() === "" ||
      department.trim() === "" ||
      salary.trim() === ""
    ) {
      notify.error("Please fill all fields correctly!");
      return;
    }

    // Generate document URL if file exists
    let documentUrl = "";
    if (documents) {
      documentUrl = URL.createObjectURL(documents);
    } else if (editingIndex !== null && employees[editingIndex]?.documents) {
      documentUrl = employees[editingIndex].documentUrl;
    }

    // Create Employee Object
    const newEmployee = {
      name: employeeName.trim(),
      phone: employeePhone,
      email: employeeEmail.trim(),
      cnic: employeeCnic,
      designation: designation.trim(),
      department: department.trim(),
      salary: salaryWithoutCommas, // Store salary without commas
      documents:
        documents ??
        (editingIndex !== null
          ? (employees[editingIndex]?.documents ?? null)
          : null),
      documentUrl: documentUrl,
      role:
        editingIndex !== null ? (employees[editingIndex]?.role ?? null) : null,
    };

    if (editingIndex !== null) {
      const updatedEmployees = [...employees];
      updatedEmployees[editingIndex] = newEmployee;
      setEmployees(updatedEmployees);
      setEditingIndex(null);
      notify.success("Employee updated successfully!");
    } else {
      setEmployees([...employees, newEmployee]);
      notify.success("Employee added successfully!");
    }

    // Clear Fields
    setEmployeeName("");
    setEmployeePhone("+92");
    setEmployeeEmail("");
    setEmployeeCnic("");
    setDesignation("");
    setDepartment("");
    setSalary("");
    setDocuments(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle Edit
  const handleEdit = (index: number) => {
    const employee = employees.find((_, i) => i === index);
    if (!employee) return;
    setEmployeeName(employee.name);
    setEmployeePhone(employee.phone);
    setEmployeeEmail(employee.email);
    setEmployeeCnic(employee.cnic);
    setDesignation(employee.designation);
    setDepartment(employee.department);
    setSalary(formatNumberWithCommas(employee.salary));
    setDocuments(employee.documents);
    setEditingIndex(index);
  };

  // Handle Delete
  const handleDelete = (index: number) => {
    notify.confirmDelete(() => {
      setEmployees(employees.filter((_, i) => i !== index));
      notify.success("Employee deleted successfully!");
    });
  };

  // Handle Download PDF
  const handleDownloadPDF = (index: number) => {
    const employee = employees[index];
    if (employee?.documents && employee.documentUrl) {
      const link = document.createElement("a");
      link.href = employee?.documentUrl ?? "";
      link.download = `${employee?.name.replace(/\s+/g, "_") ?? "unknown"}_documents.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      notify.error("No document available for download!");
    }
  };

  // Open Role Modal
  const openRoleModal = (index: number) => {
    setRoleEmployeeIndex(index);
    setSelectedRole(employees[index]?.role ?? "");
    setIsRoleModalOpen(true);
  };

  // Close Role Modal
  const closeRoleModal = () => {
    setIsRoleModalOpen(false);
    setRoleEmployeeIndex(null);
    setSelectedRole("");
  };

  // Handle Role Assignment
  const handleRoleAssignment = () => {
    if (roleEmployeeIndex === null) return;

    const updatedEmployees = [...employees];
    updatedEmployees[roleEmployeeIndex] = {
      ...updatedEmployees[roleEmployeeIndex]!,
      name: updatedEmployees[roleEmployeeIndex]!.name,
      phone: updatedEmployees[roleEmployeeIndex]!.phone,
      email: updatedEmployees[roleEmployeeIndex]!.email,
      cnic: updatedEmployees[roleEmployeeIndex]!.cnic,
      designation: updatedEmployees[roleEmployeeIndex]!.designation,
      department: updatedEmployees[roleEmployeeIndex]!.department,
      salary: updatedEmployees[roleEmployeeIndex]!.salary,
      documents: updatedEmployees[roleEmployeeIndex]!.documents,
      documentUrl: updatedEmployees[roleEmployeeIndex]!.documentUrl,
      role: selectedRole || null,
    };

    setEmployees(updatedEmployees);

    if (selectedRole) {
      notify.success(`Role "${selectedRole}" assigned successfully!`);
    } else {
      notify.success("Role revoked successfully!");
    }

    closeRoleModal();
  };

  // Handle Role Revocation
  const handleRevokeRole = () => {
    if (roleEmployeeIndex === null) return;

    const updatedEmployees = [...employees];
    updatedEmployees[roleEmployeeIndex] = {
      ...updatedEmployees[roleEmployeeIndex]!,
      name: updatedEmployees[roleEmployeeIndex]!.name ?? "",
      phone: updatedEmployees[roleEmployeeIndex]!.phone ?? "",
      email: updatedEmployees[roleEmployeeIndex]!.email ?? "",
      cnic: updatedEmployees[roleEmployeeIndex]!.cnic ?? "",
      designation: updatedEmployees[roleEmployeeIndex]!.designation ?? "",
      department: updatedEmployees[roleEmployeeIndex]!.department ?? "",
      salary: updatedEmployees[roleEmployeeIndex]!.salary ?? "",
      documents: updatedEmployees[roleEmployeeIndex]!.documents ?? null,
      documentUrl: updatedEmployees[roleEmployeeIndex]!.documentUrl ?? "",
      role: null,
    };

    setEmployees(updatedEmployees);
    notify.success("Role revoked successfully!");
    closeRoleModal();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Employee Management</h2>

      {/* Form */}
      <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block mb-1 font-medium">
            Employee Name
            <input
              type="text"
              required
              placeholder="Employee Name"
              value={employeeName}
              onChange={(e) => {
                setEmployeeName(e.target.value);
              }}
              className="input input-bordered w-full"
            />
          </label>
          <label className="block mb-1 font-medium">
            Employee Phone
            <input
              type="text"
              placeholder="Employee Phone (+92XXXXXXXXXX)"
              value={employeePhone}
              onChange={handlePhoneChange}
              className="input input-bordered w-full"
              maxLength={13}
            />
          </label>
          <label className="block mb-1 font-medium">
            Employee Email
            <input
              type="email"
              placeholder="Employee Email"
              value={employeeEmail}
              onChange={handleEmailChange}
              className="input input-bordered w-full"
            />
          </label>
          <label className="block mb-1 font-medium">
            Employee CNIC
            <input
              type="text"
              placeholder="Employee CNIC"
              value={employeeCnic}
              onChange={handleCnicChange}
              className="input input-bordered w-full"
              maxLength={20}
            />
          </label>
          {/* Designation Dropdown */}
          <label className="block mb-1 font-medium">
            Department
            <select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
              }}
              className="select select-bordered w-full"
            >
              <option value="">Select Department</option>
              <option value="Office Staff">Office Staff</option>
              <option value="Driver">Driver</option>
              <option value="Labour">Labour</option>
            </select>
          </label>
          {/* Department Dropdown */}
          <label className="block mb-1 font-medium">
            Designation
            <input
              type="text"
              placeholder="Enter Designation"
              value={designation}
              onChange={(e) => {
                setDesignation(e.target.value);
              }}
              className="input input-bordered w-full"
            />
          </label>
          <label className="block mb-1 font-medium">
            Salary
            <input
              type="text"
              placeholder="Salary"
              value={salary}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/,/g, ""); // Remove commas
                if (!/^\d*$/.test(rawValue)) return; // Prevent non-numeric input
                setSalary(rawValue ? formatNumberWithCommas(rawValue) : "");
              }}
              className="input input-bordered w-full"
            />
          </label>
          <label className="block mb-1 font-medium">
            Documents (PDF)
            <input
              type="file"
              ref={fileInputRef}
              accept="application/pdf"
              onChange={handleFileChange}
              className="file-input file-input-bordered w-full"
            />
            {documents && (
              <span className="text-sm text-success">
                File selected: {documents.name}
              </span>
            )}
          </label>
        </div>
        <button onClick={handleAddEmployee} className="btn btn-info mt-4">
          {editingIndex !== null ? "Update Employee" : "Add Employee"}
        </button>
      </div>

      {/* Employee Table */}
      {employees.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table w-full bg-base-200 rounded-lg shadow-md">
            <thead>
              <tr className="bg-base-300 text-base-content text-center">
                <th className="p-3">#</th>
                <th className="p-3">Name</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Email</th>
                <th className="p-3">CNIC</th>
                <th className="p-3">Department</th>
                <th className="p-3">Designation</th>
                <th className="p-3">Salary</th>
                <th className="p-3">Role</th>
                <th className="p-3">Documents</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee, index) => (
                <tr
                  key={index}
                  className="border-b border-base-300 text-center"
                >
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{employee.name}</td>
                  <td className="p-3">{employee.phone}</td>
                  <td className="p-3">{employee.email}</td>
                  <td className="p-3">{employee.cnic}</td>
                  <td className="p-3">{employee.department}</td>
                  <td className="p-3">{employee.designation}</td>
                  <td className="p-3">
                    {formatNumberWithCommas(employee.salary)}
                  </td>
                  <td className="p-3">
                    {employee.role ? (
                      <span className="badge badge-info">{employee.role}</span>
                    ) : (
                      <button
                        onClick={() => {
                          openRoleModal(index);
                        }}
                        className="btn btn-sm btn-info"
                      >
                        Create Role
                      </button>
                    )}
                  </td>
                  <td className="p-3">
                    {employee.documents ? (
                      <button
                        onClick={() => {
                          handleDownloadPDF(index);
                        }}
                        className="btn btn-sm btn-success"
                      >
                        Download PDF
                      </button>
                    ) : (
                      <span className="text-gray-500">No document</span>
                    )}
                  </td>
                  <td className="p-3 flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        handleEdit(index);
                      }}
                      className="btn btn-sm btn-secondary"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        handleDelete(index);
                      }}
                      className="btn btn-sm btn-error"
                    >
                      Delete
                    </button>
                    {employee.role && (
                      <button
                        onClick={() => {
                          openRoleModal(index);
                        }}
                        className="btn btn-sm btn-warning"
                      >
                        Update Role
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6 text-center text-gray-500">
          No employees added yet.
        </div>
      )}

      {/* Role Assignment Modal */}
      {/* Role Assignment Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50 p-4">
          <div className="bg-base-200 p-4 md:p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="font-bold text-lg mb-3 md:mb-4">
              {employees[roleEmployeeIndex!]?.role
                ? "Update Employee Role"
                : "Assign Role to Employee"}
            </h3>
            <p className="mb-3 md:mb-4 text-sm md:text-base">
              Employee:{" "}
              <span className="font-bold">
                {employees[roleEmployeeIndex!]?.name}
              </span>
            </p>

            <div className="form-control mb-3 md:mb-4">
              <label className="label">
                <span className="label-text font-medium">Select Role</span>
              </label>
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                }}
                className="select select-bordered w-full text-sm md:text-base"
              >
                <option value="">Select a role</option>
                {availableRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4 md:mt-6">
              {employees[roleEmployeeIndex!]?.role && (
                <button
                  className="btn btn-error btn-sm md:btn-md w-full sm:w-auto sm:mb-0"
                  onClick={handleRevokeRole}
                >
                  Revoke Role
                </button>
              )}
              <button
                className="btn btn-primary btn-sm md:btn-md w-full sm:w-auto"
                onClick={handleRoleAssignment}
                disabled={!selectedRole}
              >
                {employees[roleEmployeeIndex!]?.role
                  ? "Update Role"
                  : "Assign Role"}
              </button>
              <button
                className="btn btn-secondary btn-sm md:btn-md w-full sm:w-auto mb-2 sm:mb-0"
                onClick={closeRoleModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
