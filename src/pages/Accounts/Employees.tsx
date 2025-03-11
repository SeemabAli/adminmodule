import { useState } from "react";

const Employees = () => {
    const [employees, setEmployees] = useState<{ name: string; phone: string; cnic: string; designation: string; department: string; salary: string }[]>([]);
    const [employeeName, setEmployeeName] = useState("");
    const [employeePhone, setEmployeePhone] = useState("");
    const [employeeCnic, setEmployeeCnic] = useState("");
    const [designation, setDesignation] = useState("");
    const [department, setDepartment] = useState("");
    const [salary, setSalary] = useState("");
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Handle form submission
    const handleAddEmployee = () => {
        if (employeeName.trim() === "" || employeePhone.trim() === "" || employeeCnic.trim() === "" || designation.trim() === "" || salary.trim() === "") return;

        if (editingIndex !== null) {
            // Update existing employee
            const updatedEmployees = [...employees];
            updatedEmployees[editingIndex] = { name: employeeName, phone: employeePhone, cnic: employeeCnic, designation, department, salary };
            setEmployees(updatedEmployees);
            setEditingIndex(null);
        } else {
            // Add new employee
            setEmployees([...employees, { name: employeeName, phone: employeePhone, cnic: employeeCnic, designation, department, salary }]);
        }

        // Clear inputs
        setEmployeeName("");
        setEmployeePhone("");
        setEmployeeCnic("");
        setDesignation("");
        setDepartment("Driver");
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
                    <input
                        type="text"
                        placeholder="Employee Name"
                        value={employeeName}
                        onChange={(e) => setEmployeeName(e.target.value)}
                        className="input input-bordered w-full"
                    />
                    <input
                        type="text"
                        placeholder="Employee Phone"
                        value={employeePhone}
                        onChange={(e) => setEmployeePhone(e.target.value)}
                        className="input input-bordered w-full"
                    />
                    <input
                        type="text"
                        placeholder="Employee CNIC"
                        value={employeeCnic}
                        onChange={(e) => setEmployeeCnic(e.target.value)}
                        className="input input-bordered w-full"
                    />
                    <input
                        type="text"
                        placeholder="Designation"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="input input-bordered w-full"
                    />
                    {/* Department Dropdown */}
                    <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="select select-bordered w-full"
                    >
                        <option value="Driver">Driver</option>
                        <option value="Manager">Manager</option>
                        <option value="Engineer">Engineer</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Salary"
                        value={salary}
                        onChange={(e) => setSalary(e.target.value)}
                        className="input input-bordered w-full"
                    />
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
