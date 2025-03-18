import { useState } from "react";
import { notify } from "@/lib/notify";
import { FormField } from "@/common/components/ui/form/FormField";
import { useForm } from "react-hook-form";
import { Button } from "@/common/components/ui/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { taxSchema } from "./tax.schema";

interface Tax {
  taxName: string;
  appliedTaxes: string[];
  taxRate: number;
  rateType: "Percentage" | "Fixed/Bag";
}

const TaxAccounts = () => {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [taxName, setTaxName] = useState("");
  const [selectedTaxes, setSelectedTaxes] = useState<string[]>([]);
  const [taxRate, setTaxRate] = useState("");
  const [rateType, setRateType] = useState<"Percentage" | "Fixed/Bag">(
    "Percentage",
  );
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const taxOptions: string[] = [
    "On Purchase Price",
    "On Commission (Next Month)",
    "On Commission (Same Month)",
    "On Bank Payments to Company",
    "On Retail/Sale Price",
  ];

  const {
    register,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(taxSchema),
    defaultValues: {
      taxName: "",
      taxRate: 0,
    },
  });

  const handleTaxChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue && !selectedTaxes.includes(selectedValue)) {
      setSelectedTaxes([...selectedTaxes, selectedValue]);
    }
  };

  const removeSelectedTax = (tax: string) => {
    setSelectedTaxes(selectedTaxes.filter((t) => t !== tax));
  };

  const handleSave = () => {
    if (!taxName.trim() || selectedTaxes.length === 0 || !taxRate.trim()) {
      notify.error("Please fill in all fields.");
      return;
    }

    const numericTaxRate = Number(taxRate);
    if (isNaN(numericTaxRate) || numericTaxRate < 0) {
      notify.error("Please enter a valid tax rate.");
      return;
    }

    const newTax = {
      taxName,
      appliedTaxes: selectedTaxes,
      taxRate: numericTaxRate,
      rateType,
    };

    if (editIndex !== null) {
      const updatedTaxes = [...taxes];
      updatedTaxes[editIndex] = newTax;
      setTaxes(updatedTaxes);
      notify.success("Tax updated successfully!");
    } else {
      setTaxes([...taxes, newTax]);
      notify.success("Tax added successfully!");
    }

    resetForm();
  };

  const handleEdit = (index: number) => {
    const tax = taxes.find((_, i) => i === index);
    if (!tax) return;
    setTaxName(tax.taxName);
    setSelectedTaxes(tax.appliedTaxes);
    setTaxRate(tax.taxRate.toString());
    setRateType(tax.rateType);
    setEditIndex(index);
  };

  const handleDelete = (index: number) => {
    notify.confirmDelete(() => {
      setTaxes((prev) => prev.filter((_, i) => i !== index));
      notify.success("Tax deleted successfully!");
    });
  };

  const resetForm = () => {
    setTaxName("");
    setSelectedTaxes([]);
    setTaxRate("");
    setRateType("Percentage");
    setEditIndex(null);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Tax Management</h2>

      {/* Tax Form */}
      <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
        <FormField
          type="text"
          placeholder="Enter Tax Name"
          value={taxName}
          onChange={(e) => {
            setTaxName(e.target.value);
          }}
          name="taxName"
          label="Tax Name"
          register={register}
          errorMessage={errors.taxName?.message}
        />

        {/* Tax Type Dropdown */}
        <label className="block w-full relative mb-1 font-medium top-1 right-2">
          Select Tax Type
        </label>
        <select
          onChange={handleTaxChange}
          className="select select-bordered w-full mb-4 relative right-2"
          defaultValue=""
        >
          <option value="" disabled>
            Select a Tax Type
          </option>
          {taxOptions.map((tax) => (
            <option key={tax} value={tax} className="option">
              {tax}
            </option>
          ))}
        </select>

        {/* Display Selected Taxes */}
        {selectedTaxes.length > 0 && (
          <div className="mb-4">
            <p className="font-medium">Selected Taxes:</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedTaxes.map((tax) => (
                <span
                  key={tax}
                  className="badge badge-primary flex items-center gap-2"
                >
                  {tax}
                  <button
                    onClick={() => {
                      removeSelectedTax(tax);
                    }}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tax Rate Selection */}
        <label className="block font-medium mb-1">Tax Rate</label>
        <div className="flex items-center gap-4 mb-1">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="rateType"
              value="Percentage"
              checked={rateType === "Percentage"}
              onChange={() => {
                setRateType("Percentage");
              }}
              className="radio-info"
            />
            <span>Percentage</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="rateType"
              value="Fixed/Bag"
              checked={rateType === "Fixed/Bag"}
              onChange={() => {
                setRateType("Fixed/Bag");
              }}
              className="radio-info"
            />
            <span>Fixed/Bag</span>
          </label>
        </div>

        <FormField
          type="number"
          placeholder="Enter Tax Rate"
          value={taxRate}
          onChange={(e) => {
            setTaxRate(e.target.value);
          }}
          name="taxRate"
          label=""
          register={register}
          errorMessage={errors.taxRate?.message}
        />

        {/* Save Button */}
        <Button
          onClick={handleSave}
          shape="info"
          pending={isSubmitting}
          className="mt-4"
        >
          {editIndex !== null ? "Update" : "Save"}
        </Button>
      </div>

      {/* Display Tax Entries */}
      {taxes.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table w-full bg-base-200 rounded-lg shadow-md">
            <thead>
              <tr className="bg-base-300 text-base-content text-center">
                <th className="p-3">#</th>
                <th className="p-3">Tax Name</th>
                <th className="p-3">Applied Taxes</th>
                <th className="p-3">Rate Type</th>
                <th className="p-3">Tax Rate</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {taxes.map((tax, index) => (
                <tr
                  key={index}
                  className="border-b border-base-300 text-center"
                >
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{tax.taxName}</td>
                  <td className="p-3">{tax.appliedTaxes.join(", ")}</td>
                  <td className="p-3">{tax.rateType}</td>
                  <td className="p-3">{tax.taxRate}</td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => {
                        handleEdit(index);
                      }}
                      className="btn btn-sm btn-warning"
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6 text-center text-gray-500">
          No tax entries found.
        </div>
      )}
    </div>
  );
};

export default TaxAccounts;
