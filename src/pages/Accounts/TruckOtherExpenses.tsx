import { formatNumberWithCommas } from "@/utils/CommaSeparator";
import { notify } from "@/lib/notify";
import { useState } from "react";

type Expense = {
  name: string;
  firstTrip: number | null;
  secondTrip: number | null;
  thirdTrip: number | null;
  date: string;
};
const TruckOtherExpense = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const today = new Date().toISOString().split("T")[0] ?? "";
  const [expenseName, setExpenseName] = useState("");
  const [firstTrip, setFirstTrip] = useState<number | null>(null);
  const [secondTrip, setSecondTrip] = useState<number | null>(null);
  const [thirdTrip, setThirdTrip] = useState<number | null>(null);
  const [expenseDate, setExpenseDate] = useState(today);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Save or Update Expense
  const handleSaveExpense = () => {
    if (expenseName.trim() === "" || expenseDate === "") return;

    const newExpense: Expense = {
      name: expenseName,
      firstTrip: firstTrip ?? 0,
      secondTrip: secondTrip ?? 0,
      thirdTrip: thirdTrip ?? 0,
      date: expenseDate,
    };

    if (editingIndex !== null) {
      const updatedExpenses = [...expenses];
      updatedExpenses[editingIndex] = newExpense;
      setExpenses(updatedExpenses);
      setEditingIndex(null);
    } else {
      setExpenses([...expenses, newExpense]);
    }

    // Reset Fields
    setExpenseName("");
    setFirstTrip(null);
    setSecondTrip(null);
    setThirdTrip(null);
    setExpenseDate("");
  };

  // Edit Expense
  const handleEditExpense = (index: number) => {
    const expense = expenses.find((_, i) => i === index);
    if (!expense) return;
    setExpenseName(expense.name);
    setFirstTrip(expense.firstTrip);
    setSecondTrip(expense.secondTrip);
    setThirdTrip(expense.thirdTrip);
    setExpenseDate(expense.date);
    setEditingIndex(index);
  };

  const handleDeleteExpense = (index: number) => {
    notify.confirmDelete(() => {
      setExpenses((prev) => prev.filter((_, i) => i !== index));
      notify.success("Expense deleted successfully!");
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Truck Other Expenses</h2>

      {/* Form */}
      <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Expense Name */}
          <label className="block mb-1 font-medium">
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
          {/* Expense Date */}
          <label className="block mb-1 font-medium">
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

          {/* Trip Amounts */}
          <label className="block mb-1 font-medium">
            1st Trip
            <input
              type="text"
              placeholder="1st Trip Amount"
              value={
                firstTrip === null ? "" : formatNumberWithCommas(firstTrip)
              }
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, "");
                setFirstTrip(value === "" ? null : parseFloat(value));
              }}
              className="input input-bordered w-full"
            />
          </label>
          <label className="block mb-1 font-medium">
            2nd Trip
            <input
              type="text"
              placeholder="2nd Trip Amount"
              value={
                secondTrip === null ? "" : formatNumberWithCommas(secondTrip)
              }
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, "");
                setSecondTrip(value === "" ? null : parseFloat(value));
              }}
              className="input input-bordered w-full"
            />
          </label>
          <label className="block mb-1 font-medium">
            3rd Trip
            <input
              type="text"
              placeholder="3rd Trip Amount"
              value={
                thirdTrip === null ? "" : formatNumberWithCommas(thirdTrip)
              }
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, "");
                setThirdTrip(value === "" ? null : parseFloat(value));
              }}
              className="input input-bordered w-full"
            />
          </label>
        </div>

        <button onClick={handleSaveExpense} className="btn btn-info mt-4">
          {editingIndex !== null ? "Update Expense" : "Save Expense"}
        </button>
      </div>

      {/* Expenses Table */}
      {expenses.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table w-full bg-base-200 rounded-lg shadow-md">
            <thead>
              <tr className="bg-base-300 text-base-content text-center">
                <th className="p-3">#</th>
                <th className="p-3">Expense Name</th>
                <th className="p-3">Date</th>
                <th className="p-3">1st Trip Amount</th>
                <th className="p-3">2nd Trip Amount</th>
                <th className="p-3">3rd Trip Amount</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense, index) => (
                <tr
                  key={index}
                  className="border-b border-base-300 text-center"
                >
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{expense.name}</td>
                  <td className="p-3">{expense.date}</td>
                  <td className="p-3">{expense.firstTrip}</td>
                  <td className="p-3">{expense.secondTrip}</td>
                  <td className="p-3">{expense.thirdTrip}</td>
                  <td className="p-3">
                    <button
                      onClick={() => {
                        handleEditExpense(index);
                      }}
                      className="btn btn-sm btn-secondary"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteExpense(index);
                      }}
                      className="btn btn-sm btn-error ml-2"
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
        <p className="text-gray-500 text-center">No expenses added yet.</p>
      )}
    </div>
  );
};

export default TruckOtherExpense;
