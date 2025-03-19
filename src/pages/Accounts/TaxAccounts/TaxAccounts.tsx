import { useState } from "react";

interface Tax {
  taxName: string;
  taxRate: number;
  rateType: string;
  appliedTaxes: string[];
}
import { notify } from "@/lib/notify";
import { FormField } from "@/common/components/ui/form/FormField";
import { useForm } from "react-hook-form";
import { Button } from "@/common/components/ui/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { taxSchema } from "./tax.schema";

const TaxAccounts = () => {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedTaxes, setSelectedTaxes] = useState<string[]>([]);

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
    handleSubmit,
    setValue,
    setFocus,
    getValues,
    reset,
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

  const handleAddTax = async (formData: {
    taxName: string;
    taxRate: number;
  }) => {
    if (selectedTaxes.length === 0) {
      notify.error("Please select at least one tax type.");
      return Promise.reject();
    }

    const newTax: Tax = {
      ...formData,
      rateType: "",
      appliedTaxes: [],
    };

    setTaxes([...taxes, newTax]);
    reset();
    setSelectedTaxes([]);
    notify.success("Tax added successfully!");
    return Promise.resolve(newTax);
  };

  const onTaxUpdate = async (updatedTaxIndex: number) => {
    if (selectedTaxes.length === 0) {
      notify.error("Please select at least one tax type.");
      return Promise.reject();
    }

    const formData = getValues();
    const updatedTaxes = taxes.map((tax, index) => {
      if (index === updatedTaxIndex) {
        return {
          ...formData,
          rateType: tax.rateType,
          appliedTaxes: selectedTaxes,
        };
      }
      return tax;
    });

    setTaxes(updatedTaxes);
    setEditingIndex(null);
    reset();
    setSelectedTaxes([]);
    notify.success("Tax updated successfully!");
    return Promise.resolve(updatedTaxes);
  };

  const handleEdit = (index: number) => {
    const targetTax = taxes.find((_, i) => i === index);
    if (!targetTax) return;

    setValue("taxName", targetTax.taxName);
    setValue("taxRate", targetTax.taxRate);
    setFocus("taxName");
    setEditingIndex(index);
  };

  const handleDelete = (index: number) => {
    notify.confirmDelete(() => {
      setTaxes(taxes.filter((_, i) => i !== index));
      notify.success("Tax deleted successfully!");
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Tax Management</h2>

      <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <FormField
            placeholder="Enter Tax Name"
            name="taxName"
            label="Tax Name"
            register={register}
            errorMessage={errors.taxName?.message}
          />

          <div className="flex flex-col">
            <label className="block w-full relative mb-1 font-medium">
              Select Tax Type
            </label>
            <select
              onChange={handleTaxChange}
              className="select select-bordered w-full mb-1"
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
          </div>
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block font-medium mb-1">Tax Rate Type</label>
            <div className="flex items-center gap-4 mb-2">
              <label className="flex items-center space-x-2">
                <input type="radio" value="Percentage" className="radio-info" />
                <span>Percentage</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="radio" value="Fixed/Bag" className="radio-info" />
                <span>Fixed/Bag</span>
              </label>
            </div>
          </div>

          <FormField
            type="number"
            placeholder="Enter Tax Rate"
            name="taxRate"
            label="Tax Rate"
            register={register}
            errorMessage={errors.taxRate?.message}
          />
        </div>

        <Button
          onClick={
            editingIndex !== null
              ? handleSubmit(() => {
                  void onTaxUpdate(editingIndex);
                })
              : handleSubmit(handleAddTax)
          }
          shape="info"
          pending={isSubmitting}
          className="mt-4"
        >
          {editingIndex !== null ? "Update Tax" : "Add Tax"}
        </Button>
      </div>

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
                  <td className="p-3">{tax.appliedTaxes}</td>
                  <td className="p-3">{tax.rateType}</td>
                  <td className="p-3">{tax.taxRate}</td>
                  <td className="p-3 flex gap-2 justify-center">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => {
                        handleEdit(index);
                      }}
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
