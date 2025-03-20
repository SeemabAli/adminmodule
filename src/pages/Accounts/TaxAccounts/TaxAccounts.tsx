import { useEffect, useState } from "react";

export type Tax = {
  name: string;
  rateValue: number;
  rateType: string;
  applicableOn: string[];
};
import { notify } from "@/lib/notify";
import { FormField } from "@/common/components/ui/form/FormField";
import { useForm } from "react-hook-form";
import { Button } from "@/common/components/ui/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { taxSchema, type TaxFormData } from "./tax.schema";
import { useService } from "@/common/hooks/custom/useService";
import { createTax, fetchAllTaxes } from "./tax.service";
import { logger } from "@/lib/logger";
import { ErrorModal } from "@/common/components/Error";

const TaxAccounts = () => {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedTaxes, setSelectedTaxes] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(
    "percentage",
  );
  const { error, data, isLoading } = useService(fetchAllTaxes);

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
      name: "",
      rateValue: 0,
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

  // const handleAddTax = async (formData: {
  //   taxName: string;
  //   taxRate: number;
  // }) => {
  //   if (selectedTaxes.length === 0) {
  //     notify.error("Please select at least one tax type.");
  //     return Promise.reject();
  //   }

  //   if (!selectedOption) {
  //     notify.error("Please select a rate type.");
  //     return Promise.reject();
  //   }

  //   const newTax: Tax = {
  //     ...formData,
  //     rateType: selectedOption,
  //     applicableOn: [...selectedTaxes],
  //   };

  //   setTaxes([...taxes, newTax]);
  //   reset();
  //   setSelectedTaxes([]);
  //   setSelectedOption(null);
  //   notify.success("Tax added successfully!");
  //   return Promise.resolve(newTax);
  // };

  const handleAddTax = async (newTaxFormData: TaxFormData) => {
    try {
      const TaxPayload = {
        ...newTaxFormData,
        rateType: selectedOption ?? "",
        applicableOn: [...selectedTaxes],
      };
      await createTax(TaxPayload);
      setTaxes([...taxes, TaxPayload]);
      reset();
      setSelectedTaxes([]);
      setSelectedOption(null);
      notify.success("Tax added successfully!");
    } catch (error) {
      notify.error("Failed to add tax.");
      logger.error(error);
    }
  };
  const onTaxUpdate = async (updatedTaxIndex: number) => {
    if (selectedTaxes.length === 0) {
      notify.error("Please select at least one tax type.");
      return Promise.reject();
    }

    if (!selectedOption) {
      notify.error("Please select a rate type.");
      return Promise.reject();
    }

    const formData = getValues();
    const updatedTaxes = taxes.map((tax, index) => {
      if (index === updatedTaxIndex) {
        return {
          ...formData,
          rateType: selectedOption,
          applicableOn: [...selectedTaxes],
        };
      }
      return tax;
    });

    setTaxes(updatedTaxes);
    setEditingIndex(null);
    reset();
    setSelectedTaxes([]);
    setSelectedOption(null);
    notify.success("Tax updated successfully!");
    return Promise.resolve(updatedTaxes);
  };

  const handleRadioChange = (value: string) => {
    setSelectedOption((prev) => (prev === value ? null : value));
  };

  const handleEdit = (index: number) => {
    const targetTax = taxes[index];
    if (!targetTax) return;

    setValue("name", targetTax.name);
    setValue("rateValue", targetTax.rateValue);
    setSelectedOption(targetTax.rateType);
    setSelectedTaxes([...targetTax.applicableOn]);
    setFocus("name");
    setEditingIndex(index);
  };

  const handleDelete = (index: number) => {
    notify.confirmDelete(() => {
      setTaxes(taxes.filter((_, i) => i !== index));
      notify.success("Tax deleted successfully!");
    });
  };

  useEffect(() => {
    if (data) {
      setTaxes(
        data.map((tax: Partial<Tax>) => ({
          name: tax.name ?? "",
          rateValue: tax.rateValue ?? 0,
          rateType: tax.rateType ?? "Unknown", // Provide a default value if rateType is missing
          applicableOn: tax.applicableOn ?? [], // Ensure applicableOn is an array
        })),
      );
    }
  }, [data]);

  if (error) {
    return (
      <ErrorModal
        message={
          error instanceof Error ? error.message : "Failed to fetch Taxes Data"
        }
      />
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Tax Management</h2>

      <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <FormField
            placeholder="Enter Tax Name"
            name="name"
            label="Tax Name"
            register={register}
            errorMessage={errors.name?.message}
          />

          <div className="flex flex-col">
            <label className="block w-full relative font-medium">
              Select Tax Type
            </label>
            <select
              onChange={handleTaxChange}
              className="select select-bordered w-full mb-1"
              value=""
            >
              <option value="" disabled>
                Select a Tax Type
              </option>
              {taxOptions.map((tax) => (
                <option
                  key={tax}
                  value={tax}
                  disabled={selectedTaxes.includes(tax)}
                  className="option"
                >
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
                <input
                  type="radio"
                  value="percentage"
                  checked={selectedOption === "percentage"}
                  onChange={() => {
                    handleRadioChange("percentage");
                  }}
                  className="radio-info"
                />
                <span>Percentage</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="fixed"
                  checked={selectedOption === "fixed"}
                  onChange={() => {
                    handleRadioChange("fixed");
                  }}
                  className="radio-info"
                />
                <span>Fixed/Bag</span>
              </label>
            </div>
            <FormField
              type="number"
              placeholder="Enter Tax Rate"
              name="rateValue"
              label="Tax Rate"
              register={register}
              errorMessage={errors.rateValue?.message}
            />
          </div>
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

      {isLoading && <div className="skeleton h-28 w-full"></div>}
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
                  <td className="p-3">{tax.name}</td>
                  <td className="p-3">{tax.applicableOn.join(", ")}</td>
                  <td className="p-3">{tax.rateType}</td>
                  <td className="p-3">{tax.rateValue}</td>
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
