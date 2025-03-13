import { useState } from "react";

const FactoryExpenseTypes = () => {
    const [expenses, setExpenses] = useState<{
        name: string;
        date: string;
        type: string;
        fixedAmount?: number;
        fixedPerTon?: number;
        percentPerTon?: number;
        rangeTonFrom?: string;
        rangeTonValue?: number;
        extraCharge: number;
    }[]>([]);

    const [expenseName, setExpenseName] = useState("");
    const [expenseDate, setExpenseDate] = useState("");
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
    const expenseCategories = ["General", "Operational", "Maintenance", "Miscellaneous"];

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
            rangeTonValue: expenseType === "Range Ton From" ? rangeTonValue as number : undefined,
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
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Factory Expense Types</h2>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block mb-1 font-medium">
                        Expense Name
                        <input type="text" placeholder="Expense Name" value={expenseName} onChange={(e) => setExpenseName(e.target.value)} className="input input-bordered w-full" />
                    </label>
                    <label className="block mb-1 font-medium">
                        Date
                        <input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} className="input input-bordered w-full" />
                    </label>
                    <label className="block mb-1 font-medium">
                        Category
                        <select value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)} className="select select-bordered w-full">
                            {expenseCategories.map((category, index) => (
                                <option key={index} value={category}>{category}</option>
                            ))}
                        </select>
                    </label>
                    <div className="col-span-2 flex gap-4 flex-wrap">
                        {["Fixed Amount", "Fixed/Ton", "Percent/Ton", "Range Ton From"].map((type) => (
                            <label key={type} className="flex items-center space-x-2">
                                <input type="radio" name="expenseType" value={type} checked={expenseType === type} onChange={() => setExpenseType(type)} className="radio" />
                                <span>{type}</span>
                            </label>
                        ))}
                    </div>
                    {expenseType === "Fixed Amount" && (
                        <input type="number" placeholder="Fixed Amount" value={fixedAmount} onChange={(e) => setFixedAmount(e.target.value === "" ? "" : parseFloat(e.target.value))} className="input input-bordered w-full" />
                    )}
                    {expenseType === "Fixed/Ton" && (
                        <input type="number" placeholder="Fixed/Ton" value={fixedPerTon} onChange={(e) => setFixedPerTon(e.target.value === "" ? "" : parseFloat(e.target.value))} className="input input-bordered w-full" />
                    )}
                    {expenseType === "Percent/Ton" && (
                        <input type="number" placeholder="Percent/Ton" value={percentPerTon} onChange={(e) => setPercentPerTon(e.target.value === "" ? "" : parseFloat(e.target.value))} className="input input-bordered w-full" />
                    )}
                    {expenseType === "Range Ton From" && (
                        <>
                            <select value={rangeTonFrom} onChange={(e) => setRangeTonFrom(e.target.value)} className="select select-bordered w-full">
                                {rangeOptions.map((range, index) => (
                                    <option key={index} value={range}>{range}</option>
                                ))}
                            </select>
                            <input type="number" placeholder="Enter Value" value={rangeTonValue} onChange={(e) => setRangeTonValue(e.target.value === "" ? "" : parseFloat(e.target.value))} className="input input-bordered w-full" />
                        </>
                    )}
                </div>
                <p className="py-4 md:w-1/2">
                    <label htmlFor="Extra Charges">
                        <span className="block mb-1 font-medium">
                            Extra Charges
                        </span>
                        <input type="number" placeholder="Extra Charges If Brand Change" value={extraCharge} onChange={(e) => setExtraCharge(e.target.value === "" ? "" : parseFloat(e.target.value))} className="input input-bordered w-full" />
                    </label>
                </p>
                <button onClick={handleSaveExpense} className="btn btn-info mt-4">{editingIndex !== null ? "Update Expense" : "Save Expense"}</button>
            </div>

            {expenses.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="table w-full bg-base-200 rounded-lg shadow-md">
                        <thead>
                            <tr className="bg-base-300 text-base-content text-center">
                                <th>#</th>
                                <th>Expense Name</th>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Fixed Amount</th>
                                <th>Fixed/Ton</th>
                                <th>Percent/Ton</th>
                                <th>Range</th>
                                <th>Extra Charges</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map((expense, index) => (
                                <tr key={index} className="border-b border-base-300 text-center">
                                    <td>{index + 1}</td>
                                    <td>{expense.name}</td>
                                    <td>{expense.date}</td>
                                    <td>{expense.type}</td>
                                    <td>{expense.fixedAmount || "N/A"}</td>
                                    <td>{expense.fixedPerTon || "N/A"}</td>
                                    <td>{expense.percentPerTon || "N/A"}</td>
                                    <td>{expense.rangeTonFrom || "N/A"}</td>
                                    <td>{expense.extraCharge}</td>
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