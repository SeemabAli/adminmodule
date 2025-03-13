import { useState } from "react";
import { z } from "zod";
import { notify } from "../../lib/notify";
import Input from "../../components/Input";

// Define validation schema
const companySchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(50, "Name is too long"),
    address: z.string().min(5, "Address must be at least 5 characters").max(100, "Address is too long"),
});

const CompanyAccounts = () => {
    const [companies, setCompanies] = useState<{ name: string; address: string }[]>([]);
    const [companyName, setCompanyName] = useState("");
    const [companyAddress, setCompanyAddress] = useState("");
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [touchedFields, setTouchedFields] = useState<{ name: boolean; address: boolean }>({ name: false, address: false });

    // Validate input fields
    const validateFields = () => {
        const result = companySchema.safeParse({ name: companyName, address: companyAddress });
        if (!result.success) {
            const newErrors = result.error.flatten().fieldErrors;
            return {
                name: newErrors.name?.[0] || (companyName.trim() === "" ? "This field is required" : ""),
                address: newErrors.address?.[0] || (companyAddress.trim() === "" ? "This field is required" : ""),
            };
        }
        return { name: "", address: "" };
    };

    const errors = validateFields();

    const handleAddCompany = () => {
        // Mark all fields as touched
        setTouchedFields({ name: true, address: true });

        // Prevent submission if there are validation errors
        if (errors.name || errors.address) {
            notify.error("Please enter valid details.");
            return;
        }

        try {
            if (editingIndex !== null) {
                const updatedCompanies = [...companies];
                updatedCompanies[editingIndex] = { name: companyName, address: companyAddress };
                setCompanies(updatedCompanies);
                notify.success("Company updated successfully.");
                setEditingIndex(null);
            } else {
                setCompanies([...companies, { name: companyName, address: companyAddress }]);
                notify.success("Company added successfully.");
            }

            // Reset fields
            setCompanyName("");
            setCompanyAddress("");
            setTouchedFields({ name: false, address: false }); // Reset error state
        } catch (error) {
            console.error("Error adding/updating company:", error);
            notify.error("An unexpected error occurred.");
        }
    };

    const handleEdit = (index: number) => {
        try {
            setCompanyName(companies[index].name);
            setCompanyAddress(companies[index].address);
            setEditingIndex(index);
        } catch (error) {
            console.error("Error editing company:", error);
            notify.error("An unexpected error occurred while editing.");
        }
    };

    const handleDelete = (index: number) => {
        try {
            const updatedCompanies = companies.filter((_, i) => i !== index);
            setCompanies(updatedCompanies);
            notify.success("Company deleted successfully.");
        } catch (error) {
            console.error("Error deleting company:", error);
            notify.error("An unexpected error occurred while deleting.");
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Company Accounts</h2>
            <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block mb-1 font-medium">
                        Company Name
                        <Input
                            placeholder="Enter Name"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            error={touchedFields.name ? errors.name : ""}
                            onBlur={() => setTouchedFields((prev) => ({ ...prev, name: true }))}
                        />
                    </label>
                    <label className="block mb-1 font-medium">
                        Company Address
                        <Input
                            placeholder="Enter Address"
                            value={companyAddress}
                            onChange={(e) => setCompanyAddress(e.target.value)}
                            error={touchedFields.address ? errors.address : ""}
                            onBlur={() => setTouchedFields((prev) => ({ ...prev, address: true }))}
                        />
                    </label>
                </div>
                <button
                    onClick={handleAddCompany}
                    className="btn btn-primary mt-4"
                    disabled={!!errors.name || !!errors.address}
                >
                    {editingIndex !== null ? "Update Company" : "Add Company"}
                </button>
            </div>
            {companies.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="table w-full bg-base-200 rounded-lg shadow-md">
                        <thead>
                            <tr className="bg-base-300 text-base-content text-center">
                                <th className="p-3">#</th>
                                <th className="p-3">Company Name</th>
                                <th className="p-3">Company Address</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {companies.map((company, index) => (
                                <tr key={index} className="border-b border-base-300 text-center">
                                    <td className="p-3">{index + 1}</td>
                                    <td className="p-3">{company.name}</td>
                                    <td className="p-3">{company.address}</td>
                                    <td className="p-3 flex gap-2 justify-center">
                                        <button
                                            onClick={() => handleEdit(index)}
                                            className="btn btn-sm btn-accent"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(index)}
                                            className="btn btn-sm btn-neutral"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-500 text-center">No companies added yet.</p>
            )}
        </div>
    );
};

export default CompanyAccounts;
