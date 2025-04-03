/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useEffect, useState } from "react";
import { notify } from "@/lib/notify";
import { FormField } from "@/common/components/ui/form/FormField";
import { useForm } from "react-hook-form";
import { Button } from "@/common/components/ui/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  truckOtherExpensesSchema,
  type TruckOtherExpenses,
} from "./truckotherexpenses.schema";
import {
  createTruckOtherExpenses,
  fetchAllTruckOtherExpenses,
  updateTruckOtherExpenses,
  deleteTruckOtherExpenses,
} from "./truckotherexpenses.service";
import { logger } from "@/lib/logger";
import { useService } from "@/common/hooks/custom/useService";
import { ErrorModal } from "@/common/components/Error";
import { TrashIcon } from "@heroicons/react/24/solid";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { ApiException } from "@/utils/exceptions";
import { convertNumberIntoLocalString } from "@/utils/CommaSeparator";

const TruckOtherExpense = () => {
  const [expenses, setExpenses] = useState<TruckOtherExpenses[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { error, data, isLoading } = useService(fetchAllTruckOtherExpenses);

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    setValue,
    setFocus,
    reset,
  } = useForm({
    resolver: zodResolver(truckOtherExpensesSchema),
    defaultValues: {
      id: "",
      name: "",
      firstTrip: undefined,
      secondTrip: undefined,
      thirdTrip: undefined,
    },
  });

  const handleAddExpense = async (newExpenseData: TruckOtherExpenses) => {
    try {
      const newExpense = await createTruckOtherExpenses(newExpenseData);
      setExpenses([...expenses, newExpense]);
      reset();
      notify.success("Expense added successfully.");
    } catch (error: unknown) {
      logger.error(error);

      if (error instanceof ApiException) {
        if (error.statusCode == 409) {
          notify.error("Expense already exists.");
        }
        return;
      }
      notify.error("Failed to add expense.");
    }
  };

  const onExpenseUpdate = async (
    expenseId: string,
    data: TruckOtherExpenses,
  ) => {
    try {
      const updatedExpense = await updateTruckOtherExpenses(expenseId, data);

      const updatedExpenses = expenses.map((expense) => {
        if (expense.id === expenseId) {
          return updatedExpense;
        }
        return expense;
      });

      setExpenses(updatedExpenses);
      setEditingId(null);
      reset();
      notify.success("Expense updated successfully.");
    } catch (error: unknown) {
      notify.error("Failed to update expense.");
      logger.error(error);
    }
  };

  const handleEdit = (expenseId: string) => {
    const targetExpense = expenses.find((expense) => expense.id === expenseId);
    if (!targetExpense) return;

    setValue("id", targetExpense.id ?? "");
    setValue("name", targetExpense.name);
    setValue("firstTrip", targetExpense.firstTrip);
    setValue("secondTrip", targetExpense.secondTrip);
    setValue("thirdTrip", targetExpense.thirdTrip);
    setFocus("name");
    setEditingId(expenseId);
  };

  const handleDelete = (expenseId: string) => {
    notify.confirmDelete(async () => {
      try {
        await deleteTruckOtherExpenses(expenseId);
        setExpenses(expenses.filter((expense) => expense.id !== expenseId));
        notify.success("Expense deleted successfully.");
      } catch (error: unknown) {
        notify.error("Failed to delete expense.");
        logger.error(error);
      }
    });
  };

  useEffect(() => {
    if (data) {
      setExpenses(data);
    }
  }, [data]);

  if (error) {
    return (
      <ErrorModal
        message={
          error instanceof Error
            ? error.message
            : "Failed to fetch expenses data"
        }
      />
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Truck Other Expenses</h2>
      <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            placeholder="Expense Name"
            name={"name"}
            label={"Expense Name"}
            register={register}
            errorMessage={errors.name?.message}
          />
          <FormField
            type="number"
            placeholder="1st Trip Amount"
            name={"firstTrip"}
            label={"First Trip Amount"}
            valueAsNumber
            register={register}
            errorMessage={errors.firstTrip?.message}
          />
          <FormField
            type="number"
            placeholder="2nd Trip Amount"
            name={"secondTrip"}
            label={"Second Trip Amount"}
            valueAsNumber
            register={register}
            errorMessage={errors.secondTrip?.message}
          />
          <FormField
            type="number"
            placeholder="3rd Trip Amount"
            name={"thirdTrip"}
            label={"Third Trip Amount"}
            valueAsNumber
            register={register}
            errorMessage={errors.thirdTrip?.message}
          />
        </div>
        <Button
          onClick={
            editingId !== null
              ? handleSubmit((updatedExpenseData) => {
                  void onExpenseUpdate(editingId, updatedExpenseData);
                })
              : handleSubmit(handleAddExpense)
          }
          shape="info"
          pending={isSubmitting}
          className="mt-4"
        >
          {editingId !== null ? "Update Expense" : "Add Expense"}
        </Button>
      </div>
      {isLoading && <div className="skeleton h-28 w-full"></div>}
      {expenses.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table w-full bg-base-200 rounded-lg shadow-md">
            <thead>
              <tr className="bg-base-300 text-base-content text-center">
                <th className="p-3">#</th>
                <th className="p-3">Expense Name</th>
                <th className="p-3">1st Trip Amount</th>
                <th className="p-3">2nd Trip Amount</th>
                <th className="p-3">3rd Trip Amount</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense, index) => (
                <tr
                  key={expense.id}
                  className="border-b border-base-300 text-center"
                >
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{expense.name}</td>
                  <td className="p-3">
                    {expense.firstTrip != null
                      ? convertNumberIntoLocalString(expense.firstTrip)
                      : "-"}
                  </td>
                  <td className="p-3">
                    {expense.secondTrip != null
                      ? convertNumberIntoLocalString(expense.secondTrip)
                      : "-"}
                  </td>
                  <td className="p-3">
                    {expense.thirdTrip != null
                      ? convertNumberIntoLocalString(expense.thirdTrip)
                      : "-"}
                  </td>
                  <td className="p-3 flex gap-1 justify-center">
                    <button
                      onClick={() => {
                        expense.id && handleEdit(expense.id);
                      }}
                      className="flex items-center justify-center"
                    >
                      <PencilSquareIcon className="w-4 h-4 text-info" />
                    </button>

                    <button
                      onClick={() => {
                        handleDelete(expense.id ?? "");
                      }}
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
        <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6 text-center text-gray-500">
          No expenses added yet.
        </div>
      )}
    </div>
  );
};

export default TruckOtherExpense;
