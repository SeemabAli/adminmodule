import { notify } from "@/lib/notify";
import { formatNumberWithCommas } from "@/utils/CommaSeparator";
import { useState } from "react";

const FactoryExpenseTypes = () => {
  const [expenses, setExpenses] = useState<
    {
      name: string;
      date: string;
      type: string;
      fixedAmount?: number;
      fixedPerTon?: number;
      percentPerTon?: number;
      rangeTonFrom?: string;
      rangeTonValue?: number;
      extraCharge: number;
    }[]
  >([]);

  const today = new Date().toISOString().split("T")[0] ?? "";
  const [expenseName, setExpenseName] = useState("");
  const [expenseDate, setExpenseDate] = useState(today);
  const [expenseCategory, setExpenseCategory] = useState("General");
  const [expenseType, setExpenseType] = useState("Fixed Amount");
  const [fixedAmount, setFixedAmount] = useState<number | "">("");
  const [fixedPerTon, setFixedPerTon] = useState<number | "">("");
  const [percentPerTon, setPercentPerTon] = useState<number | "">("");
  const [rangeTonFrom, setRangeTonFrom] = useState("0-50 Tons");
  const [rangeTonValue, setRangeTonValue] = useState<number | "">("");
  const [extraCharge, setExtraCharge] = useState<number | "">("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rangeOptions = ["0-50 Tons", "51-100 Tons", "101+ Tons"];
  const expenseCategories = [
    "General",
    "Operational",
    "Maintenance",
    "Miscellaneous",
  ];

  const handleSaveExpense = () => {
    if (expenseName.trim() === "") {
      setError("Expense name is required.");
      return;
    }
    if (expenseDate === "") {
      setError("Expense date is required.");
      return;
    }

    const newExpense = {
      name: expenseName,
      date: expenseDate,
      type: expenseCategory,
      fixedAmount: fixedAmount as number,
      fixedPerTon: fixedPerTon as number,
      percentPerTon: percentPerTon as number,
      rangeTonFrom: expenseType === "Range Ton From" ? rangeTonFrom : undefined,
      rangeTonValue:
        expenseType === "Range Ton From"
          ? (rangeTonValue as number)
          : undefined,
      extraCharge: extraCharge as number,
    };

    if (editingIndex !== null) {
      const updatedExpenses = [...expenses];
      updatedExpenses[editingIndex] = newExpense;
      setExpenses(updatedExpenses);
      setEditingIndex(null);
    } else {
      setExpenses([...expenses, newExpense]);
    }

    resetForm();
  };

  const handleEdit = (index: number) => {
    const expense = expenses.find((_, i) => i === index);
    if (!expense) return;
    setExpenseName(expense.name);
    setExpenseDate(expense.date);
    setExpenseCategory(expense.type);
    setExpenseType(
      expense.rangeTonFrom
        ? "Range Ton From"
        : expense.fixedAmount
          ? "Fixed Amount"
          : expense.fixedPerTon
            ? "Fixed/Ton"
            : "Percent/Ton",
    );
    setFixedAmount(expense.fixedAmount ?? "");
    setFixedPerTon(expense.fixedPerTon ?? "");
    setPercentPerTon(expense.percentPerTon ?? "");
    setRangeTonFrom(expense.rangeTonFrom ?? "0-50 Tons");
    setRangeTonValue(expense.rangeTonValue ?? "");
    setExtraCharge(expense.extraCharge);
    setEditingIndex(index);
  };

  const handleDelete = (index: number) => {
    notify.confirmDelete(() => {
      setExpenses((prev) => prev.filter((_, i) => i !== index));
      notify.success("Expense deleted successfully!");
    });
  };

  const resetForm = () => {
    setExpenseName("");
    setExpenseDate("");
    setExpenseCategory("General");
    setExpenseType("Fixed Amount");
    setFixedAmount("");
    setFixedPerTon("");
    setPercentPerTon("");
    setRangeTonFrom("0-50 Tons");
    setRangeTonValue("");
    setExtraCharge("");
    setError(null);
  };

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-2xl font-bold mb-4">Factory Expense Types</h2>

      {error && <div className="text-red-500 mb-4 text-center">{error}</div>}

      <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            Expense Name
            <input
              type="text"
              placeholder="Expense Name"
              value={expenseName}
              onChange={(e) => {
                setExpenseName(e.target.value);
              }}
              className="input input-bordered w-full"
            />
          </label>
          <label className="block">
            Date
            <input
              type="date"
              value={expenseDate}
              onChange={(e) => {
                setExpenseDate(e.target.value);
              }}
              className="input input-bordered w-full"
            />
          </label>
          <label className="block">
            Category
            <select
              value={expenseCategory}
              onChange={(e) => {
                setExpenseCategory(e.target.value);
              }}
              className="select select-bordered w-full"
            >
              {expenseCategories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <div className="col-span-2 flex gap-2 flex-wrap">
            {["Fixed Amount", "Fixed/Ton", "Percent/Ton", "Range Ton From"].map(
              (type) => (
                <label key={type} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="expenseType"
                    value={type}
                    checked={expenseType === type}
                    onChange={() => {
                      setExpenseType(type);
                    }}
                    className="radio"
                  />
                  <span>{type}</span>
                </label>
              ),
            )}
          </div>
          {expenseType === "Fixed Amount" && (
            <input
              type="text"
              placeholder="Fixed Amount"
              value={
                fixedAmount === "" ? "" : formatNumberWithCommas(fixedAmount)
              }
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, ""); // Remove commas for parsing
                setFixedAmount(value === "" ? "" : parseFloat(value));
              }}
              className="input input-bordered w-full"
            />
          )}

          {expenseType === "Fixed/Ton" && (
            <input
              type="text"
              placeholder="Fixed/Ton"
              value={
                fixedPerTon === "" ? "" : formatNumberWithCommas(fixedPerTon)
              }
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, "");
                setFixedPerTon(value === "" ? "" : parseFloat(value));
              }}
              className="input input-bordered w-full"
            />
          )}

          {expenseType === "Percent/Ton" && (
            <input
              type="text"
              placeholder="Percent/Ton"
              value={
                percentPerTon === ""
                  ? ""
                  : formatNumberWithCommas(percentPerTon)
              }
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, "");
                setPercentPerTon(value === "" ? "" : parseFloat(value));
              }}
              className="input input-bordered w-full"
            />
          )}

          {expenseType === "Range Ton From" && (
            <>
              <select
                value={rangeTonFrom}
                onChange={(e) => {
                  setRangeTonFrom(e.target.value);
                }}
                className="select select-bordered w-full"
              >
                {rangeOptions.map((range, index) => (
                  <option key={index} value={range}>
                    {range}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Enter Value"
                value={
                  rangeTonValue === ""
                    ? ""
                    : formatNumberWithCommas(rangeTonValue)
                }
                onChange={(e) => {
                  const value = e.target.value.replace(/,/g, "");
                  setRangeTonValue(value === "" ? "" : parseFloat(value));
                }}
                className="input input-bordered w-full"
              />
            </>
          )}
          <input
            type="text"
            placeholder="Extra Charge"
            value={
              extraCharge === "" ? "" : formatNumberWithCommas(extraCharge)
            }
            onChange={(e) => {
              const value = e.target.value.replace(/,/g, "");
              setExtraCharge(value === "" ? "" : parseFloat(value));
            }}
            className="input input-bordered w-full"
          />
        </div>
        <button onClick={handleSaveExpense} className="btn btn-info mt-4">
          {editingIndex !== null ? "Update Expense" : "Save Expense"}
        </button>
      </div>

      {expenses.length > 0 && (
        <div className="overflow-x-auto">
          <table className="table w-full bg-base-200 rounded-lg shadow-md">
            <thead>
              <tr className="bg-base-300 text-center">
                <th>#</th>
                <th>Name</th>
                <th>Date</th>
                <th>Type</th>
                <th>Fixed Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense, index) => (
                <tr key={index} className="text-center">
                  <td>{index + 1}</td>
                  <td>{expense.name}</td>
                  <td>{expense.date}</td>
                  <td>{expense.type}</td>
                  <td>{expense.fixedAmount ?? "N/A"}</td>
                  <td className="flex justify-center">
                    <button
                      onClick={() => {
                        handleEdit(index);
                      }}
                      className="btn btn-sm btn-secondary mx-1"
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
      )}
    </div>
  );
};

export default FactoryExpenseTypes;
