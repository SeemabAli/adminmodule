import { useState } from "react";

const BankAccounts = () => {
    const [bankAccounts, setBankAccounts] = useState<
        { bankName: string; accountTitle: string; accountNumber: string; openingBalance: string; chequeFrom: string; chequeTo: string }[]
    >([]);
    const [bankName, setBankName] = useState("HBL");
    const [accountTitle, setAccountTitle] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [openingBalance, setOpeningBalance] = useState("");
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const [chequeFrom, setChequeFrom] = useState("");
    const [chequeTo, setChequeTo] = useState("");
    const [chequeEditingIndex, setChequeEditingIndex] = useState<number | null>(null);

    // Handle Bank Account Save
    const handleSaveBankAccount = () => {
        if (accountTitle.trim() === "" || accountNumber.trim() === "" || openingBalance.trim() === "") return;

        if (editingIndex !== null) {
            const updatedAccounts = [...bankAccounts];
            updatedAccounts[editingIndex] = { ...updatedAccounts[editingIndex], bankName, accountTitle, accountNumber, openingBalance };
            setBankAccounts(updatedAccounts);
            setEditingIndex(null);
        } else {
            setBankAccounts([...bankAccounts, { bankName, accountTitle, accountNumber, openingBalance, chequeFrom: "", chequeTo: "" }]);
        }

        setBankName("HBL");
        setAccountTitle("");
        setAccountNumber("");
        setOpeningBalance("");
    };

    // Handle Edit Bank Account
    const handleEditBank = (index: number) => {
        const account = bankAccounts[index];
        setBankName(account.bankName);
        setAccountTitle(account.accountTitle);
        setAccountNumber(account.accountNumber);
        setOpeningBalance(account.openingBalance);
        setEditingIndex(index);
    };

    // Handle Save Cheque Numbers
    const handleSaveChequeNumbers = (index: number) => {
        if (chequeFrom.trim() === "" || chequeTo.trim() === "") return;

        const updatedAccounts = [...bankAccounts];
        updatedAccounts[index] = { ...updatedAccounts[index], chequeFrom, chequeTo };
        setBankAccounts(updatedAccounts);
        setChequeEditingIndex(null);
        setChequeFrom("");
        setChequeTo("");
    };

    // Handle Edit Cheque Numbers
    const handleEditChequeNumbers = (index: number) => {
        const account = bankAccounts[index];
        setChequeFrom(account.chequeFrom);
        setChequeTo(account.chequeTo);
        setChequeEditingIndex(index);
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Bank Accounts</h2>

            {/* Bank Account Form */}
            <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Bank Dropdown */}
                    <select value={bankName} onChange={(e) => setBankName(e.target.value)} className="select select-bordered w-full">
                        <option value="HBL">HBL</option>
                        <option value="UBL">UBL</option>
                        <option value="Meezan">Meezan</option>
                        <option value="Other">Other</option>
                    </select>
                    <input type="text" placeholder="Account Title" value={accountTitle} onChange={(e) => setAccountTitle(e.target.value)} className="input input-bordered w-full" />
                    <input type="text" placeholder="Account Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="input input-bordered w-full" />
                    <input type="text" placeholder="Opening Balance" value={openingBalance} onChange={(e) => setOpeningBalance(e.target.value)} className="input input-bordered w-full" />
                </div>
                <button onClick={handleSaveBankAccount} className="btn btn-primary mt-4">
                    {editingIndex !== null ? "Update Account" : "Save Account"}
                </button>
            </div>

            {/* Bank Accounts Table */}
            {bankAccounts.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="table w-full bg-base-200 rounded-lg shadow-md">
                        <thead>
                            <tr className="bg-base-300 text-base-content text-center">
                                <th className="p-3">#</th>
                                <th className="p-3">Bank Name</th>
                                <th className="p-3">Account Title</th>
                                <th className="p-3">Account Number</th>
                                <th className="p-3">Opening Balance</th>
                                <th className="p-3">Cheque From</th>
                                <th className="p-3">Cheque To</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bankAccounts.map((account, index) => (
                                <tr key={index} className="border-b border-base-300 text-center">
                                    <td className="p-3">{index + 1}</td>
                                    <td className="p-3">{account.bankName}</td>
                                    <td className="p-3">{account.accountTitle}</td>
                                    <td className="p-3">{account.accountNumber}</td>
                                    <td className="p-3">{account.openingBalance}</td>
                                    <td className="p-3">{account.chequeFrom || "-"}</td>
                                    <td className="p-3">{account.chequeTo || "-"}</td>
                                    <td className="p-3">
                                        <button onClick={() => handleEditBank(index)} className="btn btn-sm btn-warning mr-2">
                                            Edit
                                        </button>
                                        <button onClick={() => handleEditChequeNumbers(index)} className="btn btn-sm btn-info">
                                            Edit Cheque
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-500 text-center">No bank accounts added yet.</p>
            )}

            {/* Cheque Number Form */}
            {chequeEditingIndex !== null && (
                <div className="bg-base-200 p-4 rounded-lg shadow-md mt-6">
                    <h3 className="text-lg font-bold mb-2">Edit Cheque Numbers</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Cheque From" value={chequeFrom} onChange={(e) => setChequeFrom(e.target.value)} className="input input-bordered w-full" />
                        <input type="text" placeholder="Cheque To" value={chequeTo} onChange={(e) => setChequeTo(e.target.value)} className="input input-bordered w-full" />
                    </div>
                    <button onClick={() => handleSaveChequeNumbers(chequeEditingIndex)} className="btn btn-primary mt-4">
                        Save Cheque Numbers
                    </button>
                </div>
            )}
        </div>
    );
};

export default BankAccounts;
