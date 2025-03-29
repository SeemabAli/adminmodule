import { sendApiRequest } from "@/common/services/api.service";
import { type BankAccount, type Cheque } from "./bank.schema";
import type { ChequeCreateInput } from "./BankAccounts";

export const createBankAccount = async (data: BankAccount) => {
  const response = await sendApiRequest<BankAccount>("/bank-accounts", {
    method: "POST",
    withAuthorization: true,
    data,
  });
  return response;
};

export const fetchAllBankAccounts = async () => {
  const response = await sendApiRequest<BankAccount[]>("/bank-accounts", {
    method: "GET",
    withAuthorization: true,
  });
  return response;
};

export const updateBankAccount = async (id: string, data: BankAccount) => {
  const response = await sendApiRequest<BankAccount>(`/bank-accounts/${id}`, {
    method: "PATCH",
    withAuthorization: true,
    data,
  });
  return response;
};

export const deleteBankAccount = async (id: string) => {
  const response = await sendApiRequest(`/bank-accounts/${id}`, {
    method: "DELETE",
    withAuthorization: true,
  });
  return response;
};

export const createCheques = async (
  accountId: string,
  data: ChequeCreateInput,
) => {
  const response = await sendApiRequest(
    `/bank-accounts/${accountId}/cheques/batch`,
    {
      method: "POST",
      withAuthorization: true,
      data,
    },
  );
  return response;
};

export const fetchCheques = async (accountId: string) => {
  const response = await sendApiRequest<Cheque[]>(
    `/bank-accounts/${accountId}/cheques`,
    {
      method: "GET",
      withAuthorization: true,
    },
  );
  return response;
};

export const updateChequeStatus = async (
  accountId: string,
  chequeId: string,
  data: Pick<Cheque, "status">,
) => {
  const response = await sendApiRequest<Cheque>(
    `/bank-accounts/${accountId}/cheques/${chequeId}`,
    {
      method: "PATCH",
      withAuthorization: true,
      data,
    },
  );
  return response;
};
