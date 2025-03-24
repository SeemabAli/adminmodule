import { sendApiRequest } from "@/common/services/api.service";
import { type BankAccount } from "./bank.schema";

export const createBankAccount = async (data: BankAccount) => {
  const response = await sendApiRequest("/bank-accounts", {
    method: "POST",
    withAuthorization: true,
    data,
  });
  return response;
};

export const fetchAllBankAccounts = async () => {
  const response = await sendApiRequest("/bank-accounts", {
    method: "GET",
    withAuthorization: true,
  });
  return response;
};

export const updateBankAccount = async (id: string, data: BankAccount) => {
  const response = await sendApiRequest(`/bank-accounts/${id}`, {
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
