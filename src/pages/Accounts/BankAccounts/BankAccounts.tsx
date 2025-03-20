/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-confusing-void-expression */
import { useEffect, useState } from "react";
import { notify } from "@/lib/notify";
import { FormField } from "@/common/components/ui/form/FormField";
import { useForm } from "react-hook-form";
import { Button } from "@/common/components/ui/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  bankAccountSchema,
  chequeSchema,
  type BankAccount,
  type Cheque,
  type ChequeStatus,
} from "./bank.schema";
import { logger } from "@/lib/logger";

const BankAccounts = () => {
  // Bank account state
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);

  // Cheque management state
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );
  const [editingChequeId, setEditingChequeId] = useState<string | null>(null);

  // Bank Account Form
  const {
    register: registerBankAccount,
    formState: { errors: bankErrors, isSubmitting: isBankSubmitting },
    handleSubmit: handleBankSubmit,
    reset: resetBankForm,
  } = useForm<BankAccount>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      id: "",
      bankName: "HBL",
      accountTitle: "",
      accountNumber: "",
      openingBalance: "",
      cheques: [],
    },
  });

  // Cheque Form
  const {
    register: registerCheque,
    formState: { errors: chequeErrors, isSubmitting: isChequeSubmitting },
    handleSubmit: handleChequeSubmit,
    setValue: setChequeValue,
    reset: resetChequeForm,
    watch: watchChequeForm,
  } = useForm<Cheque>({
    resolver: zodResolver(chequeSchema),
    defaultValues: {
      id: "",
      chequeFrom: "",
      chequeTo: "",
      status: "active" as ChequeStatus,
    },
  });

  // Watch for changes in cheque status
  const chequeStatus = watchChequeForm("status");
  const chequeFrom = watchChequeForm("chequeFrom");

  // Set chequeTo equal to chequeFrom when status is cancelled
  useEffect(() => {
    if (chequeStatus === "cancelled" && chequeFrom) {
      setChequeValue("chequeTo", chequeFrom);
    }
  }, [chequeStatus, chequeFrom, setChequeValue]);

  // Generate a unique ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  // Format opening balance with commas
  // const handleOpeningBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = e.target.value;
  //   const formattedValue = formatNumberWithCommas(value.replace(/,/g, ""));
  //   setBankValue("openingBalance", formattedValue);
  // };

  // Handle bank account save/update
  const handleSaveBankAccount = async (data: BankAccount) => {
    try {
      if (editingAccountId) {
        // Update existing account
        setBankAccounts(
          bankAccounts.map((account) =>
            account.id === editingAccountId
              ? { ...account, ...data, id: editingAccountId }
              : account,
          ),
        );
        setEditingAccountId(null);
        notify.success("Bank account updated successfully!");
      } else {
        // Add new account
        const newAccount: BankAccount = {
          ...data,
          id: generateId(),
          cheques: [],
        };
        setBankAccounts([...bankAccounts, newAccount]);
        notify.success("Bank account added successfully!");
      }
      resetBankForm({
        id: "",
        bankName: "HBL",
        accountTitle: "",
        accountNumber: "",
        openingBalance: "",
      });
    } catch (error: unknown) {
      notify.error("Failed to save bank account.");
      logger.error(error);
    }
  };

  // Handle edit bank account
  const handleEditBankAccount = (accountId: string) => {
    const account = bankAccounts.find((acc) => acc.id === accountId);
    if (!account) return;

    resetBankForm({
      id: account.id,
      bankName: account.bankName,
      accountTitle: account.accountTitle,
      accountNumber: account.accountNumber,
      openingBalance: account.openingBalance,
    });
    setEditingAccountId(accountId);
  };

  // Handle delete bank account
  const handleDeleteBankAccount = (accountId: string) => {
    notify.confirmDelete(() => {
      setBankAccounts(
        bankAccounts.filter((account) => account.id !== accountId),
      );
      if (selectedAccountId === accountId) {
        setSelectedAccountId(null);
      }
      notify.success("Bank account deleted successfully!");
    });
  };

  // Handle selecting an account for cheque management
  const handleSelectAccount = (accountId: string) => {
    setSelectedAccountId(accountId);
    setEditingChequeId(null);
    resetChequeForm({
      id: "",
      chequeFrom: "",
      chequeTo: "",
      status: "active",
    });
  };

  // Handle save/update cheque
  const handleSaveCheque = async (data: Cheque) => {
    try {
      if (!selectedAccountId) return;

      if (data.status === "cancelled") {
        // For cancelled cheques, make sure chequeTo equals chequeFrom
        data.chequeTo = data.chequeFrom;
      }

      setBankAccounts(
        bankAccounts.map((account) => {
          if (account.id === selectedAccountId) {
            let updatedCheques;

            if (editingChequeId) {
              // Update existing cheque
              updatedCheques =
                account.cheques?.map((cheque) =>
                  cheque.id === editingChequeId
                    ? { ...data, id: editingChequeId }
                    : cheque,
                ) ?? [];
            } else {
              // Add new cheque
              const newCheque: Cheque = {
                ...data,
                id: generateId(),
                dateAdded: new Date().toISOString().split("T")[0],
              };
              updatedCheques = [...(account.cheques ?? []), newCheque];
            }

            return { ...account, cheques: updatedCheques };
          }
          return account;
        }),
      );

      resetChequeForm({
        id: "",
        chequeFrom: "",
        chequeTo: "",
        status: "active",
      });
      setEditingChequeId(null);
      notify.success(
        editingChequeId
          ? "Cheque book updated successfully!"
          : "Cheque book added successfully!",
      );
    } catch (error: unknown) {
      notify.error("Failed to save cheque book.");
      logger.error(error);
    }
  };

  // Handle edit cheque
  const handleEditCheque = (chequeId: string) => {
    const selectedAccount = bankAccounts.find(
      (acc) => acc.id === selectedAccountId,
    );
    if (!selectedAccount) return;

    const cheque = selectedAccount.cheques?.find((chq) => chq.id === chequeId);
    if (!cheque) return;

    resetChequeForm({
      id: cheque.id,
      chequeFrom: cheque.chequeFrom,
      chequeTo: cheque.chequeTo,
      status: cheque.status,
    });
    setEditingChequeId(chequeId);
  };

  // Handle delete cheque
  const handleDeleteCheque = (chequeId: string) => {
    notify.confirmDelete(() => {
      setBankAccounts(
        bankAccounts.map((account) => {
          if (account.id === selectedAccountId) {
            return {
              ...account,
              cheques:
                account.cheques?.filter((cheque) => cheque.id !== chequeId) ??
                [],
            };
          }
          return account;
        }),
      );

      if (editingChequeId === chequeId) {
        setEditingChequeId(null);
        resetChequeForm({
          id: "",
          chequeFrom: "",
          chequeTo: "",
          status: "active",
        });
      }
      notify.success("Cheque book deleted successfully!");
    });
  };

  // Get total cheques count for an account
  const getChequesCount = (accountId: string) => {
    const account = bankAccounts.find((acc) => acc.id === accountId);
    if (!account?.cheques) return 0;

    let total = 0;
    account.cheques.forEach((cheque) => {
      if (cheque.status === "cancelled") {
        // For cancelled cheques, count as 1
        total += 1;
      } else {
        // For active or completed cheques, calculate the range
        const from = parseInt(cheque.chequeFrom);
        const to = parseInt(cheque.chequeTo);
        if (!isNaN(from) && !isNaN(to)) {
          total += to - from + 1;
        }
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
          <div className="block mb-1">
            <FormField
              label="Select Bank"
              name="bankName"
              register={registerBankAccount}
              errorMessage={bankErrors.bankName?.message}
              renderInput={
                <select
                  {...registerBankAccount("bankName")}
                  className="select select-bordered w-full bg-base-100 text-base-content focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="HBL">HBL</option>
                  <option value="UBL">UBL</option>
                  <option value="Meezan">Meezan</option>
                  <option value="Other">Other</option>
                </select>
              }
            />
          </div>
          <FormField
            placeholder="Account Title"
            name="accountTitle"
            label="Account Title"
            register={registerBankAccount}
            errorMessage={bankErrors.accountTitle?.message}
          />
          <FormField
            placeholder="Account Number/IBAN#"
            name="accountNumber"
            label="Account Number/IBAN#"
            register={registerBankAccount}
            errorMessage={bankErrors.accountNumber?.message}
          />
          <div className="block mb-1">
            <FormField
              placeholder="Opening Balance"
              name="openingBalance"
              label="Opening Balance"
              register={registerBankAccount}
              errorMessage={bankErrors.openingBalance?.message}
              renderInput={
                <select
                  {...registerBankAccount("bankName")}
                  className="select select-bordered w-full bg-base-100 text-base-content focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="HBL">HBL</option>
                  <option value="UBL">UBL</option>
                  <option value="Meezan">Meezan</option>
                  <option value="Other">Other</option>
                </select>
              }
            />
          </div>
        </div>
        <div className="flex mt-4">
          <Button
            onClick={handleBankSubmit(handleSaveBankAccount)}
            shape="info"
            pending={isBankSubmitting}
          >
            {editingAccountId ? "Update Account" : "Save Account"}
          </Button>
          {editingAccountId && (
            <Button
              onClick={() => {
                setEditingAccountId(null);
                resetBankForm({
                  id: "",
                  bankName: "HBL",
                  accountTitle: "",
                  accountNumber: "",
                  openingBalance: "",
                });
              }}
              shape="info"
              className="ml-2"
            >
              Cancel
            </Button>
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
                  <td className="p-3">{getChequesCount(account.id ?? "")}</td>
                  <td className="p-3">
                    <button
                      onClick={() =>
                        account.id && handleEditBankAccount(account.id)
                      }
                      className="btn btn-xs btn-secondary mr-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        account.id && handleSelectAccount(account.id)
                      }
                      className="btn btn-xs btn-info mr-1"
                    >
                      Manage Cheques
                    </button>
                    <button
                      onClick={() =>
                        account.id && handleDeleteBankAccount(account.id)
                      }
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
          No bank accounts added yet.
        </div>
      )}

      {/* Cheque Management Section */}
      {selectedAccountId && selectedAccount && (
        <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Cheque Management - {selectedAccount.bankName} (
              {selectedAccount.accountTitle})
            </h3>
            <button
              onClick={() => {
                setSelectedAccountId(null);
              }}
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
              <div className="block mb-1">
                <FormField
                  name="status"
                  label="Status"
                  register={registerCheque}
                  errorMessage={chequeErrors.status?.message}
                  renderInput={
                    <select
                      {...registerCheque("status")}
                      className="select select-bordered w-full"
                    >
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  }
                />
              </div>

              {/* Dynamic input fields based on status */}
              {chequeStatus === "cancelled" ? (
                <FormField
                  placeholder="Cancelled Cheque Number"
                  name="chequeFrom"
                  label="Cheque Number"
                  register={registerCheque}
                  errorMessage={chequeErrors.chequeFrom?.message}
                />
              ) : (
                <>
                  <FormField
                    placeholder="Cheque From"
                    name="chequeFrom"
                    label="Cheque From"
                    register={registerCheque}
                    errorMessage={chequeErrors.chequeFrom?.message}
                  />
                  <FormField
                    placeholder="Cheque To"
                    name="chequeTo"
                    label="Cheque To"
                    register={registerCheque}
                    errorMessage={chequeErrors.chequeTo?.message}
                  />
                </>
              )}
            </div>
            <div className="flex mt-4">
              <Button
                onClick={handleChequeSubmit(handleSaveCheque)}
                shape="info"
                pending={isChequeSubmitting}
              >
                {editingChequeId ? "Update Cheque Book" : "Add Cheque Book"}
              </Button>
              {editingChequeId && (
                <Button
                  onClick={() => {
                    setEditingChequeId(null);
                    resetChequeForm({
                      id: "",
                      chequeFrom: "",
                      chequeTo: "",
                      status: "active",
                    });
                  }}
                  shape="info"
                  className="ml-2"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>

          {/* Cheque Table */}
          {selectedAccount.cheques && selectedAccount.cheques.length > 0 ? (
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
                    let count;
                    if (cheque.status === "cancelled") {
                      count = 1; // Cancelled cheques count as 1
                    } else {
                      const fromNum = parseInt(cheque.chequeFrom);
                      const toNum = parseInt(cheque.chequeTo);
                      count =
                        !isNaN(fromNum) && !isNaN(toNum)
                          ? toNum - fromNum + 1
                          : "Invalid";
                    }

                    return (
                      <tr key={cheque.id} className="border-b border-base-300">
                        <td className="p-3">{index + 1}</td>
                        <td className="p-3">{cheque.chequeFrom}</td>
                        <td className="p-3">{cheque.chequeTo}</td>
                        <td className="p-3">{count}</td>
                        <td className="p-3">{cheque.dateAdded}</td>
                        <td className="p-3">
                          <span
                            className={`badge ${
                              cheque.status === "active"
                                ? "badge-success"
                                : cheque.status === "completed"
                                  ? "badge-warning"
                                  : "badge-error"
                            }`}
                          >
                            {cheque.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() =>
                              cheque.id && handleEditCheque(cheque.id)
                            }
                            className="btn btn-xs btn-secondary mr-1"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              cheque.id && handleDeleteCheque(cheque.id)
                            }
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
            <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6 text-center text-gray-500">
              No Cheques added yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BankAccounts;
