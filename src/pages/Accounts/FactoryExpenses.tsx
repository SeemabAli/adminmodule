import { useState } from "react";

const FactoryExpenseTypes = () => {
    const [expenses, setExpenses] = useState<{
        name: string;
        date: string;
        type: string;
        amount: number;
        expenseType: string;
        range?: string;
        extraCharge: number;
    }[]>([]);

    const [expenseName, setExpenseName] = useState("");
    const [expenseDate, setExpenseDate] = useState("");
    const [expenseType, setExpenseType] = useState("Fixed Amount");
    const [expenseCategory, setExpenseCategory] = useState("General");
    const [amount, setAmount] = useState<number>(0);
    const [rangeTon, setRangeTon] = useState("0-50 Tons");
    const [extraCharge, setExtraCharge] = useState<number>(0);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const rangeOptions = ["0-50 Tons", "51-100 Tons", "101+ Tons"]; // Dummy ranges
    const expenseCategories = ["General", "Operational", "Maintenance", "Miscellaneous"]; // Dummy types

    // Save or Update Expense Type
    const handleSaveExpense = () => {
        if (expenseName.trim() === "" || expenseDate === "" || amount <= 0) return;

        const newExpense = {
            name: expenseName,
            date: expenseDate,
            type: expenseCategory,
            amount,
            expenseType,
            range: expenseType === "Range Ton From" ? rangeTon : undefined,
            extraCharge
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
        setExpenseDate("");
        setExpenseType("Fixed Amount");
        setExpenseCategory("General");
        setAmount(0);
        setRangeTon("0-50 Tons");
        setExtraCharge(0);
    };

    // Edit Expense
    const handleEditExpense = (index: number) => {
        const expense = expenses[index];
        setExpenseName(expense.name);
        setExpenseDate(expense.date);
        setExpenseType(expense.expenseType);
        setExpenseCategory(expense.type);
        setAmount(expense.amount);
        setRangeTon(expense.range || "0-50 Tons");
        setExtraCharge(expense.extraCharge);
        setEditingIndex(index);
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Factory Expense Types</h2>

            {/* Form */}
            <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Expense Name */}
                    <input
                        type="text"
                        placeholder="Expense Name"
                        value={expenseName}
                        onChange={(e) => setExpenseName(e.target.value)}
                        className="input input-bordered w-full"
                    />

                    {/* Expense Date */}
                    <input
                        type="date"
                        value={expenseDate}
                        onChange={(e) => setExpenseDate(e.target.value)}
                        className="input input-bordered w-full"
                    />

                    {/* Expense Category Dropdown */}
                    <select
                        value={expenseCategory}
                        onChange={(e) => setExpenseCategory(e.target.value)}
                        className="select select-bordered w-full"
                    >
                        {expenseCategories.map((category, index) => (
                            <option key={index} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>

                    {/* Expense Amount */}
                    <input
                        type="number"
                        placeholder="Amount"
                        value={amount}
                        onChange={(e) => setAmount(parseFloat(e.target.value))}
                        className="input input-bordered w-full"
                    />

                    {/* Expense Type Radio Buttons */}
                    <div className="col-span-2">
                        <div className="flex gap-4 flex-wrap">
                            {["Fixed Amount", "Fixed/Ton", "Percent/Ton", "Range Ton From"].map((type) => (
                                <label key={type} className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="expenseType"
                                        value={type}
                                        checked={expenseType === type}
                                        onChange={() => setExpenseType(type)}
                                        className="radio"
                                    />
                                    <span>{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Range Ton Dropdown (Visible Only If "Range Ton From" is Selected) */}
                    {expenseType === "Range Ton From" && (
                        <select
                            value={rangeTon}
                            onChange={(e) => setRangeTon(e.target.value)}
                            className="select select-bordered w-full"
                        >
                            {rangeOptions.map((range, index) => (
                                <option key={index} value={range}>
                                    {range}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Extra Charges If Brand Change */}
                    <input
                        type="number"
                        placeholder="Extra Charges If Brand Change"
                        value={extraCharge}
                        onChange={(e) => setExtraCharge(parseFloat(e.target.value))}
                        className="input input-bordered w-full"
                    />
                </div>

                <button onClick={handleSaveExpense} className="btn btn-primary mt-4">
                    {editingIndex !== null ? "Update Expense" : "Save Expense"}
                </button>
            </div>

            {/* Expense Types Table */}
            {expenses.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="table w-full bg-base-200 rounded-lg shadow-md">
                        <thead>
                            <tr className="bg-base-300 text-base-content text-center">
                                <th className="p-3">#</th>
                                <th className="p-3">Expense Name</th>
                                <th className="p-3">Date</th>
                                <th className="p-3">Type</th>
                                <th className="p-3">Amount</th>
                                <th className="p-3">Expense Type</th>
                                <th className="p-3">Range</th>
                                <th className="p-3">Extra Charges</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map((expense, index) => (
                                <tr key={index} className="border-b border-base-300 text-center">
                                    <td className="p-3">{index + 1}</td>
                                    <td className="p-3">{expense.name}</td>
                                    <td className="p-3">{expense.date}</td>
                                    <td className="p-3">{expense.type}</td>
                                    <td className="p-3">{expense.amount}</td>
                                    <td className="p-3">{expense.expenseType}</td>
                                    <td className="p-3">{expense.range || "N/A"}</td>
                                    <td className="p-3">{expense.extraCharge}</td>
                                    <td className="p-3">
                                        <button
                                            onClick={() => handleEditExpense(index)}
                                            className="btn btn-sm btn-warning"
                                        >
                                            Edit
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

export default FactoryExpenseTypes;
