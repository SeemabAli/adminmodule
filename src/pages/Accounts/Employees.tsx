import { useState } from "react";
import { notify } from "../../lib/notify";

const Employees = () => {
    const [employees, setEmployees] = useState<
        { name: string; phone: string; cnic: string; designation: string; department: string; salary: string }[]
    >([]);
    const [employeeName, setEmployeeName] = useState("");
    const [employeePhone, setEmployeePhone] = useState("+92");
    const [employeeCnic, setEmployeeCnic] = useState("");
    const [designation, setDesignation] = useState("");
    const [department, setDepartment] = useState("");
    const [salary, setSalary] = useState("");
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Handle Phone Input (Always starts with +92 and allows only 10 digits)
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
        if (value.startsWith("92")) value = value.substring(2); // Remove leading 92 if user types it
        if (value.length > 10) value = value.slice(0, 10); // Limit to 10 digits
        setEmployeePhone(`+92${value}`);
    };

    // Handle CNIC Input (Auto-format XXXXX-XXXXXXX-X)
    const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters

        setEmployeeCnic(value);
    };

    // Handle form submission
    const handleAddEmployee = () => {
        if (employeeName.trim() === "" || employeePhone.length !== 13 || employeeCnic.length !== 20 || designation.trim() === "" || salary.trim() === "") {
            notify.error("Please Fill All Fields Correctly!!!")

            return;
        }

        if (editingIndex !== null) {
            const updatedEmployees = [...employees];
            updatedEmployees[editingIndex] = { name: employeeName, phone: employeePhone, cnic: employeeCnic, designation, department, salary };
            setEmployees(updatedEmployees);
            setEditingIndex(null);
        } else {
            setEmployees([...employees, { name: employeeName, phone: employeePhone, cnic: employeeCnic, designation, department, salary }]);
        }

        // Clear inputs
        setEmployeeName("");
        setEmployeePhone("+92");
        setEmployeeCnic("");
        setDesignation("");
        setDepartment("");
        setSalary("");
    };

    // Handle edit button click
    const handleEdit = (index: number) => {
        const employee = employees[index];
        setEmployeeName(employee.name);
        setEmployeePhone(employee.phone);
        setEmployeeCnic(employee.cnic);
        setDesignation(employee.designation);
        setDepartment(employee.department);
        setSalary(employee.salary);
        setEditingIndex(index);
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Employee Management</h2>

            {/* Form */}
            <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block mb-1 font-medium">Employee Name
                        <input
                            type="text"
                            required
                            placeholder="Employee Name"
                            value={employeeName}
                            onChange={(e) => setEmployeeName(e.target.value)}
                            className="input input-bordered w-full"
                        />
                    </label>
                    <label className="block mb-1 font-medium">Employee Phone
                        <input
                            type="text"
                            placeholder="Employee Phone (+92XXXXXXXXXX)"
                            value={employeePhone}
                            onChange={handlePhoneChange}
                            className="input input-bordered w-full"
                            maxLength={13} // +92XXXXXXXXXX (13 characters)
                        />
                    </label>
                    <label className="block mb-1 font-medium">Employee CNIC
                        <input
                            type="text"
                            placeholder="Employee CNIC"
                            value={employeeCnic}
                            onChange={handleCnicChange}
                            className="input input-bordered w-full"
                            maxLength={20} // CNIC format XXXXX-XXXXXXX-X (15 characters)
                        />
                    </label>
                    <label className="block mb-1 font-medium">Designation
                        <input
                            type="text"
                            placeholder="Designation"
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            className="input input-bordered w-full"
                        />
                    </label>
                    {/* Department Dropdown */}
                    <label className="block mb-1 font-medium">Department
                        <select
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="select select-bordered w-full"
                        >
                            <option value="">Select Department</option>
                            <option value="Driver">Driver</option>
                            <option value="Manager">Manager</option>
                            <option value="Engineer">Engineer</option>
                        </select>
                    </label>
                    <label className="block mb-1 font-medium">Salary
                        <input
                            type="text"
                            placeholder="Salary"
                            value={salary}
                            onChange={(e) => setSalary(e.target.value)}
                            className="input input-bordered w-full"
                        />
                    </label>
                </div>
                <button onClick={handleAddEmployee} className="btn btn-primary mt-4">
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
                                <th className="p-3">CNIC</th>
                                <th className="p-3">Designation</th>
                                <th className="p-3">Department</th>
                                <th className="p-3">Salary</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((employee, index) => (
                                <tr key={index} className="border-b border-base-300 text-center">
                                    <td className="p-3">{index + 1}</td>
                                    <td className="p-3">{employee.name}</td>
                                    <td className="p-3">{employee.phone}</td>
                                    <td className="p-3">{employee.cnic}</td>
                                    <td className="p-3">{employee.designation}</td>
                                    <td className="p-3">{employee.department}</td>
                                    <td className="p-3">{employee.salary}</td>
                                    <td className="p-3">
                                        <button
                                            onClick={() => handleEdit(index)}
                                            className="btn btn-sm btn-warning"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-500 text-center">No employees added yet.</p>
            )}
        </div>
    );
};

export default Employees;
