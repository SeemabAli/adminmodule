/* eslint-disable @typescript-eslint/no-confusing-void-expression */
import React, { useEffect, useState } from "react";
import { notify } from "@/lib/notify";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/common/components/ui/Button";
import { FormField } from "@/common/components/ui/form/FormField";
import { ErrorModal } from "@/common/components/Error";
import { useService } from "@/common/hooks/custom/useService";
import { logger } from "@/lib/logger";
import { ApiException } from "@/utils/exceptions";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import {
  factoryExpensesSchema,
  type IFactoryExpenses,
} from "./factoryExpenses.schema";

// Import services
import {
  createFactoryExpenses,
  fetchAllFactoryExpenses,
  updateFactoryExpenses,
  deleteFactoryExpenses,
  fetchAllRanges,
} from "./factoryExpenses.service";

type RangeOption = {
  id: string;
  rangeFrom: number;
  rangeTo: number;
};

type TieredPrice = {
  rangeId: string;
  price: number;
};

const expenseTypes = [
  "Fixed Amount",
  "Fixed/Ton",
  "Percent/Ton",
  "Range Ton From",
] as const;

const expenseCategories = ["General", "Specific Product"] as const;

export const FactoryExpenses: React.FC = () => {
  // Use the service hook to fetch factory expenses
  const { error, data, isLoading } = useService(fetchAllFactoryExpenses);
  const [expenses, setExpenses] = useState<IFactoryExpenses[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isRangeTableOpen, setIsRangeTableOpen] = useState(false);
  const [rangeOptions, setRangeOptions] = useState<RangeOption[]>([]);
  const [tieredPrices, setTieredPrices] = useState<TieredPrice[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    reset,
    getValues,
    watch,
  } = useForm<IFactoryExpenses>({
    resolver: zodResolver(factoryExpensesSchema),
    defaultValues: {
      name: "",
      type: "General",
      expenseType: "Fixed Amount",
      extraCharge: 0,
      fixedAmountRate: 0,
      fixedPerTonRate: 0,
      percentagePerTonRate: 0,
    },
  });

  const expenseType = watch("expenseType");

  // Load expenses and range options
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch range options separately from the service hook
        const rangeData = await fetchAllRanges();
        setRangeOptions(rangeData);
      } catch (fetchError) {
        logger.error(fetchError);
        notify.error("Failed to fetch range options");
      }
    };

    void loadData();

    // Set expenses from the service hook data
    if (data) {
      setExpenses(data);
    }
  }, [data]);

  // Handle number input with proper formatting
  const handleNumberInput = (
    fieldName: keyof IFactoryExpenses,
    e: React.ChangeEvent<HTMLInputElement>,
    allowUndefined = false,
  ) => {
    const rawValue = e.target.value;
    const numericValue =
      rawValue.trim() === "" ? 0 : parseFloat(rawValue.replace(/,/g, ""));

    setValue(
      fieldName,
      allowUndefined && rawValue.trim() === "" ? undefined : numericValue,
      { shouldValidate: true },
    );
  };

  // Prepare expense data for API submission
  const prepareExpenseData = (formData: IFactoryExpenses) => {
    return {
      name: formData.name,
      type: formData.type ?? "General",
      appliesTo:
        formData.type === "General"
          ? "GENERAL"
          : ("SPECIFIC_PRODUCT" as "GENERAL" | "SPECIFIC_PRODUCT"),
      expenseType: formData.expenseType ?? "Fixed Amount",
      rateType: (() => {
        switch (formData.expenseType) {
          case "Fixed Amount":
            return "FIXED_AMOUNT" as const;
          case "Fixed/Ton":
            return "FIXED_PER_TON" as const;
          case "Percent/Ton":
            return "PERCENTAGE_PER_TON" as const;
          case "Range Ton From":
            return "RANGE" as const;
          default:
            return "FIXED_AMOUNT" as const;
        }
      })(),
      fixedPerTonRate:
        formData.expenseType === "Fixed/Ton"
          ? formData.fixedPerTonRate
          : undefined,
      fixedAmountRate:
        formData.expenseType === "Fixed Amount"
          ? formData.fixedAmountRate
          : undefined,
      percentagePerTonRate:
        formData.expenseType === "Percent/Ton"
          ? formData.percentagePerTonRate
          : undefined,
      tieredPrices:
        formData.expenseType === "Range Ton From" ? tieredPrices : [],
      extraCharge: formData.extraCharge,
    };
  };

  // Handle form submission for adding new expense
  const handleAddExpense: SubmitHandler<IFactoryExpenses> = async (
    formData,
  ) => {
    console.log("Form submission attempted", formData);
    console.log("Current tiered prices:", tieredPrices);
    setIsSubmitting(true);
    try {
      // Validate tiered prices for Range Ton From
      if (
        formData.expenseType === "Range Ton From" &&
        tieredPrices.length === 0
      ) {
        notify.error("Please add Tiered Prices");
        setIsSubmitting(false);
        return;
      }

      const preparedData = prepareExpenseData(formData);
      const newExpense = await createFactoryExpenses(preparedData);

      // Update local state with new expense
      setExpenses([...expenses, newExpense]);

      // Reset form and state
      reset({
        name: "",
        type: "General",
        expenseType: "Fixed Amount",
        extraCharge: 0,
        fixedAmountRate: 0,
        fixedPerTonRate: 0,
        percentagePerTonRate: 0,
      });
      setTieredPrices([]);
      setIsRangeTableOpen(false);

      // Refresh data from API
      // If refetch functionality is needed, consider implementing it in the service or manually re-triggering the hook.

      notify.success("Expense added successfully");
    } catch (fetchError: unknown) {
      logger.error(fetchError);
      if (fetchError instanceof ApiException && fetchError.statusCode === 409) {
        notify.error("Expense already exists");
      } else {
        notify.error("Failed to add expense");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update existing expense
  const onExpenseUpdate = async (expenseId: string) => {
    setIsSubmitting(true);
    try {
      const updatedData = getValues();

      // Validate tiered prices for Range Ton From
      if (
        updatedData.expenseType === "Range Ton From" &&
        tieredPrices.length === 0
      ) {
        notify.error("Please add Tiered Prices");
        setIsSubmitting(false);
        return;
      }

      const preparedData = prepareExpenseData(updatedData);
      const updatedExpense = await updateFactoryExpenses(
        expenseId,
        preparedData,
      );

      // Update local state
      setExpenses(
        expenses.map((expense) =>
          expense.id === expenseId ? updatedExpense : expense,
        ),
      );

      // Reset form and state
      setEditingId(null);
      reset({
        name: "",
        type: "General",
        expenseType: "Fixed Amount",
        extraCharge: 0,
        fixedAmountRate: 0,
        fixedPerTonRate: 0,
        percentagePerTonRate: 0,
      });
      setTieredPrices([]);
      setIsRangeTableOpen(false);

      notify.success("Expense updated successfully");
    } catch (error) {
      logger.error(error);
      notify.error("Failed to update expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit button click
  const handleEdit = (expenseId: string) => {
    const expense = expenses.find((exp) => exp.id === expenseId);
    if (!expense) return;

    // Set form values based on expense data
    setValue("name", expense.name);
    setValue(
      "type",
      expense.appliesTo === "GENERAL" ? "General" : "Specific Product",
    );
    setValue("extraCharge", expense.extraCharge ?? 0);

    // Map API rate type back to UI expense type
    let expenseType: IFactoryExpenses["expenseType"];
    switch (expense.rateType) {
      case "FIXED_AMOUNT":
        expenseType = "Fixed Amount";
        break;
      case "FIXED_PER_TON":
        expenseType = "Fixed/Ton";
        break;
      case "PERCENTAGE_PER_TON":
        expenseType = "Percent/Ton";
        break;
      case "RANGE":
        expenseType = "Range Ton From";
        break;
      default:
        expenseType = "Fixed Amount";
    }

    setValue("expenseType", expenseType);

    // Set specific rate based on type
    switch (expenseType) {
      case "Fixed Amount":
        setValue("fixedAmountRate", expense.fixedAmountRate ?? 0);
        break;
      case "Fixed/Ton":
        setValue("fixedPerTonRate", expense.fixedPerTonRate ?? 0);
        break;
      case "Percent/Ton":
        setValue("percentagePerTonRate", expense.percentagePerTonRate ?? 0);
        break;
      case "Range Ton From":
        setTieredPrices(expense.tieredPrices ?? []);
        setIsRangeTableOpen(true);
        break;
    }

    setEditingId(expenseId);
  };

  // Handle delete button click
  const handleDelete = (expenseId: string) => {
    notify.confirmDelete(async () => {
      try {
        await deleteFactoryExpenses(expenseId);

        // Update local state
        setExpenses(expenses.filter((exp) => exp.id !== expenseId));

        notify.success("Expense deleted successfully");
      } catch (error) {
        logger.error(error);
        notify.error("Failed to delete expense");
      }
    });
  };

  // Format tiered prices for display
  const getTieredPricesDisplay = (tieredPrices?: TieredPrice[]) => {
    if (!tieredPrices || tieredPrices.length === 0) return "N/A";

    return tieredPrices
      .map((tp) => {
        const range = rangeOptions.find((r) => r.id === tp.rangeId);
        return range
          ? `${range.rangeFrom}-${range.rangeTo}: ${tp.price.toFixed(2)}`
          : "";
      })
      .filter(Boolean)
      .join(", ");
  };

  // Handle tiered price input
  const handleTieredPriceInput = (rangeId: string, value: number) => {
    setTieredPrices((prev) => {
      const existingIndex = prev.findIndex((tp) => tp.rangeId === rangeId);

      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = { rangeId, price: value };
        return updated;
      }

      return [...prev, { rangeId, price: value }];
    });
  };

  // Show error modal if API fetch failed
  if (error) {
    return (
      <ErrorModal
        message={
          error instanceof Error
            ? error.message
            : "Failed to fetch factory expenses"
        }
      />
    );
  }

  return (
    <div className="p-4 md:p-6 bg-white">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Factory Expense Types
      </h2>

      <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-6">
        <form
          onSubmit={
            editingId
              ? handleSubmit(() => onExpenseUpdate(editingId))
              : handleSubmit(handleAddExpense)
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="w-full">
              <FormField
                type="text"
                name="name"
                label="Expense Name"
                placeholder="Expense Name"
                register={register}
                errorMessage={errors.name?.message}
              />
            </div>
            <div className="w-full">
              <label htmlFor="type" className="font-medium block text-gray-700">
                Expense On
              </label>
              <select
                id="type"
                {...register("type")}
                className="select select-bordered w-full bg-white text-gray-800"
              >
                {expenseCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.type.message}
                </p>
              )}
            </div>
            <div className="w-full">
              <FormField
                type="text"
                name="extraCharge"
                label="Extra Charge if Brand Changes"
                valueAsNumber
                placeholder="Extra Charge"
                register={register}
                onChange={(e) => {
                  handleNumberInput("extraCharge", e);
                }}
                value={getValues("extraCharge") ?? 0}
                errorMessage={errors.extraCharge?.message}
              />
            </div>

            <div className="col-span-1 md:col-span-2 flex flex-wrap gap-2 mb-4">
              {expenseTypes.map((type) => (
                <label key={type} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    {...register("expenseType")}
                    value={type}
                    checked={expenseType === type}
                    onChange={() => {
                      setValue("expenseType", type);
                      setIsRangeTableOpen(type === "Range Ton From");

                      // Reset numeric fields when changing expense type
                      setValue("fixedAmountRate", 0);
                      setValue("fixedPerTonRate", 0);
                      setValue("percentagePerTonRate", 0);
                    }}
                    className="radio"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>

            {expenseType === "Fixed Amount" && (
              <div className="w-full">
                <FormField
                  type="text"
                  name="fixedAmountRate"
                  label="Fixed Amount"
                  placeholder="Fixed Amount"
                  valueAsNumber
                  register={register}
                  onChange={(e) => {
                    handleNumberInput("fixedAmountRate", e);
                  }}
                  value={getValues("fixedAmountRate") ?? 0}
                  errorMessage={errors.fixedAmountRate?.message}
                />
              </div>
            )}

            {expenseType === "Fixed/Ton" && (
              <div className="w-full">
                <FormField
                  type="text"
                  name="fixedPerTonRate"
                  label="Fixed/Ton"
                  valueAsNumber
                  placeholder="Fixed/Ton"
                  register={register}
                  onChange={(e) => {
                    handleNumberInput("fixedPerTonRate", e);
                  }}
                  value={getValues("fixedPerTonRate") ?? 0}
                  errorMessage={errors.fixedPerTonRate?.message}
                />
              </div>
            )}

            {expenseType === "Percent/Ton" && (
              <div className="w-full">
                <FormField
                  type="text"
                  name="percentagePerTonRate"
                  label="Percent/Ton"
                  placeholder="Percent/Ton"
                  valueAsNumber
                  register={register}
                  onChange={(e) => {
                    handleNumberInput("percentagePerTonRate", e);
                  }}
                  value={getValues("percentagePerTonRate") ?? 0}
                  errorMessage={errors.percentagePerTonRate?.message}
                />
              </div>
            )}

            {expenseType === "Range Ton From" && isRangeTableOpen && (
              <div className="col-span-1 md:col-span-2 overflow-x-auto mb-4">
                <table className="table w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-gray-700">Range</th>
                      <th className="text-gray-700">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rangeOptions.map((range) => {
                      const rangeId = range.id;
                      const existingPrice =
                        tieredPrices.find((tp) => tp.rangeId === rangeId)
                          ?.price ?? 0;

                      return (
                        <tr key={rangeId} className="hover:bg-gray-50">
                          <td>{`${range.rangeFrom} - ${range.rangeTo}`}</td>
                          <td>
                            <input
                              type="text"
                              placeholder="Enter Price"
                              value={existingPrice}
                              onChange={(e) => {
                                const numValue =
                                  e.target.value.trim() === ""
                                    ? 0
                                    : parseFloat(
                                        e.target.value.replace(/,/g, ""),
                                      );
                                if (!isNaN(numValue)) {
                                  handleTieredPriceInput(rangeId, numValue);
                                }
                              }}
                              className="input input-bordered input-sm w-full bg-white text-gray-800"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <Button
            type="submit"
            shape="info"
            pending={isSubmitting}
            disabled={
              isSubmitting ||
              (expenseType === "Range Ton From" && tieredPrices.length === 0)
            }
            className="mt-4 w-full md:w-auto btn-info text-white"
          >
            {editingId ? "Update Expense" : "Save Expense"}
          </Button>
        </form>
      </div>

      {isLoading ? (
        <div className="skeleton h-28 w-full"></div>
      ) : expenses.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table w-full bg-white rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-100 text-center">
                <th className="text-gray-700">#</th>
                <th className="text-gray-700">Name</th>
                <th className="text-gray-700">Applies To</th>
                <th className="text-gray-700">Rate Type</th>
                <th className="text-gray-700">Fixed/Ton</th>
                <th className="text-gray-700">Fixed Amount</th>
                <th className="text-gray-700">Percent/Ton</th>
                <th className="text-gray-700">Tiered Prices</th>
                <th className="text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense, index) => (
                <tr key={expense.id} className="text-center hover:bg-gray-50">
                  <td>{index + 1}</td>
                  <td>{expense.name}</td>
                  <td>{expense.appliesTo}</td>
                  <td>{expense.rateType}</td>
                  <td>{expense.fixedPerTonRate ?? 0}</td>
                  <td>{expense.fixedAmountRate ?? 0}</td>
                  <td>{expense.percentagePerTonRate ?? 0}</td>
                  <td>{getTieredPricesDisplay(expense.tieredPrices)}</td>
                  <td className="flex justify-center gap-2">
                    <button
                      onClick={() => expense.id && handleEdit(expense.id)}
                      className="flex items-center justify-center hover:bg-gray-200 p-1 rounded"
                    >
                      <PencilSquareIcon className="w-5 h-5 text-info" />
                    </button>
                    <button
                      onClick={() => expense.id && handleDelete(expense.id)}
                      className="flex items-center justify-center hover:bg-red-100 p-1 rounded"
                    >
                      <TrashIcon className="w-5 h-5 text-red-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-100 p-6 rounded-lg shadow-md text-center">
          No expenses added yet.
        </div>
      )}
    </div>
  );
};
