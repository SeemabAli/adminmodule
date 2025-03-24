import { useEffect, useState } from "react";
import { notify } from "@/lib/notify";
import { FormField } from "@/common/components/ui/form/FormField";
import { useForm } from "react-hook-form";
import { Button } from "@/common/components/ui/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { taxSchema, type Tax, type TaxApplication } from "./tax.schema";
import { useService } from "@/common/hooks/custom/useService";
import {
  createTax,
  fetchAllTaxes,
  updateTax,
  deleteTax,
  fetchTaxApplications,
  type TaxRequestPayload,
} from "./tax.service";
import { logger } from "@/lib/logger";
import { ErrorModal } from "@/common/components/Error";
import PencilSquareIcon from "@heroicons/react/24/solid/PencilSquareIcon";
import TrashIcon from "@heroicons/react/24/solid/TrashIcon";
import { ApiException } from "@/utils/exceptions";

const TaxAccounts = () => {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [editingTaxId, setEditingTaxId] = useState<string | null>(null);
  const [selectedApplicationIds, setSelectedApplicationIds] = useState<
    Set<string>
  >(new Set());
  const [taxApplications, setTaxApplications] = useState<TaxApplication[]>([]);
  const [selectedOption, setSelectedOption] = useState<"percentage" | "fixed">(
    "percentage",
  );
  const { error, data, isLoading } = useService(fetchAllTaxes);

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    setValue,
    setFocus,
    reset,
    watch,
  } = useForm<Tax>({
    resolver: zodResolver(taxSchema),
    defaultValues: {
      id: "",
      name: "",
      rateValue: 0,
      rateType: "percentage",
      applications: [],
    },
  });

  // Watch the rate value to validate it before submission
  const rateValue = watch("rateValue");

  const handleTaxChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue && !selectedApplicationIds.has(selectedValue)) {
      setSelectedApplicationIds(
        new Set([...selectedApplicationIds, selectedValue]),
      );
    }
  };

  const removeSelectedTax = (tax: string) => {
    setSelectedApplicationIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(tax);
      return newSet;
    });
  };

  const validateTaxRate = (
    rateValue: number,
    rateType: "percentage" | "fixed",
  ): boolean => {
    if (rateType === "percentage" && rateValue > 100) {
      notify.error("Percentage rate cannot exceed 100%.");
      return false;
    }
    return true;
  };

  const handleAddTax = async (formData: Tax) => {
    if (selectedApplicationIds.size === 0) {
      notify.error("Please select at least one tax type.");
      return;
    }

    // Validate tax rate based on type
    if (!validateTaxRate(formData.rateValue, selectedOption)) {
      return;
    }

    try {
      // Create applications array from selectedApplicationIds
      const applications = Array.from(selectedApplicationIds).map((id) => {
        const application = taxApplications.find((app) => app.id === id);
        return {
          id,
          name: application?.name ?? "",
        };
      });

      const taxPayload: TaxRequestPayload = {
        ...formData,
        rateType: selectedOption,
        applicationIds: [...selectedApplicationIds],
        applications: applications,
      };

      const response = (await createTax(taxPayload)) as { id: string };

      // Assuming the API returns the created tax with an ID
      const newTax = {
        ...taxPayload,
        id: response.id,
        applications,
      };

      setTaxes([...taxes, newTax]);
      reset();
      setSelectedApplicationIds(new Set());
      setSelectedOption("percentage");
      notify.success("Tax added successfully!");
    } catch (error: unknown) {
      logger.error(error);

      if (error instanceof ApiException) {
        if (error.statusCode === 409) {
          if (selectedOption === "percentage") {
            notify.error("Tax percentage should be under 100%.");
          } else {
            notify.error("Tax already exists.");
          }
        }
        return;
      }
      notify.error("Failed to add tax.");
    }
  };

  const onTaxUpdate = async (formData: Tax) => {
    if (selectedApplicationIds.size === 0) {
      notify.error("Please select at least one tax type.");
      return Promise.reject();
    }

    if (!editingTaxId) {
      notify.error("No tax selected for update.");
      return Promise.reject();
    }

    // Validate tax rate based on type
    if (!validateTaxRate(formData.rateValue, selectedOption)) {
      return Promise.reject();
    }

    try {
      // Create applications array from selectedApplicationIds
      const applications = Array.from(selectedApplicationIds).map((id) => {
        const application = taxApplications.find((app) => app.id === id);
        return {
          id,
          name: application?.name ?? "",
        };
      });
      const taxData: TaxRequestPayload = {
        ...formData,
        id: editingTaxId,
        rateType: selectedOption,
        applicationIds: [...selectedApplicationIds],
        applications: applications,
      };
      await updateTax(editingTaxId, taxData);
      setTaxes(
        taxes.map((tax) => {
          if (tax.id === editingTaxId) {
            return { ...taxData, id: editingTaxId } as Tax;
          }
          return tax;
        }),
      );

      setEditingTaxId(null);
      reset();
      setSelectedApplicationIds(new Set());
      setSelectedOption("percentage");
      notify.success("Tax updated successfully!");
      await Promise.resolve();
      return;
    } catch (error: unknown) {
      logger.error(error);

      if (error instanceof ApiException) {
        if (error.statusCode === 409) {
          if (selectedOption === "percentage") {
            notify.error("Tax percentage should be under 100%.");
          } else {
            notify.error("Failed to update tax. It may already exist.");
          }
        } else {
          notify.error("Failed to update tax.");
        }
      } else {
        notify.error("Failed to update tax.");
      }
      return Promise.reject();
    }
  };

  const handleRadioChange = (value: "percentage" | "fixed") => {
    setSelectedOption(value);
  };

  const handleEdit = (tax: Tax) => {
    // Validate the tax object has an ID
    if (!tax.id || tax.id === "") {
      notify.error("Cannot edit tax without an ID");
      return;
    }

    setValue("id", tax.id);
    setValue("name", tax.name);
    setValue("rateValue", tax.rateValue);
    setValue("rateType", tax.rateType);
    setValue("applications", tax.applications);

    setSelectedOption(tax.rateType);
    setSelectedApplicationIds(new Set(tax.applications.map((app) => app.id)));
    setFocus("name");
    setEditingTaxId(tax.id);
  };

  const handleDelete = (tax: Tax) => {
    // Validate the tax object has an ID
    if (!tax.id || tax.id === "") {
      notify.error("Cannot delete tax without an ID");
      return;
    }

    notify.confirmDelete(async () => {
      try {
        if (!tax.id) {
          notify.error("Tax ID is missing.");
          return;
        }

        await deleteTax(tax.id);

        // Update the local state after successful deletion
        setTaxes(taxes.filter((t) => t.id !== tax.id));
        notify.success("Tax deleted successfully!");
      } catch (error) {
        notify.error("Failed to delete tax.");
        logger.error(error);
      }
    });
  };

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const applications = await fetchTaxApplications();
        setTaxApplications(applications);
      } catch (error) {
        console.error("Error fetching tax options:", error);
        notify.error("Failed to fetch tax options.");
      }
    };

    void fetchOptions();
  }, []);

  useEffect(() => {
    if (data) {
      setTaxes(
        data.map((tax: Partial<Tax>) => ({
          id: tax.id ?? "",
          name: tax.name ?? "",
          rateValue: tax.rateValue ?? 0,
          rateType: tax.rateType ?? "percentage",
          applications: tax.applications ?? [],
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
                Select tax type
              </option>
              {taxApplications.map((application) => (
                <option
                  key={application.id}
                  value={application.id}
                  disabled={selectedApplicationIds.has(application.id)}
                  className="option"
                >
                  {application.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedApplicationIds.size > 0 && (
          <div className="mb-4">
            <p className="font-medium">Selected Taxes:</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {taxApplications
                .filter((application) =>
                  selectedApplicationIds.has(application.id),
                )
                .map((application) => (
                  <span
                    key={application.id}
                    className="badge badge-primary flex items-center gap-2"
                  >
                    {application.name}
                    <button
                      onClick={() => {
                        removeSelectedTax(application.id);
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
              placeholder={
                selectedOption === "percentage"
                  ? "Enter Tax Rate (0-100%)"
                  : "Enter Fixed Rate"
              }
              name="rateValue"
              label={`Tax Rate ${selectedOption === "percentage" ? "(0-100%)" : ""}`}
              register={register}
              errorMessage={errors.rateValue?.message}
            />
            {selectedOption === "percentage" && rateValue > 100 && (
              <p className="text-red-500 text-sm mt-1">
                Percentage rate cannot exceed 100%
              </p>
            )}
          </div>
        </div>

        <Button
          onClick={
            editingTaxId !== null
              ? handleSubmit(onTaxUpdate)
              : handleSubmit(handleAddTax)
          }
          shape="info"
          pending={isSubmitting}
          className="mt-4"
        >
          {editingTaxId !== null ? "Update Tax" : "Add Tax"}
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
                  <td className="p-3">
                    {tax.applications && tax.applications.length > 0
                      ? tax.applications.map((x) => x.name).join(", ")
                      : "None"}
                  </td>
                  <td className="p-3">{tax.rateType}</td>
                  <td className="p-3">{tax.rateValue}</td>
                  <td className="p-3 flex justify-center">
                    <button
                      onClick={() => {
                        handleEdit(tax);
                      }}
                      className="flex items-center mt-1 justify-center mr-2"
                    >
                      <PencilSquareIcon className="w-5 h-5 text-info" />
                    </button>

                    <button
                      onClick={() => {
                        handleDelete(tax);
                      }}
                      className="flex items-center mt-1 justify-center"
                    >
                      <TrashIcon className="w-5 h-5 text-red-500" />
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
