import { useState } from "react";

const TaxAccounts = () => {
    const [taxes, setTaxes] = useState<{ taxName: string; taxType: string; taxRateType: string; taxValue: string }[]>([]);
    const [taxName, setTaxName] = useState("");
    const [taxType, setTaxType] = useState("Sales Tax");
    const [taxRateType, setTaxRateType] = useState("Percentage");
    const [taxValue, setTaxValue] = useState("");
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const taxTypes = ["Sales Tax", "Income Tax", "Excise Duty", "Customs Duty"];

    const handleSaveTax = () => {
        if (taxName.trim() === "" || taxValue.trim() === "") return;
        if (isNaN(Number(taxValue)) || Number(taxValue) < 0) {
            alert("Please enter a valid tax value.");
            return;
        }

        if (editingIndex !== null) {
            const updatedTaxes = [...taxes];
            updatedTaxes[editingIndex] = { taxName, taxType, taxRateType, taxValue };
            setTaxes(updatedTaxes);
            setEditingIndex(null);
        } else {
            setTaxes([...taxes, { taxName, taxType, taxRateType, taxValue }]);
        }

        resetForm();
    };

    const handleEditTax = (index: number) => {
        const tax = taxes[index];
        setTaxName(tax.taxName);
        setTaxType(tax.taxType);
        setTaxRateType(tax.taxRateType);
        setTaxValue(tax.taxValue);
        setEditingIndex(index);
    };

    const handleDeleteTax = (index: number) => {
        setTaxes(taxes.filter((_, i) => i !== index));
    };

    const resetForm = () => {
        setTaxName("");
        setTaxType("Sales Tax");
        setTaxRateType("Percentage");
        setTaxValue("");
        setEditingIndex(null);
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Tax Accounts</h2>

            <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Tax Name" value={taxName} onChange={(e) => setTaxName(e.target.value)} className="input input-bordered w-full" />
                    <select value={taxType} onChange={(e) => setTaxType(e.target.value)} className="select select-bordered w-full">
                        {taxTypes.map((type, index) => (<option key={index} value={type}>{type}</option>))}
                    </select>
                    <div className="flex gap-4 items-center">
                        <label className="flex items-center space-x-2">
                            <input type="radio" name="taxRateType" value="Percentage" checked={taxRateType === "Percentage"} onChange={() => setTaxRateType("Percentage")} className="radio" />
                            <span>Percentage (%)</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input type="radio" name="taxRateType" value="Fixed Per Bag" checked={taxRateType === "Fixed Per Bag"} onChange={() => setTaxRateType("Fixed Per Bag")} className="radio" />
                            <span>Fixed Per Bag</span>
                        </label>
                    </div>
                    <input type="text" placeholder={taxRateType === "Percentage" ? "Enter Percentage (%)" : "Enter Fixed Rate (Per Bag)"} value={taxValue} onChange={(e) => setTaxValue(e.target.value)} className="input input-bordered w-full" />
                </div>
                <button onClick={handleSaveTax} className="btn btn-primary mt-4">
                    {editingIndex !== null ? "Update Tax" : "Save Tax"}
                </button>
                {editingIndex !== null && (
                    <button onClick={resetForm} className="btn btn-secondary ml-2">Cancel</button>
                )}
            </div>

            {taxes.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="table w-full bg-base-200 rounded-lg shadow-md">
                        <thead>
                            <tr className="bg-base-300 text-base-content text-center">
                                <th className="p-3">#</th>
                                <th className="p-3">Tax Name</th>
                                <th className="p-3">Tax Type</th>
                                <th className="p-3">Rate Type</th>
                                <th className="p-3">Value</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {taxes.map((tax, index) => (
                                <tr key={index} className="border-b border-base-300 text-center">
                                    <td className="p-3">{index + 1}</td>
                                    <td className="p-3">{tax.taxName}</td>
                                    <td className="p-3">{tax.taxType}</td>
                                    <td className="p-3">{tax.taxRateType}</td>
                                    <td className="p-3">{tax.taxValue}</td>
                                    <td className="p-3">
                                        <button onClick={() => handleEditTax(index)} className="btn btn-sm btn-warning">Edit</button>
                                        <button onClick={() => handleDeleteTax(index)} className="btn btn-sm btn-error ml-2">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-500 text-center">No tax accounts found.</p>
            )}
        </div>
    );
};

export default TaxAccounts;