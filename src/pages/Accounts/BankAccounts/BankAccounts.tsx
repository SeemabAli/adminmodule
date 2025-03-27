/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useEffect, useState } from "react";
import { notify } from "@/lib/notify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// import { convertNumberIntoLocalString } from "@/utils/CommaSeparator";
import { Button } from "@/common/components/ui/Button";
import { FormField } from "@/common/components/ui/form/FormField";
import { ErrorModal } from "@/common/components/Error";
import { useService } from "@/common/hooks/custom/useService";
import { logger } from "@/lib/logger";
import { ApiException } from "@/utils/exceptions";
import PencilSquareIcon from "@heroicons/react/24/solid/PencilSquareIcon";
import TrashIcon from "@heroicons/react/24/solid/TrashIcon";
import {
  bankAccountSchema,
  chequeSchema,
  type BankAccount,
  type Cheque,
} from "./bank.schema";
import {
  createBankAccount,
  fetchAllBankAccounts,
  updateBankAccount,
  deleteBankAccount,
} from "./bank.service";

const BANK_OPTIONS = [
  { value: "HBL", label: "HBL" },
  { value: "UBL", label: "UBL" },
  { value: "Meezan", label: "Meezan" },
  { value: "Other", label: "Other" },
];

const BankAccounts = () => {
  const { error, data, isLoading } = useService(fetchAllBankAccounts);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );
  const [editingChequeId, setEditingChequeId] = useState<string | null>(null);

  // Bank account form
  const {
    register: registerBank,
    formState: { errors: bankErrors, isSubmitting: isBankSubmitting },
    handleSubmit: handleBankSubmit,
    setValue: setBankValue,
    reset: resetBankForm,
    getValues: getBankValues,
    watch: watchBankName,
  } = useForm<BankAccount>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      bankName: "HBL",
      accountTitle: "",
      accountNumber: "",
      openingBalance: 0,
    },
  });

  const watchedBankName = watchBankName("bankName");

  // Cheque form
  const {
    register: registerCheque,
    formState: { errors: chequeErrors, isSubmitting: isChequeSubmitting },
    handleSubmit: handleChequeSubmit,
    setValue: setChequeValue,
    reset: resetChequeForm,
    getValues: getChequeValues,
    watch: watchChequeStatus,
  } = useForm<Cheque>({
    resolver: zodResolver(chequeSchema),
    defaultValues: {
      chequeFrom: "",
      chequeTo: "",
      status: "active",
    },
  });

  const chequeStatus = watchChequeStatus("status");

  // Load bank accounts
  useEffect(() => {
    if (data) {
      setBankAccounts(data);
    }
  }, [data]);

  // Handle bank account operations
  const handleAddBankAccount = async (data: BankAccount) => {
    try {
      const newAccount = await createBankAccount(data);
      setBankAccounts([...bankAccounts, newAccount]);
      resetBankForm();
      notify.success("Bank account added successfully");
    } catch (error: unknown) {
      logger.error(error);
      if (error instanceof ApiException && error.statusCode === 409) {
        notify.error("Bank account already exists");
        return;
      }
      notify.error("Failed to add bank account");
    }
  };

  const onBankAccountUpdate = async (accountId: string) => {
    try {
      const updatedData = getBankValues();
      const updatedAccount = await updateBankAccount(accountId, updatedData);
      setBankAccounts(
        bankAccounts.map((account) =>
          account.id === accountId ? updatedAccount : account,
        ),
      );
      setEditingAccountId(null);
      resetBankForm();
      notify.success("Bank account updated successfully");
    } catch (error) {
      notify.error("Failed to update bank account");
      logger.error(error);
    }
  };

  const handleEditBankAccount = (accountId: string) => {
    const account = bankAccounts.find((acc) => acc.id === accountId);
    if (!account) return;

    setBankValue("bankName", account.bankName);
    setBankValue("accountTitle", account.accountTitle);
    setBankValue("accountNumber", account.accountNumber);
    setBankValue("openingBalance", account.openingBalance);
    setEditingAccountId(accountId);
  };

  const handleDeleteBankAccount = (accountId: string) => {
    notify.confirmDelete(async () => {
      try {
        await deleteBankAccount(accountId);
        setBankAccounts(bankAccounts.filter((acc) => acc.id !== accountId));
        if (selectedAccountId === accountId) {
          setSelectedAccountId(null);
        }
        notify.success("Bank account deleted successfully");
      } catch (error) {
        notify.error("Failed to delete bank account");
        logger.error(error);
      }
    });
  };

  // Handle cheque operations
  const handleAddCheque = async (data: Cheque) => {
    if (!selectedAccountId) return;

    try {
      const updatedCheques = [
        ...(getBankAccount(selectedAccountId)?.cheques ?? []),
      ];
      const newCheque: Cheque = {
        ...data,
        id: Date.now().toString(),
        dateAdded: new Date().toISOString().split("T")[0] ?? "",
      };
      updatedCheques.push(newCheque);

      const updatedAccount = await updateBankAccount(selectedAccountId, {
        ...getBankAccount(selectedAccountId)!,
        cheques: updatedCheques,
      });

      setBankAccounts(
        bankAccounts.map((acc) =>
          acc.id === selectedAccountId ? updatedAccount : acc,
        ),
      );
      resetChequeForm();
      notify.success("Cheque added successfully");
    } catch (error) {
      notify.error("Failed to add cheque");
      logger.error(error);
    }
  };

  const onChequeUpdate = async (chequeId: string) => {
    if (!selectedAccountId) return;

    try {
      const updatedData = getChequeValues();
      const updatedCheques =
        (getBankAccount(selectedAccountId)?.cheques ?? []).map((chq) =>
          chq.id === chequeId ? { ...chq, ...updatedData } : chq,
        ) || [];

      const updatedAccount = await updateBankAccount(selectedAccountId, {
        ...getBankAccount(selectedAccountId)!,
        cheques: updatedCheques,
      });

      setBankAccounts(
        bankAccounts.map((acc) =>
          acc.id === selectedAccountId ? updatedAccount : acc,
        ),
      );
      setEditingChequeId(null);
      resetChequeForm();
      notify.success("Cheque updated successfully");
    } catch (error) {
      notify.error("Failed to update cheque");
      logger.error(error);
    }
  };

  const handleEditCheque = (chequeId: string) => {
    const cheque = (getBankAccount(selectedAccountId!)?.cheques ?? []).find(
      (chq) => chq.id === chequeId,
    );
    if (!cheque) return;

    setChequeValue("chequeFrom", cheque.chequeFrom);
    setChequeValue("chequeTo", cheque.chequeTo);
    setChequeValue("status", cheque.status);
    setEditingChequeId(chequeId);
  };

  const handleDeleteCheque = (chequeId: string) => {
    if (!selectedAccountId) return;

    notify.confirmDelete(async () => {
      try {
        const updatedCheques =
          (getBankAccount(selectedAccountId)?.cheques ?? []).filter(
            (chq) => chq.id !== chequeId,
          ) ?? [];

        const updatedAccount = await updateBankAccount(selectedAccountId, {
          ...getBankAccount(selectedAccountId)!,
          cheques: updatedCheques,
        });

        setBankAccounts(
          bankAccounts.map((acc) =>
            acc.id === selectedAccountId ? updatedAccount : acc,
          ),
        );

        if (editingChequeId === chequeId) {
          setEditingChequeId(null);
          resetChequeForm();
        }
        notify.success("Cheque deleted successfully");
      } catch (error) {
        notify.error("Failed to delete cheque");
        logger.error(error);
      }
    });
  };

  // Helper functions
  const getBankAccount = (accountId: string) => {
    return bankAccounts.find((acc) => acc.id === accountId);
  };

  const getChequesCount = (accountId: string) => {
    const account = getBankAccount(accountId);
    if (!account) return 0;

    return (account.cheques ?? []).reduce((total, cheque) => {
      if (cheque.status === "cancelled") {
        return total + 1;
      }
      const from = parseInt(cheque.chequeFrom);
      const to = parseInt(cheque.chequeTo);
      return total + (isNaN(from) || isNaN(to) ? 0 : to - from + 1);
    }, 0);
  };

  const selectedAccount = selectedAccountId
    ? getBankAccount(selectedAccountId)
    : null;

  if (error) {
    return (
      <ErrorModal
        message={
          error instanceof Error
            ? error.message
            : "Failed to fetch bank accounts"
        }
      />
    );
  }

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
            <label htmlFor="bankName" className="font-medium">
              Select Bank
            </label>
            <select
              id="bankName"
              {...registerBank("bankName")}
              value={watchedBankName}
              onChange={(e) => {
                setBankValue("bankName", e.target.value);
              }}
              className="select select-bordered w-full"
            >
              {BANK_OPTIONS.map((bank) => (
                <option key={bank.value} value={bank.value}>
                  {bank.label}
                </option>
              ))}
            </select>
            {bankErrors.bankName && (
              <p className="text-error text-sm mt-1">
                {bankErrors.bankName.message}
              </p>
            )}
          </div>
          <FormField
            type="text"
            name="accountTitle"
            label="Account Title"
            placeholder="Account Title"
            register={registerBank}
            errorMessage={bankErrors.accountTitle?.message}
          />
          <FormField
            type="text"
            name="accountNumber"
            label="Account Number/IBAN#"
            placeholder="Account Number"
            register={registerBank}
            errorMessage={bankErrors.accountNumber?.message}
          />
          <FormField
            type="text"
            name="openingBalance"
            label="Opening Balance"
            placeholder="Opening Balance"
            register={registerBank}
            errorMessage={bankErrors.openingBalance?.message}
          />
        </div>
        <div className="flex mt-4">
          <Button
            onClick={
              editingAccountId
                ? handleBankSubmit(() => onBankAccountUpdate(editingAccountId))
                : handleBankSubmit(handleAddBankAccount)
            }
            shape="info"
            pending={isBankSubmitting}
          >
            {editingAccountId ? "Update Account" : "Save Account"}
          </Button>
          {editingAccountId && (
            <Button
              onClick={() => {
                setEditingAccountId(null);
                resetBankForm();
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
      {isLoading ? (
        <div className="skeleton h-28 w-full"></div>
      ) : bankAccounts.length > 0 ? (
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
                      onClick={() => {
                        if (account.id) handleEditBankAccount(account.id);
                      }}
                      className="btn btn-xs btn-secondary mr-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (account.id) setSelectedAccountId(account.id);
                      }}
                      className="btn btn-xs btn-info mr-1"
                    >
                      Manage Cheques
                    </button>
                    <button
                      onClick={() => {
                        if (account.id) handleDeleteBankAccount(account.id);
                      }}
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
      {selectedAccount && (
        <div className="bg-base-200 p-4 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Cheque Management - {selectedAccount.bankName} (
              {selectedAccount.accountTitle})
            </h3>
            <Button
              onClick={() => {
                setSelectedAccountId(null);
              }}
              shape="info"
            >
              Back to Accounts
            </Button>
          </div>

          {/* Cheque Form */}
          <div className="bg-base-300 p-4 rounded-lg mb-4">
            <h4 className="font-medium mb-2">
              {editingChequeId ? "Edit Cheque Book" : "Add New Cheque Book"}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                name="status"
                label="Status"
                register={registerCheque}
                errorMessage={chequeErrors.status?.message}
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </FormField>

              {chequeStatus === "cancelled" ? (
                <FormField
                  type="text"
                  name="chequeFrom"
                  label="Cancelled Cheque Number"
                  placeholder="Cheque Number"
                  register={registerCheque}
                  errorMessage={chequeErrors.chequeFrom?.message}
                />
              ) : (
                <>
                  <FormField
                    type="text"
                    name="chequeFrom"
                    label="Cheque From"
                    placeholder="From Number"
                    register={registerCheque}
                    errorMessage={chequeErrors.chequeFrom?.message}
                  />
                  <FormField
                    type="text"
                    name="chequeTo"
                    label="Cheque To"
                    placeholder="To Number"
                    register={registerCheque}
                    errorMessage={chequeErrors.chequeTo?.message}
                  />
                </>
              )}
            </div>
            <div className="flex mt-4">
              <Button
                onClick={
                  editingChequeId
                    ? handleChequeSubmit(() => onChequeUpdate(editingChequeId))
                    : handleChequeSubmit(handleAddCheque)
                }
                shape="info"
                pending={isChequeSubmitting}
              >
                {editingChequeId ? "Update Cheque Book" : "Add Cheque Book"}
              </Button>
              {editingChequeId && (
                <Button
                  onClick={() => {
                    setEditingChequeId(null);
                    resetChequeForm();
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
          {(selectedAccount.cheques ?? []).length > 0 ? (
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
                  {(selectedAccount.cheques ?? []).map((cheque, index) => {
                    const count =
                      cheque.status === "cancelled"
                        ? 1
                        : parseInt(cheque.chequeTo) -
                          parseInt(cheque.chequeFrom) +
                          1;

                    return (
                      <tr key={cheque.id} className="border-b border-base-300">
                        <td className="p-3">{index + 1}</td>
                        <td className="p-3">{cheque.chequeFrom}</td>
                        <td className="p-3">{cheque.chequeTo}</td>
                        <td className="p-3">
                          {isNaN(count) ? "Invalid" : count}
                        </td>
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
                            onClick={() => {
                              if (cheque.id) handleEditCheque(cheque.id);
                            }}
                            className="flex items-center justify-center mr-2"
                          >
                            <PencilSquareIcon className="w-4 h-4 text-info" />
                          </button>
                          <button
                            onClick={() => {
                              if (cheque.id) handleDeleteCheque(cheque.id);
                            }}
                            className="flex items-center justify-center"
                          >
                            <TrashIcon className="w-4 h-4 text-red-500" />
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
