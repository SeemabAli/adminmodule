import { useEffect, useState, useRef } from "react";
import { notify } from "@/lib/notify";
import { formatNumberWithCommas } from "@/utils/CommaSeparator";
import { FormField } from "@/common/components/ui/form/FormField";
import { useForm } from "react-hook-form";
import { Button } from "@/common/components/ui/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeSchema, type Employee } from "./employee.schema";
import {
  createEmployee,
  fetchAllEmployees,
  updateEmployee,
  deleteEmployee,
} from "./employee.service";
import { logger } from "@/lib/logger";
import { useService } from "@/common/hooks/custom/useService";
import { ErrorModal } from "@/common/components/Error";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import { ApiException } from "@/utils/exceptions";

export type Employees = {
  id?: string;
  name: string;
  phone: string;
  email: string;
  cnic: number;
  designation: string;
  department?: string;
  salary: number;
  documents?: File | null;
  documentUrl?: string;
  role?: string | null;
};

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState<Employees[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<File | null>(null);

  // Role management states
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [roleEmployeeIndex, setRoleEmployeeIndex] = useState<number | null>(
    null,
  );

  // Available roles
  const availableRoles = ["Admin", "Data Entry Operator", "Accountant"];

  const { error, data, isLoading } = useService(() => fetchAllEmployees());

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    setValue,
    setFocus,
    getValues,
    reset,
  } = useForm<Employees>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      id: undefined,
      name: "",
      phone: "+92",
      email: "",
      cnic: 0,
      designation: "",
      department: "",
      salary: 0,
      documents: null,
      documentUrl: "",
      role: null,
    },
  });

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

  const handleAddEmployee = async (formData: Employees) => {
    try {
      // Handle salary formatting
      const salaryValue = Number(String(formData.salary).replace(/,/g, ""));

      // Create Employee Object with additional fields
      const newEmployee: Employee = {
        ...formData,
        id: formData.id ?? undefined,
        salary: salaryValue,
        department: getValues("department") ?? "",
        documents: documents,
        documentUrl: documents ? URL.createObjectURL(documents) : "",
        role: null,
      };

      const createdEmployee = await createEmployee(newEmployee);
      setEmployees([...employees, createdEmployee as Employees]);

      reset();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setDocuments(null);
      notify.success("Employee added successfully!");
    } catch (error: unknown) {
      logger.error(error);

      if (error instanceof ApiException) {
        if (error.statusCode == 409) {
          notify.error("Employee already exists.");
        }
        return;
      }
      notify.error("Failed to add employee.");
    }
  };

  const onEmployeeUpdate = async (employeeId: string) => {
    try {
      const updatedEmployeeData = getValues();
      const salaryValue = Number(
        String(updatedEmployeeData.salary).replace(/,/g, ""),
      );

      // Find the employee being edited
      const targetEmployee = employees.find((emp) => emp.id === employeeId);

      // Create updated employee object
      const updatedEmployee: Employee = {
        ...updatedEmployeeData,
        id: employeeId,
        salary: salaryValue,
        department: getValues("department") ?? "",
        documents: documents ?? targetEmployee?.documents ?? null,
        documentUrl: documents
          ? URL.createObjectURL(documents)
          : (targetEmployee?.documentUrl ?? ""),
        role: targetEmployee?.role ?? null,
      };

      const updatedEmployeeResponse = await updateEmployee(
        employeeId,
        updatedEmployee,
      );

      const updatedEmployees = employees.map((employee) => {
        if (employee.id === employeeId) {
          return { ...employee, ...updatedEmployeeResponse };
        }
        return employee;
      });

      setEmployees(updatedEmployees);
      setEditingId(null);
      reset();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setDocuments(null);
      notify.success("Employee updated successfully!");
    } catch (error: unknown) {
      notify.error("Failed to update employee.");
      logger.error(error);
    }
  };

  const handleEdit = (id: string) => {
    const targetEmployee = employees.find((employee) => employee.id === id);
    if (!targetEmployee) return;

    setValue("id", targetEmployee.id ?? "");
    setValue("name", targetEmployee.name);
    setValue("phone", targetEmployee.phone);
    setValue("email", targetEmployee.email);
    setValue("cnic", targetEmployee.cnic);
    setValue("designation", targetEmployee.designation);
    setValue("department", targetEmployee.department);
    setValue("salary", targetEmployee.salary);
    setDocuments(targetEmployee.documents ?? null);
    setFocus("name");
    setEditingId(id);
  };

  const handleDelete = (id: string) => {
    notify.confirmDelete(async () => {
      try {
        await deleteEmployee(id);
        setEmployees(employees.filter((employee) => employee.id !== id));
        notify.success("Employee deleted successfully!");
      } catch (error: unknown) {
        notify.error("Failed to delete employee.");
        logger.error(error);
      }
    });
  };

  // Handle Download PDF
  const handleDownloadPDF = (index: number) => {
    const employee = employees[index];
    if (employee?.documents && employee.documentUrl) {
      const link = document.createElement("a");
      link.href = employee.documentUrl;
      link.download = `${employee.name.replace(/\s+/g, "_")}_documents.pdf`;
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
    const currentEmployee = updatedEmployees[roleEmployeeIndex];

    if (currentEmployee) {
      updatedEmployees[roleEmployeeIndex] = {
        ...currentEmployee,
        role: selectedRole || null,
      } as Employees;
    }

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
    const currentEmployee = updatedEmployees[roleEmployeeIndex];

    if (currentEmployee) {
      updatedEmployees[roleEmployeeIndex] = {
        ...currentEmployee,
        role: null,
      } as Employees;
    }

    setEmployees(updatedEmployees);
    notify.success("Role revoked successfully!");
    closeRoleModal();
  };

  useEffect(() => {
    if (data) {
      const formattedData = data.map((employee) => ({
        ...employee,
        salary: Number(
          formatNumberWithCommas(employee.salary.toString()).replace(/,/g, ""),
        ),
        department: employee.department ?? "",
        documents: employee.documents ?? null,
        documentUrl: employee.documentUrl ?? "",
        role: employee.role ?? null,
      })) as Employees[];
      setEmployees(formattedData);
    }
  }, [data]);

  if (error) {
    return (
      <ErrorModal
        message={
          error instanceof Error
            ? error.message
            : "Failed to fetch employees data"
        }
      />
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Employee Management</h2>

      {/* Form */}
      <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            placeholder="Enter Employee Name"
            name="name"
            label="Employee Name"
            register={register}
            errorMessage={errors.name?.message}
          />
          <FormField
            placeholder="Employee Phone (+92XXXXXXXXXX)"
            name="phone"
            label="Employee Phone"
            register={register}
            errorMessage={errors.phone?.message}
          />
          <FormField
            placeholder="Employee Email"
            name="email"
            label="Employee Email"
            register={register}
            errorMessage={errors.email?.message}
          />
          <FormField
            placeholder="Employee CNIC"
            name="cnic"
            label="Employee CNIC"
            register={register}
            errorMessage={errors.cnic?.message}
          />
          <div className="block mb-1">
            <label className="font-medium">Department</label>
            <select
              {...register("department")}
              className="select select-bordered w-full"
            >
              <option value="">Select Department</option>
              <option value="Office Staff">Office Staff</option>
              <option value="Driver">Driver</option>
              <option value="Labour">Labour</option>
            </select>
          </div>
          <FormField
            placeholder="Enter Designation"
            name="designation"
            label="Designation"
            register={register}
            errorMessage={errors.designation?.message}
          />
          <FormField
            placeholder="Salary"
            name="salary"
            label="Salary"
            register={register}
            errorMessage={errors.salary?.message}
          />
          <div className="block mb-1">
            <label className="font-medium">Documents (PDF)</label>
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
          </div>
        </div>
        <Button
          onClick={
            editingId !== null
              ? handleSubmit(() => {
                  void onEmployeeUpdate(editingId);
                })
              : handleSubmit(handleAddEmployee)
          }
          shape="info"
          pending={isSubmitting}
          className="mt-4"
        >
          {editingId !== null ? "Update Employee" : "Add Employee"}
        </Button>
      </div>

      {/* Employee Table */}
      {isLoading && <div className="skeleton h-28 w-full"></div>}
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
                  key={employee.id ?? index}
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
                    {formatNumberWithCommas(employee.salary.toString())}
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
                        handleEdit(employee.id ?? "");
                      }}
                      className="flex items-center justify-center"
                    >
                      <PencilSquareIcon className="w-4 h-4 text-info" />
                    </button>

                    <button
                      onClick={() => {
                        handleDelete(employee.id ?? "");
                      }}
                      className="flex items-center justify-center"
                    >
                      <TrashIcon className="w-4 h-4 text-red-500" />
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
      {isRoleModalOpen && roleEmployeeIndex !== null && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50 p-4">
          <div className="bg-base-200 p-4 md:p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="font-bold text-lg mb-3 md:mb-4">
              {employees[roleEmployeeIndex]?.role
                ? "Update Employee Role"
                : "Assign Role to Employee"}
            </h3>
            <p className="mb-3 md:mb-4 text-sm md:text-base">
              Employee:{" "}
              <span className="font-bold">
                {employees[roleEmployeeIndex]?.name}
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
              {employees[roleEmployeeIndex]?.role && (
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
                {employees[roleEmployeeIndex]?.role
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

export default EmployeeManagement;
