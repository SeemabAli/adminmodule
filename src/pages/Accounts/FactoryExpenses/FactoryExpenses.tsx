/* eslint-disable @typescript-eslint/no-confusing-void-expression */
import React, { useEffect, useState } from "react";
import { notify } from "@/lib/notify";
import {
  convertNumberIntoLocalString,
  convertLocalStringIntoNumber,
} from "@/utils/CommaSeparator";
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

// Updated service imports to match API structure
import {
  createFactoryExpenses,
  fetchAllFactoryExpenses,
  updateFactoryExpenses,
  deleteFactoryExpenses,
  fetchAllRanges,
} from "./factoryExpenses.service";

type RangeOption = {
  id?: string;
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
  const { error, data, isLoading } = useService(fetchAllFactoryExpenses);
  const [expenses, setExpenses] = useState<IFactoryExpenses[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isRangeTableOpen, setIsRangeTableOpen] = useState(false);
  const [rangeOptions, setRangeOptions] = useState<RangeOption[]>([]);
  const [tieredPrices, setTieredPrices] = useState<TieredPrice[]>([]);

  const {
    register,
    formState: { errors, isSubmitting },
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
    },
  });

  const expenseType = watch("expenseType");

  // Load expenses and range options
  useEffect(() => {
    const fetchRangeOptions = async () => {
      try {
        const response = await fetchAllRanges();
        setRangeOptions(response);
      } catch (fetchError) {
        logger.error(fetchError);
        notify.error("Failed to fetch range options");
      }
    };

    void fetchRangeOptions();

    if (data) {
      setExpenses(data);
    }
  }, [data]);

  // Handle number input
  const handleNumberInput = (
    fieldName: keyof IFactoryExpenses,
    e: React.ChangeEvent<HTMLInputElement>,
    allowUndefined = false,
  ) => {
    const rawValue = e.target.value;
    const numericValue = convertLocalStringIntoNumber(rawValue);

    setValue(
      fieldName,
      allowUndefined && rawValue.trim() === "" ? undefined : numericValue,
      { shouldValidate: true },
    );
  };

  // Prepare data for API
  const prepareExpenseData = (data: IFactoryExpenses) => {
    const baseData = {
      name: data.name,
      appliesTo:
        data.type === "General"
          ? ("GENERAL" as const)
          : ("SPECIFIC_PRODUCT" as const),
      rateType: (() => {
        switch (data.expenseType) {
          case "Fixed Amount":
            return "FIXED_AMOUNT" as const;
          case "Fixed/Ton":
            return "FIXED_PER_TON" as const;
          case "Percent/Ton":
            return "PERCENTAGE_PER_TON" as const;
          case "Range Ton From":
            return "TIERED" as const;
          default:
            return "FIXED_AMOUNT" as const;
        }
      })(),
      fixedPerTonRate:
        data.expenseType === "Fixed/Ton" ? data.fixedPerTonRate : undefined,
      fixedAmountRate:
        data.expenseType === "Fixed Amount" ? data.fixedAmountRate : undefined,
      percentagePerTonRate:
        data.expenseType === "Percent/Ton"
          ? data.percentagePerTonRate
          : undefined,
      tieredPrices: data.expenseType === "Range Ton From" ? tieredPrices : [],
      extraCharge: data.extraCharge,
    };

    return baseData;
  };

  // Handle form submission
  const handleAddExpense: SubmitHandler<IFactoryExpenses> = async (data) => {
    try {
      // Validate and prepare tiered prices for Range Ton From
      if (data.expenseType === "Range Ton From") {
        if (tieredPrices.length === 0) {
          notify.error("Please add Tiered Prices");
          return;
        }
      }

      const preparedData = prepareExpenseData(data);
      const newExpense = await createFactoryExpenses(preparedData);

      setExpenses([...expenses, newExpense]);
      reset();
      setTieredPrices([]);
      setIsRangeTableOpen(false);
      notify.success("Expense added successfully");
    } catch (fetchError: unknown) {
      logger.error(fetchError);
      if (fetchError instanceof ApiException && fetchError.statusCode === 409) {
        notify.error("Expense already exists");
        return;
      }
      notify.error("Failed to add expense");
    }
  };

  // Update expense
  const onExpenseUpdate = async (expenseId: string) => {
    try {
      const updatedData = getValues();

      // Validate and prepare tiered prices for Range Ton From
      if (updatedData.expenseType === "Range Ton From") {
        if (tieredPrices.length === 0) {
          notify.error("Please add Tiered Prices");
          return;
        }
      }

      const preparedData = prepareExpenseData(updatedData);
      const updatedExpense = await updateFactoryExpenses(
        expenseId,
        preparedData,
      );

      setExpenses(
        expenses.map((expense) =>
          expense.id === expenseId ? updatedExpense : expense,
        ),
      );

      setEditingId(null);
      reset();
      setTieredPrices([]);
      setIsRangeTableOpen(false);
      notify.success("Expense updated successfully");
    } catch (error) {
      notify.error("Failed to update expense");
      logger.error(error);
    }
  };

  // Handle edit
  const handleEdit = (expenseId: string) => {
    const expense = expenses.find((exp) => exp.id === expenseId);
    if (!expense) return;

    setValue("name", expense.name);
    setValue(
      "type",
      expense.appliesTo === "GENERAL" ? "General" : "Specific Product",
    );
    setValue("extraCharge", expense.extraCharge ?? 0);

    // Map rate type back to expense type
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
      case "TIERED":
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

  // Handle delete
  const handleDelete = (expenseId: string) => {
    notify.confirmDelete(async () => {
      try {
        await deleteFactoryExpenses(expenseId);
        setExpenses(expenses.filter((exp) => exp.id !== expenseId));
        notify.success("Expense deleted successfully");
      } catch (error) {
        notify.error("Failed to delete expense");
        logger.error(error);
      }
    });
  };

  // Render tiered prices display
  const getTieredPricesDisplay = (tieredPrices?: TieredPrice[]) => {
    if (!tieredPrices || tieredPrices.length === 0) return "N/A";

    return tieredPrices
      .map((tp) => {
        const range = rangeOptions.find(
          (r) => `${r.rangeFrom}-${r.rangeTo}` === tp.rangeId,
        );
        return range
          ? `${range.rangeFrom} - ${range.rangeTo}: ${convertNumberIntoLocalString(tp.price)}`
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
                onChange={(e) => handleNumberInput("extraCharge", e)}
                value={convertNumberIntoLocalString(
                  getValues("extraCharge") ?? 0,
                )}
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
                  onChange={(e) => handleNumberInput("fixedAmountRate", e)}
                  value={convertNumberIntoLocalString(
                    getValues("fixedAmountRate") ?? 0,
                  )}
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
                  onChange={(e) => handleNumberInput("fixedPerTonRate", e)}
                  value={convertNumberIntoLocalString(
                    getValues("fixedPerTonRate") ?? 0,
                  )}
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
                  onChange={(e) => handleNumberInput("percentagePerTonRate", e)}
                  value={convertNumberIntoLocalString(
                    getValues("percentagePerTonRate") ?? 0,
                  )}
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
                      const rangeId = `${range.rangeFrom}-${range.rangeTo}`;
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
                              value={convertNumberIntoLocalString(
                                existingPrice,
                              )}
                              onChange={(e) => {
                                const numValue = convertLocalStringIntoNumber(
                                  e.target.value,
                                );
                                if (numValue !== undefined) {
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
              expenseType === "Range Ton From" && tieredPrices.length === 0
            }
            className="mt-4 w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white"
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
                  <td>
                    {convertNumberIntoLocalString(expense.fixedPerTonRate ?? 0)}
                  </td>
                  <td>
                    {convertNumberIntoLocalString(expense.fixedAmountRate ?? 0)}
                  </td>
                  <td>
                    {convertNumberIntoLocalString(
                      expense.percentagePerTonRate ?? 0,
                    )}
                  </td>
                  <td>{getTieredPricesDisplay(expense.tieredPrices)}</td>
                  <td className="flex justify-center gap-2">
                    <button
                      onClick={() => expense.id && handleEdit(expense.id)}
                      className="flex items-center justify-center hover:bg-gray-200 p-1 rounded"
                    >
                      <PencilSquareIcon className="w-5 h-5 text-blue-600" />
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
