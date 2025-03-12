import { useState } from "react";

interface Product {
    productName: string;
    taxes: string[];
    taxValue: number;
}

const TaxAccounts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [productName, setProductName] = useState<string>("");
    const [selectedTaxes, setSelectedTaxes] = useState<string[]>([]);
    const [taxValue, setTaxValue] = useState<string>("");

    const taxOptions: string[] = ["Sales Tax", "Income Tax", "Excise Duty", "Customs Duty"];

    const handleTaxChange = (tax: string) => {
        setSelectedTaxes((prev) =>
            prev.includes(tax) ? prev.filter((t) => t !== tax) : [...prev, tax]
        );
    };

    const handleSave = () => {
        if (productName.trim() === "" || selectedTaxes.length === 0 || taxValue.trim() === "") return;
        const numericTaxValue = Number(taxValue);

        if (isNaN(numericTaxValue) || numericTaxValue < 0) {
            alert("Please enter a valid tax value.");
            return;
        }

        setProducts([...products, { productName, taxes: selectedTaxes, taxValue: numericTaxValue }]);
        setProductName("");
        setSelectedTaxes([]);
        setTaxValue("");
    };

    const handleDelete = (index: number) => {
        setProducts((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Product Tax Management</h2>

            <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
                {/* Product Name Input */}
                <label className="block font-medium mb-1">Product Name</label>
                <input
                    type="text"
                    placeholder="Enter Product Name"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="input input-bordered w-full mb-4"
                />

                {/* Tax Selection */}
                <label className="block font-medium mb-1">Select Taxes</label>
                <div className="grid grid-cols-2 md:grid-cols-10 gap-2 mb-4">
                    {taxOptions.map((tax) => (
                        <label key={tax} className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={selectedTaxes.includes(tax)}
                                onChange={() => handleTaxChange(tax)}
                                className="checkbox"
                            />
                            <span>{tax}</span>
                        </label>
                    ))}
                </div>

                {/* Tax Value Input */}
                <label className="block font-medium mb-1">Tax Value</label>
                <input
                    type="number"
                    placeholder="Enter Tax Value"
                    value={taxValue}
                    onChange={(e) => setTaxValue(e.target.value)}
                    className="input input-bordered w-full"
                />

                {/* Save Button */}
                <button onClick={handleSave} className="btn btn-primary mt-4">
                    Save
                </button>
            </div>

            {/* Display Product Tax Entries */}
            {products.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="table w-full bg-base-200 rounded-lg shadow-md">
                        <thead>
                            <tr className="bg-base-300 text-base-content text-center">
                                <th className="p-3">#</th>
                                <th className="p-3">Product Name</th>
                                <th className="p-3">Taxes</th>
                                <th className="p-3">Tax Value</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product, index) => (
                                <tr key={index} className="border-b border-base-300 text-center">
                                    <td className="p-3">{index + 1}</td>
                                    <td className="p-3">{product.productName}</td>
                                    <td className="p-3">{product.taxes.join(", ")}</td>
                                    <td className="p-3">{product.taxValue}</td>
                                    <td className="p-3">
                                        <button onClick={() => handleDelete(index)} className="btn btn-sm btn-error">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-500 text-center">No product tax entries found.</p>
            )}
        </div>
    );
};

export default TaxAccounts;
