import { useState } from "react";

interface BankAccount {
    id: string;
    bankName: string;
    accountTitle: string;
    accountNumber: string;
    openingBalance: string;
    cheques: Cheque[];
}

interface Cheque {
    id: string;
    chequeFrom: string;
    chequeTo: string;
    dateAdded: string;
    status: ChequeStatus;
}

// Define a type for cheque status
type ChequeStatus = "active" | "completed" | "cancelled";

const BankAccounts = () => {
    // Bank account state
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [bankFormData, setBankFormData] = useState({
        bankName: "HBL",
        accountTitle: "",
        accountNumber: "",
        openingBalance: "",
    });
    const [editingAccountId, setEditingAccountId] = useState<string | null>(null);

    // Cheque management state
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    // Use explicit type annotation for the status field
    const [chequeFormData, setChequeFormData] = useState<{
        chequeFrom: string;
        chequeTo: string;
        status: ChequeStatus;
    }>({
        chequeFrom: "",
        chequeTo: "",
        status: "active",
    });
    const [editingChequeId, setEditingChequeId] = useState<string | null>(null);

    const formatNumberWithCommas = (num: string) => {
        return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const handleBankInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setBankFormData({
            ...bankFormData,
            [name]: name === "openingBalance" ? formatNumberWithCommas(value.replace(/,/g, "")) : value,
        });
    };

    // Generate a unique ID
    const generateId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    };

    // Handle bank account save/update
    const handleSaveBankAccount = () => {
        const { bankName, accountTitle, accountNumber, openingBalance } = bankFormData;

        if (accountTitle.trim() === "" || accountNumber.trim() === "" || openingBalance.trim() === "") {
            alert("Please fill in all required fields");
            return;
        }

        if (editingAccountId) {
            // Update existing account
            setBankAccounts(
                bankAccounts.map((account) =>
                    account.id === editingAccountId
                        ? { ...account, bankName, accountTitle, accountNumber, openingBalance }
                        : account
                )
            );
            setEditingAccountId(null);
        } else {
            // Add new account
            const newAccount: BankAccount = {
                id: generateId(),
                bankName,
                accountTitle,
                accountNumber,
                openingBalance,
                cheques: [],
            };
            setBankAccounts([...bankAccounts, newAccount]);
        }

        // Reset form
        setBankFormData({
            bankName: "HBL",
            accountTitle: "",
            accountNumber: "",
            openingBalance: "",
        });
    };

    // Handle edit bank account
    const handleEditBankAccount = (accountId: string) => {
        const account = bankAccounts.find((acc) => acc.id === accountId);
        if (account) {
            setBankFormData({
                bankName: account.bankName,
                accountTitle: account.accountTitle,
                accountNumber: account.accountNumber,
                openingBalance: account.openingBalance,
            });
            setEditingAccountId(accountId);
        }
    };

    // Handle delete bank account
    const handleDeleteBankAccount = (accountId: string) => {
        if (confirm("Are you sure you want to delete this bank account?")) {
            setBankAccounts(bankAccounts.filter((account) => account.id !== accountId));
            if (selectedAccountId === accountId) {
                setSelectedAccountId(null);
            }
        }
    };

    // Handle selecting an account for cheque management
    const handleSelectAccount = (accountId: string) => {
        setSelectedAccountId(accountId);
        setEditingChequeId(null);
        setChequeFormData({
            chequeFrom: "",
            chequeTo: "",
            status: "active",
        });
    };

    // Handle cheque form input changes
    const handleChequeInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setChequeFormData({
            ...chequeFormData,
            // Use type assertion for the status field
            [name]: name === "status" ? (value as ChequeStatus) : value,
        });
    };

    // Handle save/update cheque
    const handleSaveCheque = () => {
        if (!selectedAccountId) return;

        const { chequeFrom, chequeTo, status } = chequeFormData;

        if (chequeFrom.trim() === "" || chequeTo.trim() === "") {
            alert("Please fill in all required fields");
            return;
        }

        const fromNum = parseInt(chequeFrom);
        const toNum = parseInt(chequeTo);

        if (isNaN(fromNum) || isNaN(toNum)) {
            alert("Cheque numbers must be valid numbers");
            return;
        }

        if (fromNum > toNum) {
            alert("'Cheque From' must be less than or equal to 'Cheque To'");
            return;
        }

        setBankAccounts(
            bankAccounts.map((account) => {
                if (account.id === selectedAccountId) {
                    let updatedCheques;

                    if (editingChequeId) {
                        // Update existing cheque
                        updatedCheques = account.cheques.map((cheque) =>
                            cheque.id === editingChequeId
                                ? { ...cheque, chequeFrom, chequeTo, status }
                                : cheque
                        );
                    } else {
                        // Add new cheque
                        const newCheque: Cheque = {
                            id: generateId(),
                            chequeFrom,
                            chequeTo,
                            dateAdded: new Date().toISOString().split("T")[0],
                            status,
                        };
                        updatedCheques = [...account.cheques, newCheque];
                    }

                    return { ...account, cheques: updatedCheques };
                }
                return account;
            })
        );

        // Reset form
        setChequeFormData({
            chequeFrom: "",
            chequeTo: "",
            status: "active",
        });
        setEditingChequeId(null);
    };

    // Handle edit cheque
    const handleEditCheque = (chequeId: string) => {
        const selectedAccount = bankAccounts.find((acc) => acc.id === selectedAccountId);
        if (selectedAccount) {
            const cheque = selectedAccount.cheques.find((chq) => chq.id === chequeId);
            if (cheque) {
                setChequeFormData({
                    chequeFrom: cheque.chequeFrom,
                    chequeTo: cheque.chequeTo,
                    status: cheque.status,
                });
                setEditingChequeId(chequeId);
            }
        }
    };

    // Handle delete cheque
    const handleDeleteCheque = (chequeId: string) => {
        if (confirm("Are you sure you want to delete this cheque record?")) {
            setBankAccounts(
                bankAccounts.map((account) => {
                    if (account.id === selectedAccountId) {
                        return {
                            ...account,
                            cheques: account.cheques.filter((cheque) => cheque.id !== chequeId),
                        };
                    }
                    return account;
                })
            );

            if (editingChequeId === chequeId) {
                setEditingChequeId(null);
                setChequeFormData({
                    chequeFrom: "",
                    chequeTo: "",
                    status: "active",
                });
            }
        }
    };

    // Get total cheques count for an account
    const getChequesCount = (accountId: string) => {
        const account = bankAccounts.find((acc) => acc.id === accountId);
        if (!account) return 0;

        let total = 0;
        account.cheques.forEach((cheque) => {
            const from = parseInt(cheque.chequeFrom);
            const to = parseInt(cheque.chequeTo);
            if (!isNaN(from) && !isNaN(to)) {
                total += (to - from) + 1;
            }
        });

        return total;
    };

    // Get selected account
    const selectedAccount = selectedAccountId
        ? bankAccounts.find((acc) => acc.id === selectedAccountId)
        : null;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Bank Accounts Management</h2>

            {/* Bank Account Form */}
            <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
                <h3 className="text-lg font-semibold mb-3">
                    {editingAccountId ? "Edit Bank Account" : "Add New Bank Account"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block mb-1 font-medium">
                        Select Bank
                        <select
                            name="bankName"
                            value={bankFormData.bankName}
                            onChange={handleBankInputChange}
                            className="select select-bordered w-full"
                        >
                            <option value="HBL">HBL</option>
                            <option value="UBL">UBL</option>
                            <option value="Meezan">Meezan</option>
                            <option value="Other">Other</option>
                        </select>
                    </label>
                    <label className="block mb-1 font-medium">
                        Account Title
                        <input
                            type="text"
                            name="accountTitle"
                            placeholder="Account Title"
                            value={bankFormData.accountTitle}
                            onChange={handleBankInputChange}
                            className="input input-bordered w-full"
                        />
                    </label>
                    <label className="block mb-1 font-medium">
                        Account Number
                        <input
                            type="text"
                            name="accountNumber"
                            placeholder="Account Number"
                            value={bankFormData.accountNumber}
                            onChange={handleBankInputChange}
                            className="input input-bordered w-full"
                        />
                    </label>
                    <label className="block mb-1 font-medium">
                        Opening Balance
                        <input
                            type="text"
                            name="openingBalance"
                            placeholder="Opening Balance"
                            value={bankFormData.openingBalance}
                            onChange={handleBankInputChange}
                            className="input input-bordered w-full"
                        />
                    </label>
                </div>
                <div className="flex mt-4">
                    <button onClick={handleSaveBankAccount} className="btn btn-primary">
                        {editingAccountId ? "Update Account" : "Save Account"}
                    </button>
                    {editingAccountId && (
                        <button
                            onClick={() => {
                                setEditingAccountId(null);
                                setBankFormData({
                                    bankName: "HBL",
                                    accountTitle: "",
                                    accountNumber: "",
                                    openingBalance: "",
                                });
                            }}
                            className="btn btn-outline ml-2"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            {/* Bank Accounts Table */}
            {bankAccounts.length > 0 ? (
                <div className="overflow-x-auto bg-base-200 p-4 rounded-lg shadow-md mb-6">
                    <h3 className="text-lg font-semibold mb-3">Bank Accounts</h3>
                    <table className="table w-full">
                        <thead>
                            <tr className="bg-base-300 text-base-content">
                                <th className="p-3">#</th>
                                <th className="p-3">Bank Name</th>
                                <th className="p-3">Account Title</th>
                                <th className="p-3">Account Number</th>
                                <th className="p-3">Opening Balance</th>
                                <th className="p-3">Total Cheques</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bankAccounts.map((account, index) => (
                                <tr key={account.id} className="border-b border-base-300">
                                    <td className="p-3">{index + 1}</td>
                                    <td className="p-3">{account.bankName}</td>
                                    <td className="p-3">{account.accountTitle}</td>
                                    <td className="p-3">{account.accountNumber}</td>
                                    <td className="p-3">{account.openingBalance}</td>
                                    <td className="p-3">{getChequesCount(account.id)}</td>
                                    <td className="p-3">
                                        <button
                                            onClick={() => handleEditBankAccount(account.id)}
                                            className="btn btn-xs btn-warning mr-1"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleSelectAccount(account.id)}
                                            className="btn btn-xs btn-info mr-1"
                                        >
                                            Manage Cheques
                                        </button>
                                        <button
                                            onClick={() => handleDeleteBankAccount(account.id)}
                                            className="btn btn-xs btn-error"
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
                <div className="bg-base-200 p-6 rounded-lg shadow-md mb-6 text-center">
                    <p className="text-gray-500">No bank accounts added yet.</p>
                </div>
            )}

            {/* Cheque Management Section */}
            {selectedAccountId && selectedAccount && (
                <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">
                            Cheque Management - {selectedAccount.bankName} ({selectedAccount.accountTitle})
                        </h3>
                        <button
                            onClick={() => setSelectedAccountId(null)}
                            className="btn btn-sm btn-outline"
                        >
                            Back to Accounts
                        </button>
                    </div>

                    {/* Cheque Form */}
                    <div className="bg-base-300 p-4 rounded-lg mb-4">
                        <h4 className="font-medium mb-2">
                            {editingChequeId ? "Edit Cheque Book" : "Add New Cheque Book"}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                type="text"
                                name="chequeFrom"
                                placeholder="Cheque From"
                                value={chequeFormData.chequeFrom}
                                onChange={handleChequeInputChange}
                                className="input input-bordered w-full"
                            />
                            <input
                                type="text"
                                name="chequeTo"
                                placeholder="Cheque To"
                                value={chequeFormData.chequeTo}
                                onChange={handleChequeInputChange}
                                className="input input-bordered w-full"
                            />
                            <select
                                name="status"
                                value={chequeFormData.status}
                                onChange={handleChequeInputChange}
                                className="select select-bordered w-full"
                            >
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div className="flex mt-4">
                            <button onClick={handleSaveCheque} className="btn btn-primary">
                                {editingChequeId ? "Update Cheque Book" : "Add Cheque Book"}
                            </button>
                            {editingChequeId && (
                                <button
                                    onClick={() => {
                                        setEditingChequeId(null);
                                        setChequeFormData({
                                            chequeFrom: "",
                                            chequeTo: "",
                                            status: "active",
                                        });
                                    }}
                                    className="btn btn-outline ml-2"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Cheque Table */}
                    {selectedAccount.cheques.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr className="bg-base-300 text-base-content">
                                        <th className="p-3">#</th>
                                        <th className="p-3">From</th>
                                        <th className="p-3">To</th>
                                        <th className="p-3">Count</th>
                                        <th className="p-3">Date Added</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedAccount.cheques.map((cheque, index) => {
                                        const fromNum = parseInt(cheque.chequeFrom);
                                        const toNum = parseInt(cheque.chequeTo);
                                        const count = !isNaN(fromNum) && !isNaN(toNum) ? (toNum - fromNum) + 1 : "Invalid";

                                        return (
                                            <tr key={cheque.id} className="border-b border-base-300">
                                                <td className="p-3">{index + 1}</td>
                                                <td className="p-3">{cheque.chequeFrom}</td>
                                                <td className="p-3">{cheque.chequeTo}</td>
                                                <td className="p-3">{count}</td>
                                                <td className="p-3">{cheque.dateAdded}</td>
                                                <td className="p-3">
                                                    <span className={`badge ${cheque.status === "active" ? "badge-success" :
                                                        cheque.status === "completed" ? "badge-warning" : "badge-error"
                                                        }`}>
                                                        {cheque.status}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <button
                                                        onClick={() => handleEditCheque(cheque.id)}
                                                        className="btn btn-xs btn-warning mr-1"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCheque(cheque.id)}
                                                        className="btn btn-xs btn-error"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center p-4">No cheque books added for this account yet.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default BankAccounts;