/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-confusing-void-expression */
import { useEffect, useState } from "react";
import { notify } from "@/lib/notify";
import { convertNumberIntoLocalString } from "@/utils/CommaSeparator";
import { useForm } from "react-hook-form";
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
  type ExpenseType,
  type ExpenseCategory,
} from "./factoryExpenses.schema";
import {
  createFactoryExpenses,
  fetchAllFactoryExpenses,
  updateFactoryExpenses,
  deleteFactoryExpenses,
} from "./factoryExpenses.service";

const expenseTypes: ExpenseType[] = [
  "Fixed Amount",
  "Fixed/Ton",
  "Percent/Ton",
  "Range Ton From",
];
const expenseCategories: ExpenseCategory[] = ["General", "Specific Product"];
const rangeOptions = ["0-50 Tons", "51-100 Tons", "101+ Tons"];

export const FactoryExpenses = () => {
  const { error, data, isLoading } = useService(fetchAllFactoryExpenses);
  const [expenses, setExpenses] = useState<IFactoryExpenses[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isRangeTableOpen, setIsRangeTableOpen] = useState(false);

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
      date: new Date().toISOString().split("T")[0] ?? "",
      type: "General",
      expenseType: "Fixed Amount",
      extraCharge: 0,
    },
  });

  const expenseType = watch("expenseType");

  // Load expenses
  useEffect(() => {
    if (data) {
      setExpenses(data);
    }
  }, [data]);

  // Handle form submission
  const handleAddExpense = async (data: IFactoryExpenses) => {
    try {
      const newExpense = await createFactoryExpenses(data);
      setExpenses([...expenses, newExpense]);
      reset();
      notify.success("Expense added successfully");
    } catch (error: unknown) {
      logger.error(error);
      if (error instanceof ApiException && error.statusCode === 409) {
        notify.error("Expense already exists");
        return;
      }
      notify.error("Failed to add expense");
    }
  };

  const onExpenseUpdate = async (expenseId: string) => {
    try {
      const updatedData = getValues();
      const updatedExpense = await updateFactoryExpenses(
        expenseId,
        updatedData,
      );
      setExpenses(
        expenses.map((expense) =>
          expense.id === expenseId ? updatedExpense : expense,
        ),
      );
      setEditingId(null);
      reset();
      notify.success("Expense updated successfully");
    } catch (error) {
      notify.error("Failed to update expense");
      logger.error(error);
    }
  };

  const handleEdit = (expenseId: string) => {
    const expense = expenses.find((exp) => exp.id === expenseId);
    if (!expense) return;

    setValue("name", expense.name);
    setValue("date", expense.date);
    setValue("type", expense.type);
    setValue("expenseType", expense.expenseType);
    setValue("fixedAmount", expense.fixedAmount);
    setValue("fixedPerTon", expense.fixedPerTon);
    setValue("percentPerTon", expense.percentPerTon);
    setValue("rangeTonFrom", expense.rangeTonFrom);
    setValue("rangeTonValues", expense.rangeTonValues);
    setValue("extraCharge", expense.extraCharge);
    setEditingId(expenseId);

    if (expense.expenseType === "Range Ton From") {
      setIsRangeTableOpen(true);
    }
  };

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

  const getRangeValuesDisplay = (rangeTonValues?: Record<string, number>) => {
    if (!rangeTonValues || Object.keys(rangeTonValues).length === 0)
      return "N/A";

    return Object.entries(rangeTonValues)
      .map(
        ([range, value]) => `${range}: ${convertNumberIntoLocalString(value)}`,
      )
      .join(", ");
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
    <div className="p-4 md:p-6">
      <h2 className="text-2xl font-bold mb-4">Factory Expense Types</h2>

      <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            type="text"
            name="name"
            label="Expense Name"
            placeholder="Expense Name"
            register={register}
            errorMessage={errors.name?.message}
          />
          <FormField
            type="date"
            name="date"
            label="Date"
            register={register}
            errorMessage={errors.date?.message}
          />
          <FormField
            name="type"
            label="Expense On"
            register={register}
            errorMessage={errors.type?.message}
          >
            {expenseCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </FormField>
          <FormField
            type="text"
            name="extraCharge"
            label="Extra Charge if Brand Changes"
            placeholder="Extra Charge"
            register={register}
            onChange={(e) => {
              const value = e.target.value.replace(/,/g, "");
              setValue("extraCharge", value === "" ? 0 : parseFloat(value));
            }}
            value={convertNumberIntoLocalString(getValues("extraCharge"))}
            errorMessage={errors.extraCharge?.message}
          />

          <div className="col-span-2 flex gap-2 flex-wrap">
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
                  }}
                  className="radio"
                />
                <span>{type}</span>
              </label>
            ))}
          </div>

          {expenseType === "Fixed Amount" && (
            <FormField
              type="text"
              name="fixedAmount"
              label="Fixed Amount"
              placeholder="Fixed Amount"
              register={register}
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, "");
                setValue(
                  "fixedAmount",
                  value === "" ? undefined : parseFloat(value),
                );
              }}
              value={
                getValues("fixedAmount") === undefined
                  ? ""
                  : convertNumberIntoLocalString(getValues("fixedAmount") ?? 0)
              }
              errorMessage={errors.fixedAmount?.message}
            />
          )}

          {expenseType === "Fixed/Ton" && (
            <FormField
              type="text"
              name="fixedPerTon"
              label="Fixed/Ton"
              placeholder="Fixed/Ton"
              register={register}
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, "");
                setValue(
                  "fixedPerTon",
                  value === "" ? undefined : parseFloat(value),
                );
              }}
              value={
                getValues("fixedPerTon") === undefined
                  ? ""
                  : convertNumberIntoLocalString(getValues("fixedPerTon") ?? 0)
              }
              errorMessage={errors.fixedPerTon?.message}
            />
          )}

          {expenseType === "Percent/Ton" && (
            <FormField
              type="text"
              name="percentPerTon"
              label="Percent/Ton"
              placeholder="Percent/Ton"
              register={register}
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, "");
                setValue(
                  "percentPerTon",
                  value === "" ? undefined : parseFloat(value),
                );
              }}
              value={
                getValues("percentPerTon") === undefined
                  ? ""
                  : convertNumberIntoLocalString(
                      getValues("percentPerTon") ?? 0,
                    )
              }
              errorMessage={errors.percentPerTon?.message}
            />
          )}

          {expenseType === "Range Ton From" && isRangeTableOpen && (
            <div className="col-span-2 overflow-x-auto mb-4">
              <table className="table w-full bg-base-300">
                <thead>
                  <tr className="bg-base-300">
                    <th>Range</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {rangeOptions.map((range) => (
                    <tr key={range}>
                      <td>{range}</td>
                      <td>
                        <input
                          type="text"
                          placeholder="Enter Value"
                          value={
                            getValues("rangeTonValues")?.[range] === undefined
                              ? ""
                              : convertNumberIntoLocalString(
                                  getValues("rangeTonValues")?.[range] ?? 0,
                                )
                          }
                          onChange={(e) => {
                            const value = e.target.value.replace(/,/g, "");
                            const currentValues =
                              getValues("rangeTonValues") ?? {};

                            const updatedValues = Object.fromEntries(
                              Object.entries({
                                ...currentValues,
                                [range]:
                                  value === "" ? undefined : parseFloat(value),
                              }).filter(([_, v]) => v !== undefined), // Filter out undefined values
                            ) as Record<string, number>; // Type assertion to satisfy TypeScript

                            setValue("rangeTonValues", updatedValues);
                          }}
                          className="input input-bordered input-sm w-full"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <Button
          onClick={
            editingId
              ? handleSubmit(() => onExpenseUpdate(editingId))
              : handleSubmit(handleAddExpense)
          }
          shape="info"
          pending={isSubmitting}
          className="mt-4"
        >
          {editingId ? "Update Expense" : "Save Expense"}
        </Button>
      </div>

      {isLoading ? (
        <div className="skeleton h-28 w-full"></div>
      ) : expenses.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table w-full bg-base-200 rounded-lg shadow-md">
            <thead>
              <tr className="bg-base-300 text-center">
                <th>#</th>
                <th>Name</th>
                <th>Date</th>
                <th>Type</th>
                <th>Fixed Amount</th>
                <th>Fixed/Ton</th>
                <th>Percent/Ton</th>
                <th>Range Values</th>
                <th>Extra Charge</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense, index) => (
                <tr key={expense.id} className="text-center">
                  <td>{index + 1}</td>
                  <td>{expense.name}</td>
                  <td>{expense.date}</td>
                  <td>{expense.type}</td>
                  <td>
                    {expense.fixedAmount !== undefined
                      ? convertNumberIntoLocalString(expense.fixedAmount)
                      : "N/A"}
                  </td>
                  <td>
                    {expense.fixedPerTon !== undefined
                      ? convertNumberIntoLocalString(expense.fixedPerTon)
                      : "N/A"}
                  </td>
                  <td>
                    {expense.percentPerTon !== undefined
                      ? convertNumberIntoLocalString(expense.percentPerTon)
                      : "N/A"}
                  </td>
                  <td>{getRangeValuesDisplay(expense.rangeTonValues)}</td>
                  <td>{convertNumberIntoLocalString(expense.extraCharge)}</td>
                  <td className="flex justify-center gap-2">
                    <button
                      onClick={() => expense.id && handleEdit(expense.id)}
                      className="flex items-center justify-center"
                    >
                      <PencilSquareIcon className="w-4 h-4 text-info" />
                    </button>
                    <button
                      onClick={() => expense.id && handleDelete(expense.id)}
                      className="flex items-center justify-center"
                    >
                      <TrashIcon className="w-4 h-4 text-red-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-base-200 p-6 rounded-lg shadow-md text-center">
          No expenses added yet.
        </div>
      )}
    </div>
  );
};
