/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { BanknotesIcon } from "@heroicons/react/24/solid";
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
  createCheques,
  fetchCheques,
  updateChequeStatus,
} from "./bank.service";
import { z } from "zod";

const BANK_OPTIONS = [
  { value: "HBL", label: "HBL" },
  { value: "UBL", label: "UBL" },
  { value: "Meezan", label: "Meezan" },
  { value: "Other", label: "Other" },
];

const CHEQUE_STATUS_OPTIONS = [
  { value: "AVAILABLE", label: "AVAILABLE" },
  { value: "USED", label: "USED" },
  { value: "CANCELLED", label: "CANCELLED" },
];

// Updated schema for the new API format
const chequeCreateSchema = z.object({
  fromChequeNumber: z.number().min(1, "From number is required"),
  toChequeNumber: z.number().min(1, "To number is required"),
  status: z.enum(["AVAILABLE", "USED", "CANCELLED"]),
});

const chequeUpdateSchema = z.object({
  status: z.enum(["AVAILABLE", "USED", "CANCELLED"]),
});

export type ChequeCreateInput = z.infer<typeof chequeCreateSchema>;
export type ChequeUpdateInput = z.infer<typeof chequeUpdateSchema>;

const BankAccounts = () => {
  const { error, data, isLoading } = useService(fetchAllBankAccounts);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );
  const [editingChequeId, setEditingChequeId] = useState<string | null>(null);
  const [cheques, setCheques] = useState<Cheque[]>([]);
  const [isLoadingCheques, setIsLoadingCheques] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "AVAILABLE" | "USED" | "CANCELLED"
  >("AVAILABLE");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Cheque form - updated for the new API schema
  const {
    register: registerCheque,
    formState: { errors: chequeErrors, isSubmitting: isChequeSubmitting },
    handleSubmit: handleChequeSubmit,
    setValue: setChequeValue,
    reset: resetChequeForm,
    watch: watchChequeStatus,
  } = useForm<ChequeCreateInput>({
    resolver: zodResolver(chequeCreateSchema),
    defaultValues: {
      fromChequeNumber: 0,
      toChequeNumber: 0,
      status: "AVAILABLE",
    },
  });

  // Update form for cheque status
  const {
    register: registerChequeUpdate,
    formState: {
      errors: chequeUpdateErrors,
      isSubmitting: isChequeUpdateSubmitting,
    },
    handleSubmit: handleChequeUpdateSubmit,
    setValue: setChequeUpdateValue,
    reset: resetChequeUpdateForm,
    getValues: getChequeUpdateValues,
  } = useForm<ChequeUpdateInput>({
    resolver: zodResolver(chequeUpdateSchema),
    defaultValues: {
      status: "AVAILABLE",
    },
  });

  const chequeStatus = watchChequeStatus("status");

  // Load bank accounts
  useEffect(() => {
    if (data) {
      setBankAccounts(data);
    }
  }, [data]);

  // Load cheques when a bank account is selected
  useEffect(() => {
    if (selectedAccountId) {
      void loadCheques(selectedAccountId);
    } else {
      setCheques([]);
    }
  }, [selectedAccountId]);

  // Reset to page 1 when changing tabs
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const loadCheques = async (accountId: string) => {
    setIsLoadingCheques(true);
    try {
      const chequesData = await fetchCheques(accountId);
      setCheques(chequesData);
    } catch (error) {
      notify.error("Failed to load cheques");
      logger.error(error);
    } finally {
      setIsLoadingCheques(false);
    }
  };

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

  // Handle cheque operations - updated for the new API
  const handleAddCheque = async (data: ChequeCreateInput) => {
    if (!selectedAccountId) return;

    try {
      await createCheques(selectedAccountId, data);
      await loadCheques(selectedAccountId);
      resetChequeForm();
      // Switch to the appropriate tab based on the status of the new cheque
      setActiveTab(data.status);
      notify.success("Cheque batch added successfully");
    } catch (error) {
      notify.error("Failed to add cheque batch");
      logger.error(error);
    }
  };

  const handleEditCheque = (chequeId: string) => {
    const cheque = cheques.find((chq) => chq.id === chequeId);
    if (!cheque) return;

    setChequeUpdateValue("status", cheque.status);
    setEditingChequeId(chequeId);
  };

  const onChequeUpdate = async (chequeId: string) => {
    if (!selectedAccountId) return;

    try {
      const status = getChequeUpdateValues("status");
      resetChequeUpdateForm();
      await updateChequeStatus(selectedAccountId, chequeId, { status });
      await loadCheques(selectedAccountId);
      setEditingChequeId(null);
      // Switch to the tab of the updated status
      setActiveTab(status);
      notify.success("Cheque status updated successfully");
    } catch (error) {
      notify.error("Failed to update cheque status");
      logger.error(error);
    }
  };

  // Helper functions
  const getBankAccount = (accountId: string) => {
    return bankAccounts.find((acc) => acc.id === accountId);
  };

  const getChequesCount = (accountId: string) => {
    const account = getBankAccount(accountId);
    if (!account?.chequeCount) return 0;
    return account.chequeCount;
  };

  const getStatusCounts = () => {
    const counts = { AVAILABLE: 0, USED: 0, CANCELLED: 0 };

    cheques.forEach((cheque) => {
      if (cheque.status in counts) {
        counts[cheque.status]++;
      }
    });

    return counts;
  };

  // Filtered cheques based on active tab
  const filteredCheques = cheques.filter(
    (cheque) => cheque.status === activeTab,
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredCheques.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCheques = filteredCheques.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
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

  const statusCounts = getStatusCounts();

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
            type="number"
            name="openingBalance"
            label="Opening Balance"
            valueAsNumber
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
          <table className="table w-full text-center">
            <thead>
              <tr className="bg-base-300 text-base-content">
                <th className="p-3 text-center">#</th>
                <th className="p-3 text-center">Bank Name</th>
                <th className="p-3 text-center">Account Title</th>
                <th className="p-3 text-center">Account Number</th>
                <th className="p-3 text-center">Opening Balance</th>
                <th className="p-3 text-center">Total Cheques</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bankAccounts.map((account, index) => (
                <tr key={account.id} className="border-b border-base-300">
                  <td className="p-3 text-center">{index + 1}</td>
                  <td className="p-3 text-center">{account.bankName}</td>
                  <td className="p-3 text-center">{account.accountTitle}</td>
                  <td className="p-3 text-center">{account.accountNumber}</td>
                  <td className="p-3 text-center">{account.openingBalance}</td>
                  <td className="p-3 text-center">
                    {typeof getChequesCount(account.id ?? "") === "number"
                      ? (getChequesCount(account.id ?? "") as number)
                      : 0}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-x-2 flex-nowrap overflow-hidden">
                      <button
                        onClick={() => {
                          if (account.id) handleEditBankAccount(account.id);
                        }}
                        className="flex items-center justify-center shrink-0"
                      >
                        <PencilSquareIcon className="w-6 h-6 text-info" />
                      </button>
                      <button
                        onClick={() => {
                          if (account.id) setSelectedAccountId(account.id);
                        }}
                        className="flex items-center justify-center shrink-0 tooltip"
                        data-tip="Manage Cheques"
                      >
                        <BanknotesIcon className="w-6 h-6 text-success" />
                      </button>
                      <button
                        onClick={() => {
                          if (account.id) handleDeleteBankAccount(account.id);
                        }}
                        className="flex items-center justify-center shrink-0"
                      >
                        <TrashIcon className="w-6 h-6 text-red-500" />
                      </button>
                    </div>
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

      {/* Cheque Management Section - Refactored */}
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

          {/* Cheque Form - Updated for the new API */}
          <div className="bg-base-300 p-4 rounded-lg mb-4">
            <h4 className="font-medium mb-2">Add New Cheque Book</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="block mb-1">
                <label htmlFor="status" className="font-medium">
                  Status
                </label>
                <select
                  id="status"
                  {...registerCheque("status")}
                  value={chequeStatus}
                  className="select select-bordered w-full"
                >
                  <option value="AVAILABLE">AVAILABLE</option>
                </select>
                {chequeErrors.status && (
                  <p className="text-error text-sm mt-1">
                    {chequeErrors.status.message}
                  </p>
                )}
              </div>

              {chequeStatus === "CANCELLED" ? (
                <div className="block mb-1">
                  <label htmlFor="fromChequeNumber" className="font-medium">
                    Cancelled Cheque Number
                  </label>
                  <input
                    id="fromChequeNumber"
                    type="number"
                    {...registerCheque("fromChequeNumber")}
                    className="input input-bordered w-full"
                    placeholder="Cheque Number"
                  />
                  {chequeErrors.fromChequeNumber && (
                    <p className="text-error text-sm mt-1">
                      {chequeErrors.fromChequeNumber.message}
                    </p>
                  )}
                  <input
                    type="hidden"
                    {...registerCheque("toChequeNumber")}
                    value={
                      chequeStatus === "CANCELLED"
                        ? watchChequeStatus("fromChequeNumber")
                        : 0
                    }
                  />
                </div>
              ) : (
                <>
                  <div className="block mb-1">
                    <label htmlFor="fromChequeNumber" className="font-medium">
                      Cheque From
                    </label>
                    <input
                      id="fromChequeNumber"
                      type="number"
                      {...registerCheque("fromChequeNumber", {
                        setValueAs: (value) =>
                          value === "" ? undefined : Number(value),
                      })}
                      className="input input-bordered w-full"
                      placeholder="From Number"
                    />

                    {chequeErrors.fromChequeNumber && (
                      <p className="text-error text-sm mt-1">
                        {chequeErrors.fromChequeNumber.message}
                      </p>
                    )}
                  </div>
                  <div className="block mb-1">
                    <label htmlFor="toChequeNumber" className="font-medium">
                      Cheque To
                    </label>
                    <input
                      id="toChequeNumber"
                      type="number"
                      {...registerCheque("toChequeNumber", {
                        setValueAs: (value) =>
                          value === "" ? undefined : Number(value),
                      })}
                      className="input input-bordered w-full"
                      placeholder="To Number"
                    />
                    {chequeErrors.toChequeNumber && (
                      <p className="text-error text-sm mt-1">
                        {chequeErrors.toChequeNumber.message}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="flex mt-4">
              <Button
                onClick={handleChequeSubmit(handleAddCheque)}
                shape="info"
                pending={isChequeSubmitting}
              >
                Add Cheques
              </Button>
            </div>
          </div>

          {/* Cheque Edit Form */}
          {editingChequeId && (
            <div className="bg-base-300 p-4 rounded-lg mb-4">
              <h4 className="font-medium mb-2">Update Cheque Status</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="block mb-1">
                  <label htmlFor="updateStatus" className="font-medium">
                    Status
                  </label>
                  <select
                    id="updateStatus"
                    {...registerChequeUpdate("status")}
                    className="select select-bordered w-full"
                  >
                    {CHEQUE_STATUS_OPTIONS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  {chequeUpdateErrors.status && (
                    <p className="text-error text-sm mt-1">
                      {chequeUpdateErrors.status.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex mt-4">
                <Button
                  onClick={handleChequeUpdateSubmit(() =>
                    onChequeUpdate(editingChequeId),
                  )}
                  shape="info"
                  pending={isChequeUpdateSubmitting}
                >
                  Update Status
                </Button>
                <Button
                  onClick={() => {
                    setEditingChequeId(null);
                    resetChequeUpdateForm();
                  }}
                  shape="info"
                  className="ml-2"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Cheque Tabs */}
          <div className="tabs tabs-boxed bg-base-300 p-2 mb-4 flex justify-left font-medium gap-2">
            <button
              className={`tab px-4 py-2 rounded-lg transition-all ${
                activeTab === "AVAILABLE"
                  ? "tab-active bg-success text-white shadow-md"
                  : "hover:bg-success/20"
              }`}
              onClick={() => {
                setActiveTab("AVAILABLE");
              }}
            >
              Available ({statusCounts.AVAILABLE})
            </button>
            <button
              className={`tab px-4 py-2 rounded-lg transition-all ${
                activeTab === "USED"
                  ? "tab-active bg-warning text-white shadow-md"
                  : "hover:bg-warning/20"
              }`}
              onClick={() => {
                setActiveTab("USED");
              }}
            >
              Used ({statusCounts.USED})
            </button>
            <button
              className={`tab px-4 py-2 rounded-lg transition-all ${
                activeTab === "CANCELLED"
                  ? "tab-active bg-error text-white shadow-md"
                  : "hover:bg-error/20"
              }`}
              onClick={() => {
                setActiveTab("CANCELLED");
              }}
            >
              Cancelled ({statusCounts.CANCELLED})
            </button>
          </div>

          {/* Cheque Table with Pagination */}
          {isLoadingCheques ? (
            <div className="skeleton h-28 w-full"></div>
          ) : currentCheques.length > 0 ? (
            <div className="bg-base-300 rounded-lg p-4">
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr className="bg-base-200 text-base-content text-center">
                      <th className="p-3">#</th>
                      <th className="p-3">Cheque Number</th>
                      <th className="p-3">Date Added</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentCheques.map((cheque, index) => (
                      <tr
                        key={cheque.id}
                        className="border-b border-base-300 text-center hover:bg-base-200"
                      >
                        <td className="p-3">{indexOfFirstItem + index + 1}</td>
                        <td className="p-3 font-medium">{cheque.number}</td>
                        <td className="p-3">
                          {cheque.createdAt
                            ? new Date(cheque.createdAt).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="p-3">
                          <span
                            className={`badge ${
                              cheque.status === "AVAILABLE"
                                ? "badge-success"
                                : cheque.status === "USED"
                                  ? "badge-warning"
                                  : "badge-error"
                            } text-white`}
                          >
                            {cheque.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => {
                                if (cheque.id) handleEditCheque(cheque.id);
                              }}
                              className="flex items-center justify-center mr-2 btn btn-xs btn-circle btn-ghost"
                            >
                              <PencilSquareIcon className="w-4 h-4 text-info" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                  <div className="btn-group">
                    <button
                      className="btn btn-sm"
                      onClick={() => {
                        paginate(Math.max(1, currentPage - 1));
                      }}
                      disabled={currentPage === 1}
                    >
                      «
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        className={`btn btn-sm ${currentPage === i + 1 ? "btn-active" : ""}`}
                        onClick={() => {
                          paginate(i + 1);
                        }}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      className="btn btn-sm"
                      onClick={() => {
                        paginate(Math.min(totalPages, currentPage + 1));
                      }}
                      disabled={currentPage === totalPages}
                    >
                      »
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-base-300 p-6 rounded-lg shadow-md mb-6 text-center text-gray-500">
              No {activeTab.toLowerCase()} cheques found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BankAccounts;
